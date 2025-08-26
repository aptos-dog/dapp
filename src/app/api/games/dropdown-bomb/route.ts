// src/app/api/dropdown-bomb/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use service role for writes
);

export async function POST(req: Request) {
  try {
    const { wallet, xpEarned } = await req.json();

    if (!wallet || xpEarned === undefined) {
      return NextResponse.json(
        { error: "Missing wallet or xpEarned" },
        { status: 400 }
      );
    }

    // Update XP in profiles
    const { data, error } = await supabase
      .from("profiles")
      .update({ xp: supabase.rpc("increment", { x: xpEarned }) }) // safer way if you create an increment function
      .eq("wallet", wallet)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
