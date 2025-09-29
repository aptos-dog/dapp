/// src/app/api/checkin/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer"; // ✅ server-only import

const COOLDOWN_HOURS = 12;
const XP_REWARD = 5;

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // get current profile
    const { data: profile, error: profileErr } = await supabaseServer
      .from("profiles")
      .select("id, xp, last_checkin")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    let nextAvailable: Date | null = null;

    if (profile.last_checkin) {
      const last = new Date(profile.last_checkin);
      nextAvailable = new Date(last.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000);
      if (now < nextAvailable) {
        return NextResponse.json(
          {
            success: false,
            error: "Check-in not available yet",
            nextAvailable,
          },
          { status: 400 }
        );
      }
    }

    // update xp and last_checkin
    const newXp = (profile.xp || 0) + XP_REWARD;

    const { error: updateErr } = await supabaseServer
      .from("profiles")
      .update({
        xp: newXp,
        last_checkin: now.toISOString(),
      })
      .eq("id", userId);

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: "Failed to update check-in" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      xpAwarded: XP_REWARD,
      newXp,
      nextAvailable: new Date(
        now.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000
      ).toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
