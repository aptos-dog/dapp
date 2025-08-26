import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseQuest";

// =====================
// GET /api/leaderboard
// Fetch top players sorted by XP (with live rank)
// =====================
export async function GET() {
  try {
    // use RPC to call a Postgres SQL expression
    const { data, error } = await supabaseServer.rpc("get_leaderboard");

    if (error) {
      console.error("Leaderboard fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Leaderboard API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
