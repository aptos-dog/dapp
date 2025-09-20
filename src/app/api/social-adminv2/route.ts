import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const correct = process.env.SOCIAL_ADMIN_CODE;

  if (!correct) {
    return NextResponse.json(
      { error: "SOCIAL_ADMIN_CODE not set on server" },
      { status: 500 }
    );
  }

  if (password === correct) {
    // ✅ Create a response and attach a secure, httpOnly cookie
    const res = NextResponse.json({ ok: true });
    res.cookies.set("sd_admin", "1", {
      httpOnly: true,      // not accessible to JS
      secure: process.env.NODE_ENV === "production", // only https in prod
      sameSite: "lax",
      path: "/",           // <– important so all /api/* routes see it
      maxAge: 60 * 60 * 6, // 6-hour session
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
