import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ------------------------------------------
   Supabase client (service role)
------------------------------------------- */
function getSupabaseClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_URL_LOCAL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL ||
    null;

  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null;

  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key);
}

/* ------------------------------------------
   Admin password check
------------------------------------------- */
function isAdmin(req: Request): boolean {
  const headerPass = req.headers.get("x-admin-password");
  const adminPass = process.env.ADMIN_PASSWORD; // set in .env.local
  return Boolean(adminPass && headerPass === adminPass);
}

/* ------------------------------------------
   GET  /api/token-tasks
   - With correct header: returns ALL tasks (admin view)
   - Without header: returns only ACTIVE tasks (user dashboard)
   - With WRONG header: 401 Unauthorized
------------------------------------------- */
export async function GET(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const headerPass = req.headers.get("x-admin-password");
    const adminPass = process.env.ADMIN_PASSWORD;

    // Case 1: password provided but wrong → reject
    if (headerPass && headerPass !== adminPass) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Case 2: correct password → admin
    const admin = Boolean(headerPass && headerPass === adminPass);

    const query = supabase
      .from("token_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    // Case 3: no admin → only active tasks
    if (!admin) {
      query.eq("active", true);
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

/* ------------------------------------------
   POST /api/token-tasks
   - Create or update a task (admin only)
------------------------------------------- */
export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { id, title, contract, chain, points, active } = body;
    if (!title || !contract) {
      return NextResponse.json(
        { error: "Title and contract required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    let result;
    if (id) {
      // Update existing
      result = await supabase
        .from("token_tasks")
        .update({ title, contract, chain, points, active })
        .eq("id", id)
        .select()
        .single();
    } else {
      // Insert new
      result = await supabase
        .from("token_tasks")
        .insert([{ title, contract, chain, points, active }])
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

/* ------------------------------------------
   DELETE /api/token-tasks
   - Delete a task by id (admin only)
------------------------------------------- */
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

