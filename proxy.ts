import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/admin"],
  COACH: ["/coach"],
  CLIENT: ["/client", "/onboarding"],
};

const ROLE_API_ROUTES: Record<string, string[]> = {
  ADMIN: ["/api/admin"],
  COACH: ["/api/coach"],
  CLIENT: ["/api/client", "/api/subscription"],
};

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  COACH: "/coach",
  CLIENT: "/client",
};

// Page routes that are always public
const PUBLIC_PAGE_PREFIXES = [
  "/login", "/register", "/verify-email", "/reset-password",
  "/pricing", "/programs", "/bundles", "/club", "/quiz",
  "/free-guide", "/transformations", "/terms", "/privacy",
  "/refund-policy", "/coming-soon",
];

// API routes that are always public (no auth required)
const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/health",
  "/api/public",
  "/api/webhooks",
  "/api/brand-assets",
  "/api/analytics",
];

// API routes that require authentication but are not role-specific
const AUTHENTICATED_API_PREFIXES = [
  "/api/media",
  "/api/upload",
  "/api/notifications",
];

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not set");
  return new TextEncoder().encode(secret);
}

async function getRoleFromToken(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("authjs.session-token")?.value
    ?? request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  // ─── Static assets and files ────────────────────────────────────────────
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // ─── Public page routes ─────────────────────────────────────────────────
  if (!isApiRoute) {
    if (pathname === "/" || PUBLIC_PAGE_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
  }

  // ─── Public API routes ──────────────────────────────────────────────────
  if (isApiRoute && PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ─── Authentication check ───────────────────────────────────────────────
  const role = await getRoleFromToken(request);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!role) {
    if (isAuthPage) return NextResponse.next();

    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Redirect authenticated users away from auth pages ──────────────────
  if (isAuthPage) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", request.url));
  }

  // ─── Role-based page route protection ───────────────────────────────────
  if (!isApiRoute) {
    for (const [routeRole, prefixes] of Object.entries(ROLE_ROUTES)) {
      if (prefixes.some((p) => pathname.startsWith(p)) && role !== routeRole) {
        // Allow ADMIN access to any role's routes
        if (role !== "ADMIN") {
          return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", request.url));
        }
      }
    }
  }

  // ─── Role-based API route protection ────────────────────────────────────
  if (isApiRoute) {
    for (const [routeRole, prefixes] of Object.entries(ROLE_API_ROUTES)) {
      if (prefixes.some((p) => pathname.startsWith(p))) {
        if (role !== routeRole && role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    // For authenticated-only API routes, require a valid session
    if (AUTHENTICATED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    // For any other API route not in public lists, require authentication
    // (This catches any new API routes that haven't been explicitly categorized)
    if (!PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
