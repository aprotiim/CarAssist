import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.has("carassist_auth");
  const { pathname } = request.nextUrl;

  // Public routes — always allowed
  if (pathname.startsWith("/api/auth") || pathname === "/landing") {
    return NextResponse.next();
  }

  // Login page — redirect logged-in users to home
  if (pathname === "/login") {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // All other routes — require auth, redirect to landing if not logged in
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/landing", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
