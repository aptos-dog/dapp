import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  // expire the cookie
  res.cookies.set("sd_admin", "", { maxAge: 0, path: "/" });
  return res;
}
