import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ server-side only
);

export async function GET() {
  try {
    // ✅ Get users sorted by XP (highest first)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, xp, invite_count, wallet")
      .order("xp", { ascending: false });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // ✅ Attach rank based on sorted order
    const ranked = data.map((user, index) => ({
      rank: index + 1, // 1 = highest xp
      id: user.id,
      username: user.username,
      xp: user.xp,
      invite_count: user.invite_count,
      wallet: user.wallet,
    }));

    return NextResponse.json(ranked, { status: 200 });
  } catch (err: any) {
    console.error("❌ Unexpected error in leaderboard:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
