import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// GET all tasks
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") === "true";

  let query = supabaseServer.from("social_tasks").select("*").order("created_at", { ascending: false });
  if (activeOnly) query = query.eq("active", true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, tasks: data || [] });
}

// POST: mark task complete for user + add XP
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, task_id } = body;

    if (!user_id || !task_id) {
      return NextResponse.json({ success: false, error: "Missing user_id or task_id" }, { status: 400 });
    }

    // Fetch task for points
    const { data: task, error: taskErr } = await supabaseServer
      .from("social_tasks")
      .select("id, points")
      .eq("id", task_id)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    // Record progress
    const { data: progress, error: progressErr } = await supabaseServer
      .from("user_social_progress")
      .insert([{ user_id, task_id, completed: true, completed_at: new Date().toISOString() }])
      .select()
      .single();

    if (progressErr) {
      return NextResponse.json({ success: false, error: progressErr.message }, { status: 500 });
    }

    // Increment XP via RPC
    const { error: xpErr } = await supabaseServer.rpc("increment_xp", {
      uid: user_id,
      pts: task.points,
    });

    if (xpErr) {
      return NextResponse.json({ success: false, error: xpErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress, earned: task.points });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
