// src/app/api/token-claim/route.ts

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { AptosClient } from "aptos";

const COOLDOWN_HOURS = 24;
const XP_PER_TOKEN = 500;
const MIN_APT = 0.01;
const MIN_TOKEN = 10;
const MIN_NFT = 1;

const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");

// helper to normalize hex strings/addresses
function normalizeHex(s: string | undefined): string {
  return (s || "").toLowerCase();
}

// Fetch decimals for a token via its CoinInfo resource
async function fetchTokenDecimals(contractFull: string): Promise<number> {
  try {
    const coinInfoType = `0x1::coin::CoinInfo<${contractFull}>`;
    const [moduleAddress] = contractFull.split("::");
    const resource = await client.getAccountResource(moduleAddress, coinInfoType);
    if (resource && (resource as any).data && typeof (resource as any).data.decimals === "number") {
      return (resource as any).data.decimals;
    }
  } catch (err) {
    console.warn("Could not fetch CoinInfo for", contractFull, err);
  }
  return 8; // fallback default
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const { data: profile, error } = await supabaseServer
      .from("profiles")
      .select("id, wallet, xp, last_token_claim, role")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, walletAddress, task, taskId } = await req.json();
    if (!userId || !walletAddress) {
      return NextResponse.json({ success: false, error: "Missing userId or walletAddress" }, { status: 400 });
    }

    // load user profile
    const { data: profile, error: profileErr } = await supabaseServer
      .from("profiles")
      .select("id, xp, last_token_claim")
      .eq("id", userId)
      .single();
    if (profileErr || !profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    // cooldown
    const now = new Date();
    if (profile.last_token_claim) {
      const last = new Date(profile.last_token_claim);
      const nextAvail = new Date(last.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000);
      if (now < nextAvail) {
        return NextResponse.json(
          { success: false, error: "Claim not available yet", nextAvailable: nextAvail },
          { status: 400 }
        );
      }
    }

    // fetch all on-chain resources for wallet
    const resources = await client.getAccountResources(walletAddress);

    // Debug: log the types for inspection
    try {
      console.log("Resources types:", resources.map((r: any) => r.type));
    } catch {}

    let hasAsset = false;
    let points = XP_PER_TOKEN;

    // ------ APT check ------
if (task === "APT") {
  const resource = resources.find((r: any) =>
    r.type.toLowerCase().includes("0x1::aptos_coin::aptoscoin")
  );
  if (!resource) {
    return NextResponse.json({ success: false, error: "APT coin store not present" }, { status: 400 });
  }
  const raw = (resource as any).data.coin.value;
  const bal = Number(raw) / 10 ** 8;  // APT uses 8 decimals
  console.log("APT balance raw:", raw, "converted:", bal);
  if (isNaN(bal)) {
    return NextResponse.json({ success: false, error: "Unable to parse APT balance" }, { status: 500 });
  }
  if (bal >= MIN_APT) {
    hasAsset = true;
  } else {
    return NextResponse.json({ success: false, error: `APT balance too low (${bal})` }, { status: 400 });
  }
}

    // ------ Secondary task (token or NFT) ------
    if (taskId) {
      const { data: taskData, error: taskErr } = await supabaseServer
        .from("token_tasks")
        .select("id, contract, points")
        .eq("id", taskId)
        .single();

      if (taskErr || !taskData) {
        return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
      }
      points = taskData.points || XP_PER_TOKEN;

      const contractFull = taskData.contract;
      if (!contractFull) {
        return NextResponse.json({ success: false, error: "Invalid token contract in task" }, { status: 400 });
      }

      // 1. fungible token check
      const coinStoreType = `0x1::coin::CoinStore<${contractFull}>`;
      const tokenResource = resources.find((r: any) => r.type === coinStoreType);
      if (tokenResource) {
        const decimals = await fetchTokenDecimals(contractFull);
        const raw = (tokenResource as any).data.coin.value;
        const bal = Number(raw) / 10 ** decimals;
        console.log(`Token ${contractFull} balance raw=${raw} decimals=${decimals} bal=${bal}`);
        if (!isNaN(bal) && bal > MIN_TOKEN) {
          hasAsset = true;
        } else {
          // if the resource exists but amount is small, you can error early or allow NFT fallback
          console.log("Token balance is present but insufficient:", bal);
        }
      } else {
        console.log("No fungible token resource for", contractFull);
      }

      // 2. NFT check fallback
      if (!hasAsset) {
        // use Aptos SDK method if supported to fetch owned tokens
        let accountTokens: any[] = [];
        try {
          if (typeof (client as any).getAccountOwnedTokens === "function") {
            accountTokens = await (client as any).getAccountOwnedTokens({ accountAddress: walletAddress });
            console.log("Owned tokens via getAccountOwnedTokens:", accountTokens.length);
          }
        } catch (err) {
          console.warn("getAccountOwnedTokens failed:", err);
        }

        const norm = normalizeHex(contractFull);
        if (Array.isArray(accountTokens) && accountTokens.length > 0) {
          const owns = accountTokens.some((tk: any) => {
            const cr = normalizeHex(tk.token_data_id?.creator);
            const coll = normalizeHex(tk.token_data_id?.collection);
            const nm = normalizeHex(tk.token_data_id?.name);
            return cr === norm || coll === norm || nm === norm;
          });
          if (owns) {
            hasAsset = true;
          }
        }

        // fallback: scan TokenStore resource in `resources`
        if (!hasAsset) {
          const nftStore = resources.find((r: any) => (r.type as string).includes("0x3::token::TokenStore"));
          if (nftStore) {
            // depending on SDK shape, tokens might be under `data.tokens` or `data.token_data` etc.
            const arr = (nftStore as any).data.tokens || (nftStore as any).data.token_data || [];
            if (Array.isArray(arr)) {
              const owns = arr.some((t: any) => {
                const cr = normalizeHex(t.id?.token_data_id?.creator);
                const coll = normalizeHex(t.id?.token_data_id?.collection);
                const nm = normalizeHex(t.id?.token_data_id?.name);
                return cr === norm || coll === norm || nm === norm;
              });
              if (owns) hasAsset = true;
            }
          }
        }
      }
    }

    if (!hasAsset) {
      return NextResponse.json({ success: false, error: "You do not hold the required asset" }, { status: 400 });
    }

    // success: update XP, last claim
    const newXp = (profile.xp || 0) + points;
    const { error: updateErr } = await supabaseServer
      .from("profiles")
      .update({
        xp: newXp,
        role: "holder",
        last_token_claim: now.toISOString(),
      })
      .eq("id", userId);

    if (updateErr) {
      return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      xpEarned: points,
      newXp,
      nextAvailable: new Date(now.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString(),
    });
  } catch (e: any) {
    console.error("Token claim error:", e);
    return NextResponse.json({ success: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
