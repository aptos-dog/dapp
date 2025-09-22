import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ------------------------------
// Supabase client
// ------------------------------
function getSupabaseClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_URL_LOCAL ||
    null;

  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null;

  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key);
}

// ------------------------------
// Admin check
// ------------------------------
function isAdmin(req: Request): boolean {
  const headerPass = req.headers.get("x-admin-password");
  const adminPass = process.env.ADMIN_PASSWORD;
  return Boolean(adminPass && headerPass === adminPass);
}

// ------------------------------
// GET tasks
// ------------------------------
export async function GET(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const headerPass = req.headers.get("x-admin-password");
    const adminPass = process.env.ADMIN_PASSWORD;

    if (headerPass && headerPass !== adminPass) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = Boolean(headerPass && headerPass === adminPass);

    let query;
    if (admin) {
      // Admins get everything
      query = supabase
        .from("token_tasks")
        .select("*")
        .order("created_at", { ascending: false });
    } else {
      // Users only get active tasks with the safe fields
      query = supabase
        .from("token_tasks")
        .select("id, title, contract, type, points, active")
        .eq("active", true)
        .order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error (GET):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: data || [], admin }, { status: 200 });
  } catch (err: any) {
    console.error("API crash (GET):", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}

// ------------------------------
// POST create/update task
// ------------------------------
export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { id, title, contract, type, points, active } = body;

    if (!title || !contract || !type) {
      return NextResponse.json(
        { error: "Title, contract, and type required" },
        { status: 400 }
      );
    }

    if (!["nft", "token"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type, must be 'nft' or 'token'" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    let result;
    if (id) {
      result = await supabase
        .from("token_tasks")
        .update({
          title,
          contract,
          type,
          points,
          active: active ?? true,
        })
        .eq("id", id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("token_tasks")
        .insert([
          {
            title,
            contract,
            type,
            points,
            active: active ?? true,
          },
        ])
        .select()
        .single();
    }

    if (result.error) {
      console.error("Supabase error (POST):", result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ task: result.data, success: true });
  } catch (err: any) {
    console.error("API crash (POST):", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}

// ------------------------------
// DELETE task
// ------------------------------
export async function DELETE(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("token_tasks")
      .delete()
      .eq("id", body.id);

    if (error) {
      console.error("Supabase error (DELETE):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API crash (DELETE):", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
