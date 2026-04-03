import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Check if the path is a dashboard path with a slug
    if (pathname.startsWith("/dashboard/")) {
      const parts = pathname.split("/");
      const slugFromUrl = parts[2];
      const isSettingsPage = parts[3] === "settings";
      const userOrgSlug = token?.orgSlug as string;
      const userRole = token?.role as string;

      // 1. Tenant Isolation: If the user's orgSlug doesn't match the URL slug, redirect to their dashboard
      if (
        userOrgSlug &&
        slugFromUrl &&
        slugFromUrl !== "unauthorized" &&
        slugFromUrl !== userOrgSlug
      ) {
        return NextResponse.redirect(
          new URL(`/dashboard/${userOrgSlug}`, req.url)
        );
      }

      // 2. RBAC Guard: If they try to access /settings and are NOT an owner, redirect to unauthorized
      if (isSettingsPage && userRole !== "owner") {
        return NextResponse.redirect(
          new URL("/dashboard/unauthorized", req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - login (login page)
     * - register (registration page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    "/((?!api/auth|login|register|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
