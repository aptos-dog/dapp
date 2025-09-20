import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Lazy init Supabase client.
 * Uses only the service-role key so it can bypass RLS.
 */
function getSupabaseClientOrNull() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_URL_LOCAL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL ||
    null;

  const key = process.env.SUPABASE_SERVICE_KEY || null;
  if (!url || !key) return null;

  return createClient(url, key);
}

/** Strict admin cookie check (matches your login route) */
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("sd_admin")?.value === "1";
}


/**
 * GET /api/token-tasks
 * Returns all tasks. Requires admin cookie.
 */
export async function GET() {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseClientOrNull();
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Server not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.",
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("token_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error (GET):", error);
      return NextResponse.json(
        { error: error.message || "Supabase error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks: data || [] });
  } catch (err: any) {
    console.error("API crash (GET):", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/token-tasks
 * Create or update a task. Requires admin cookie.
 */
export async function POST(req: Request) {
  try {
    if (!isAdmin()) {
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

    const supabase = getSupabaseClientOrNull();
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Server not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.",
        },
        { status: 500 }
      );
    }

    let result;
    if (id) {
      result = await supabase
        .from("token_tasks")
        .update({ title, contract, chain, points, active })
        .eq("id", id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("token_tasks")
        .insert([{ title, contract, chain, points, active }])
        .select()
        .single();
    }

    if (result.error) {
      console.error("Supabase error (POST):", result.error);
      return NextResponse.json(
        { error: result.error.message || "Supabase error" },
        { status: 500 }
      );
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

/**
 * DELETE /api/token-tasks
 * Delete a task by id. Requires admin cookie.
 */
export async function DELETE(req: Request) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const supabase = getSupabaseClientOrNull();
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Server not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.",
        },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from("token_tasks")
      .delete()
      .eq("id", body.id);

    if (error) {
      console.error("Supabase error (DELETE):", error);
      return NextResponse.json(
        { error: error.message || "Supabase error" },
        { status: 500 }
      );
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
