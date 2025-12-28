import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("__chatLegis__")?.value;
  const authHeader = request.headers.get("authorization");

  const publicPaths = [
    "/",
    "/contact",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/verify-otp",
  ];

  const apiPublicPaths = [
    "/api/auth",
    "/api/issue",
    "/api/user",
    "/api/public",
  ];

  const isApiAllowed = apiPublicPaths.some((path) => pathname.startsWith(path));

  if (isApiAllowed || authHeader?.startsWith("Bearer ")) {
    return NextResponse.next();
  }

  if (publicPaths.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/cl/chatscreen", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    if (pathname !== "/auth/login") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure the matcher to specify which paths the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Specific static assets like .svg, .png, .jpg, etc., in the public folder.
     * This ensures the middleware runs on page routes and relevant API routes
     * while excluding static assets for performance.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$).*)",
  ],
};
