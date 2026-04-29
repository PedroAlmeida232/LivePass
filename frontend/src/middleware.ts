import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedPaths = ["/checkout", "/tickets", "/scanner", "/dashboard"];

  // Routes exclusive to STAFF
  const staffPaths = ["/scanner"];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isStaffRoute = staffPaths.some((path) => pathname.startsWith(path));
  
  const hasToken = !!token;

  // Redirect unauthenticated users from protected routes to /login
  if (isProtected && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protection for STAFF routes
  if (isStaffRoute && token) {
    try {
      // Manual JWT decode for role verification
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      if (payload.role !== "STAFF") {
        // Customers trying to access staff area are redirected to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (e) {
      console.error("Middleware JWT decode error:", e);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/tickets/:path*",
    "/scanner/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
