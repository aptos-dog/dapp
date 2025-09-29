import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ success: false, error: "Code required" }, { status: 400 });
    }

    if (code !== process.env.SOCIAL_ADMIN_CODE) {
      return NextResponse.json({ success: false, error: "Invalid code" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("sd_admin", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8h
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
