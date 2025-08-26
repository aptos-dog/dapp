import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseQuest";

/**
 * Marks a social task as completed and adds XP to the user
 */
export async function POST(req: Request) {
  try {
    const { userId, taskId } = await req.json();

    if (!userId || !taskId) {
      return NextResponse.json(
        { success: false, error: "userId and taskId are required" },
        { status: 400 }
      );
    }

    // 1. Call your Supabase function to track task completion
    const { error: completeError } = await supabaseServer.rpc("complete_task", {
      userid: userId,
      taskid: taskId,
    });

    if (completeError) {
      return NextResponse.json(
        { success: false, error: completeError.message },
        { status: 500 }
      );
    }

    // 2. Increment XP directly (atomic update in SQL)
    const { error: xpError } = await supabaseServer.rpc("increment_user_xp", {
      userid: userId,
      amount: 10,
    });

    if (xpError) {
      return NextResponse.json(
        { success: false, error: xpError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task completed +10 XP awarded",
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
