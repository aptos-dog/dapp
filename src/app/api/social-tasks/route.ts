import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseQuest";

// GET all tasks (for admin & users)
export async function GET() {
  const { data, error } = await supabaseServer
    .from("social_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, tasks: data || [] });
}

// POST create or update task (ADMIN)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, platform, url, points = 0, active = true } = body;

    if (!title || !platform || !url) {
      return NextResponse.json({ success: false, error: "title, platform, url are required" }, { status: 400 });
    }

    let query;
    if (id) {
      query = supabaseServer
        .from("social_tasks")
        .update({ title, platform, url, points, active })
        .eq("id", id)
        .select()
        .single();
    } else {
      query = supabaseServer
        .from("social_tasks")
        .insert([{ title, platform, url, points, active }])
        .select()
        .single();
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, task: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
