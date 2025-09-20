import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE env (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY).");
  }
  return createClient(url, key);
}

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("sd_admin")?.value === "1";
}

// ✅ Correct Next.js 15 style
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 params is now wrapped in a Promise
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // 👈 must `await` params
    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("token_tasks").delete().eq("id", id);

    if (error) {
      console.error("Supabase error (DELETE /[id]):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API crash (DELETE /[id]):", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
