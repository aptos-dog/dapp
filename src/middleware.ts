import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Read password from header
  const providedPassword = req.headers.get("x-admin-password");
  const correctPassword = process.env.ADMIN_PASSWORD; // store securely in .env

  // Only protect token-tasks API routes
  if (req.nextUrl.pathname.startsWith("/api/token-tasks")) {
    if (!providedPassword || providedPassword !== correctPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

/**
 * Limit this middleware only to /api/token-tasks routes
 */
export const config = {
  matcher: ["/api/token-tasks/:path*"],
};
