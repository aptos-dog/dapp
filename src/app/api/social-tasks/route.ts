import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseQuest";

// ✅ GET tasks + completed for user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // fetch all tasks
    const { data: tasks, error: tasksError } = await supabaseServer
      .from("social_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (tasksError) {
      return NextResponse.json(
        { success: false, error: tasksError.message },
        { status: 500 }
      );
    }

    // fetch completed tasks for this user
    let completed: string[] = [];
    if (userId) {
      const { data: done, error: doneError } = await supabaseServer
        .from("user_social_progress")
        .select("task_id")
        .eq("user_id", userId);

      if (doneError) {
        return NextResponse.json(
          { success: false, error: doneError.message },
          { status: 500 }
        );
      }

      completed = done?.map((row) => row.task_id) || [];
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
      completed,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// ✅ POST create or update task (ADMIN)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, platform, url, points = 0, active = true } = body;

    if (!title || !platform || !url) {
      return NextResponse.json(
        { success: false, error: "title, platform, url are required" },
        { status: 400 }
      );
    }

    let query;
    if (id) {
      // update existing task
      query = supabaseServer
        .from("social_tasks")
        .update({ title, platform, url, points, active })
        .eq("id", id)
        .select()
        .single();
    } else {
      // insert new task
      query = supabaseServer
        .from("social_tasks")
        .insert([{ title, platform, url, points, active }])
        .select()
        .single();
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, task: data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE task by ID (ADMIN)
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Task ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("social_tasks")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
