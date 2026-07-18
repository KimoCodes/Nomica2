import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { ROLE_DASHBOARD } from "@/constants/routes";

const { auth } = NextAuth(authConfig);

const protectedPrefixes = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/coach", role: "COACH" },
  { prefix: "/client", role: "CLIENT" },
  { prefix: "/onboarding", role: "CLIENT" },
  { prefix: "/settings", role: null },
] as const;

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const userRole = req.auth?.user?.role;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuthRoute && isLoggedIn && userRole) {
    const dashboard = ROLE_DASHBOARD[userRole] ?? "/client";
    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  for (const route of protectedPrefixes) {
    if (!pathname.startsWith(route.prefix)) {
      continue;
    }

    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (route.role && userRole !== route.role) {
      const dashboard = userRole ? ROLE_DASHBOARD[userRole] : "/login";
      return NextResponse.redirect(new URL(dashboard ?? "/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/coach/:path*",
    "/client/:path*",
    "/onboarding/:path*",
    "/onboarding",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
