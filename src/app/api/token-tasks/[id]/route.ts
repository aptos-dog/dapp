import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE env (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY).");
  return createClient(url, key);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("token_tasks").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API crash (DELETE /[id]):", err);
    return NextResponse.json({ error: err?.message || "Unexpected server error" }, { status: 500 });
  }
}
