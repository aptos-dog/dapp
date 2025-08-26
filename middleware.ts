import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_API_PREFIXES = ["/api/social-tasks"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login route always
  if (pathname.startsWith("/api/social-admin/login")) {
    return NextResponse.next();
  }

  // Protect the admin APIs
  if (PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const cookie = req.cookies.get("sd_admin")?.value;
    if (cookie !== "1") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"], // only runs for API routes
};
