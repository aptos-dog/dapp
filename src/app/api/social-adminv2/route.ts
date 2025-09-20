import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({}));
    const correct = process.env.SOCIAL_ADMIN_CODE;

    if (!correct) {
      return NextResponse.json(
        { error: "SOCIAL_ADMIN_CODE not set on server" },
        { status: 500 }
      );
    }

    if (password !== correct) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Create response and set site-wide cookie
    const res = NextResponse.json({ ok: true });
    res.cookies.set("sd_admin", "1", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false, // ✅ works in dev + prod
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 6,
});

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
