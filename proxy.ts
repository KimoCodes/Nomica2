import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/admin"],
  COACH: ["/coach"],
  CLIENT: ["/client", "/onboarding"],
};

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  COACH: "/coach",
  CLIENT: "/client",
};

const PUBLIC_PREFIXES = ["/login", "/register", "/verify-email", "/api", "/_next", "/pricing", "/programs", "/bundles", "/club", "/quiz", "/free-guide", "/transformations", "/terms", "/privacy", "/refund-policy"];

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

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) || pathname === "/" || pathname.includes(".")) {
    return NextResponse.next();
  }

  const role = await getRoleFromToken(request);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!role) {
    if (isAuthPage) return NextResponse.next();
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", request.url));
  }

  for (const [routeRole, prefixes] of Object.entries(ROLE_ROUTES)) {
    if (prefixes.some((p) => pathname.startsWith(p)) && role !== routeRole) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
