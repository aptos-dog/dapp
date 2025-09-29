// src/app/api/token-claim/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { AptosClient } from "aptos";

const COOLDOWN_HOURS = 24;
const XP_PER_TOKEN = 500;

// Aptos fullnode (mainnet for production, devnet/testnet if testing)
const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");

// -------------------------
// GET: fetch user profile
// -------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabaseServer
      .from("profiles")
      .select("id, wallet, xp, last_token_claim, role")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// -------------------------
// POST: verify & claim XP
// -------------------------
export async function POST(req: Request) {
  try {
    const { userId, walletAddress, task, taskId } = await req.json();

    if (!userId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Missing userId or walletAddress" },
        { status: 400 }
      );
    }

    // fetch user profile
    const { data: profile, error: profileErr } = await supabaseServer
      .from("profiles")
      .select("id, xp, last_token_claim")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // cooldown check
    const now = new Date();
    if (profile.last_token_claim) {
      const last = new Date(profile.last_token_claim);
      const nextAvailable = new Date(
        last.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000
      );
      if (now < nextAvailable) {
        return NextResponse.json(
          { success: false, error: "Claim not available yet", nextAvailable },
          { status: 400 }
        );
      }
    }

    // fetch resources from Aptos
    const resources = await client.getAccountResources(walletAddress);

    let hasAsset = false;
    let points = XP_PER_TOKEN;

    // -------------------------
    // Case 1: Special APT check
    // -------------------------
   if (task === "APT") {
  const aptStore = resources.find(
    (r: any) =>
      r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
  ) as { data: { coin: { value: string } } } | undefined;

  hasAsset = !!(aptStore && Number(aptStore.data.coin.value) > 0);
}


    // -------------------------
    // Case 2: TaskId check (fungible/NFT)
    // -------------------------
    if (taskId) {
      const { data: taskData, error: taskErr } = await supabaseServer
        .from("token_tasks")
        .select("id, contract, points")
        .eq("id", taskId)
        .single();

      if (taskErr || !taskData) {
        return NextResponse.json(
          { success: false, error: "Task not found" },
          { status: 404 }
        );
      }

      points = taskData.points || XP_PER_TOKEN;

      // fungible token check
      const tokenStore = resources.find(
        (r: any) =>
          r.type === `0x1::coin::CoinStore<${taskData.contract}>`
      ) as { data: { coin: { value: string } } } | undefined;

      if (tokenStore && Number(tokenStore.data.coin.value) > 0) {
        hasAsset = true;
      }

      // NFT check (TokenStore)
      const nftStore = resources.find((r: any) =>
        r.type.includes("0x3::token::TokenStore")
      ) as { data: { tokens: any[] } } | undefined;

      if (nftStore) {
        const tokens = nftStore.data.tokens || [];
        const ownsNft = tokens.some(
          (t: any) =>
            t.id?.token_data_id?.creator === taskData.contract ||
            t.id?.token_data_id?.collection === taskData.contract ||
            t.id?.token_data_id?.name === taskData.contract
        );
        if (ownsNft) {
          hasAsset = true;
        }
      }
    }

    // -------------------------
    // Fail if no asset found
    // -------------------------
    if (!hasAsset) {
      return NextResponse.json(
        { success: false, error: "You do not own the required asset" },
        { status: 400 }
      );
    }

    // calculate XP
    const newXp = (profile.xp || 0) + points;

    // update Supabase profile
    const { error: updateErr } = await supabaseServer
      .from("profiles")
      .update({
        xp: newXp,
        role: "holder", // upgrade role
        last_token_claim: now.toISOString(),
      })
      .eq("id", userId);

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      xpEarned: points,
      newXp,
      nextAvailable: new Date(
        now.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000
      ).toISOString(),
    });
  } catch (e: any) {
    console.error("Token claim error:", e);
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
