import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { userId, taskId } = await req.json();

    if (!userId || !taskId) {
      return NextResponse.json(
        { success: false, error: "userId and taskId are required" },
        { status: 400 }
      );
    }

    // 1. Get task info (including points)
    const { data: task, error: taskError } = await supabaseServer
      .from("social_tasks")
      .select("points")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const amount = task.points || 0;

    // 2. Mark task complete
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

    // 3. Increment XP by task.points
    const { data: newXp, error: xpError } = await supabaseServer.rpc(
      "increment_user_xp",
      {
        userid: userId,
        amount,
      }
    );

    if (xpError) {
      return NextResponse.json(
        { success: false, error: xpError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Task completed +${amount} XP awarded`,
      newXp, // return updated XP balance
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

