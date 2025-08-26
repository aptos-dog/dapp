import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseQuest"; // ✅ use your wrapper

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("id, xp, last_checkin")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    console.error("Profile fetch error:", error?.message);
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    profile: data,
  });
}
