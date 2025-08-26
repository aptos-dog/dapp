import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseQuest";

// Normalize wallet
const normWallet = (w?: string) => (w || "").trim().toLowerCase();

/**
 * POST /api/profile
 * Create or fetch a profile by wallet (wallet-connect flow)
 */
export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();
    const w = normWallet(wallet);

    if (!w) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    // Try to fetch existing
    const { data: existing, error: fetchErr } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("wallet", w)
      .maybeSingle();

    if (fetchErr) {
      console.error("Fetch profile error:", fetchErr);
      return NextResponse.json(
        { success: false, error: fetchErr.message || "Database fetch error" },
        { status: 500 }
      );
    }

    if (existing) return NextResponse.json({ success: true, profile: existing });

    // Create minimal row
    const { data: created, error: insertErr } = await supabaseServer
      .from("profiles")
      .insert([{ wallet: w }])
      .select()
      .single();

    if (insertErr) {
      console.error("Insert profile error:", insertErr);
      return NextResponse.json(
        { success: false, error: insertErr.message || "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: created });
  } catch (err: any) {
    console.error("Profile API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * One-time set username (also invite_code) and handle optional referral
 */
export async function PUT(req: Request) {
  try {
    const { wallet, username, referral_code } = await req.json();
    const w = normWallet(wallet);

    if (!w || !username) {
      return NextResponse.json(
        { success: false, error: "Wallet and username required" },
        { status: 400 }
      );
    }

    // Fetch profile
    const { data: profile, error: fetchErr } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("wallet", w)
      .maybeSingle();

    if (fetchErr) {
      console.error("Fetch profile error:", fetchErr);
      return NextResponse.json(
        { success: false, error: fetchErr.message || "Database fetch error" },
        { status: 500 }
      );
    }
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Block if username already set
    if (profile.username || profile.invite_code) {
      return NextResponse.json(
        { success: false, error: "Username already set and cannot be changed" },
        { status: 400 }
      );
    }

    // Referral validation
    let inviter: any = null;
    if (referral_code) {
      if (referral_code === username) {
        return NextResponse.json(
          { success: false, error: "You cannot use your own username as referral code" },
          { status: 400 }
        );
      }

      if (profile.referred_by) {
        return NextResponse.json(
          { success: false, error: "Referral code already used for this account" },
          { status: 400 }
        );
      }

      const { data: foundInviter, error: inviterErr } = await supabaseServer
        .from("profiles")
        .select("*")
        .eq("invite_code", referral_code)
        .maybeSingle();

      if (inviterErr) {
        console.error("Inviter fetch error:", inviterErr);
        return NextResponse.json(
          { success: false, error: inviterErr.message || "Database fetch error" },
          { status: 500 }
        );
      }
      if (!foundInviter) {
        return NextResponse.json(
          { success: false, error: "Invalid referral code" },
          { status: 400 }
        );
      }
      if (foundInviter.wallet === w) {
        return NextResponse.json(
          { success: false, error: "You cannot refer yourself" },
          { status: 400 }
        );
      }

      inviter = foundInviter;
    }

    // Set username + referral
    const { data: afterSet, error: setErr } = await supabaseServer
      .from("profiles")
      .update({
        username,
        invite_code: username,
        ...(inviter ? { referred_by: inviter.username } : {}),
        ...(inviter ? { xp: (profile.xp || 0) + 10 } : {}),
      })
      .eq("wallet", w)
      .select()
      .single();

    if (setErr) {
      console.error("Set username error:", setErr);

      if ((setErr as any).code === "23505") {
        return NextResponse.json(
          { success: false, error: "Username already taken" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, error: setErr.message || "Failed to set username" },
        { status: 500 }
      );
    }

    // Reward inviter
    if (inviter) {
      const { error: inviterUpdateErr } = await supabaseServer
        .from("profiles")
        .update({
          xp: (inviter.xp || 0) + 5,
          invite_count: (inviter.invite_count || 0) + 1,
        })
        .eq("id", inviter.id);

      if (inviterUpdateErr) {
        console.error("Inviter reward update error:", inviterUpdateErr);
      }
    }

    return NextResponse.json({ success: true, profile: afterSet });
  } catch (err: any) {
    console.error("Profile update API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
