// src/app/api/token-claim/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseQuest";
import { AptosClient } from "aptos";

const COOLDOWN_HOURS = 24;
const XP_PER_TOKEN = 500;

// Aptos fullnode (mainnet for production, devnet/testnet if testing)
const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");

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

export async function POST(req: Request) {
  try {
    const { userId, walletAddress } = await req.json();

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

    const now = new Date();
    if (profile.last_token_claim) {
      const last = new Date(profile.last_token_claim);
      const nextAvailable = new Date(
        last.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000
      );
      if (now < nextAvailable) {
        return NextResponse.json(
          {
            success: false,
            error: "Claim not available yet",
            nextAvailable,
          },
          { status: 400 }
        );
      }
    }

    // 🔎 check wallet resources for tokens
    const resources = await client.getAccountResources(walletAddress);
    const tokenResources = resources.filter((r: any) =>
      r.type.includes("0x3::token") // adjust if your NFT uses a custom module
    );

    const tokenCount = tokenResources.length;
    if (tokenCount === 0) {
      return NextResponse.json(
        { success: false, error: "No eligible tokens found" },
        { status: 400 }
      );
    }

    const xpEarned = tokenCount * XP_PER_TOKEN;
    const newXp = (profile.xp || 0) + xpEarned;

    // update Supabase profile
    const { error: updateErr } = await supabaseServer
      .from("profiles")
      .update({
        xp: newXp,
        role: "holder", // 👑 upgrade role
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
      xpEarned,
      newXp,
      tokenCount,
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
