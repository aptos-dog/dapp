import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer"; // ✅ your Supabase wrapper

// GET /api/profile/[id]
export async function GET(
  req: Request,
  context: any // 👈 loosen type so build passes
) {
  const { id } = context.params;

  const { data, error } = await supabaseServer
    .from("profiles")
    .select("id, xp, last_checkin")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Profile fetch error:", error?.message);
    return NextResponse.json(
      { success: false, error: "Profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    profile: data,
  });
}
