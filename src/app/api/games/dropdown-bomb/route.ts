import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { wallet, xpEarned } = await req.json();

    if (!wallet || typeof xpEarned !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Call the Postgres function increment_xp(wallet, points)
    const { error } = await supabase.rpc("increment_xp", {
      wallet_address: wallet,
      points: xpEarned,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error incrementing XP:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
