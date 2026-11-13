import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Prisma, WebsiteAccessMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";
import {
  PUBLIC_API_PREFIXES,
  PUBLIC_PAGE_PREFIXES,
  getEffectiveAccessMode,
  isProtectedRoute,
  isSiteAccessAllowed,
  normalizeClientIp,
} from "@/lib/site-access";

type AuthenticatedIdentity = {
  role: string;
  email: string | null;
};

type SiteAccessConfigRow = {
  id: string;
  websiteAccessMode: string;
  publicAccessRestrictionEnabled: boolean;
  comingSoonAutoSwitch: boolean;
  comingSoonLaunchAt: Date | null;
  maintenanceReturnAt: Date | null;
  approvedIpAddresses: Array<{ value: string }>;
};

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  COACH: "/coach",
  CLIENT: "/client",
};

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

const AUTHENTICATED_API_PREFIXES = [
  "/api/media",
  "/api/upload",
  "/api/notifications",
];

// Site access config rarely changes; caching it keeps the proxy from adding a
// database round trip (and its latency) to every single request.
const SITE_ACCESS_CACHE_TTL_MS = 15_000;
let siteAccessCache: { config: SiteAccessConfigRow | null; expiresAt: number } | null = null;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

async function getIdentityFromToken(request: NextRequest): Promise<AuthenticatedIdentity | null> {
  const token =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (typeof payload.role !== "string") return null;
    return {
      role: payload.role,
      email: typeof payload.email === "string" ? payload.email : null,
    };
  } catch {
    return null;
  }
}

async function querySiteAccessConfig(): Promise<SiteAccessConfigRow | null> {
  return prisma.siteSettings.findFirst({
    select: {
      id: true,
      websiteAccessMode: true,
      publicAccessRestrictionEnabled: true,
      comingSoonAutoSwitch: true,
      comingSoonLaunchAt: true,
      maintenanceReturnAt: true,
      approvedIpAddresses: {
        select: { value: true },
      },
    },
  });
}

/**
 * Reads the site access config with a short-lived cache.
 *
 * Never throws: a database outage must not take the whole site down, so on any
 * error we fall back to the last known value (or `null`, which fails open).
 */
async function getSiteAccessConfig(): Promise<SiteAccessConfigRow | null> {
  if (siteAccessCache && Date.now() < siteAccessCache.expiresAt) {
    return siteAccessCache.config;
  }

  try {
    const config = await querySiteAccessConfig();
    siteAccessCache = { config, expiresAt: Date.now() + SITE_ACCESS_CACHE_TTL_MS };
    return config;
  } catch (error) {
    // Cache the failure briefly so a database outage does not turn every
    // request into a slow failing query; meanwhile we keep serving (fail open).
    siteAccessCache = {
      config: siteAccessCache?.config ?? null,
      expiresAt: Date.now() + 5_000,
    };

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022") {
      logger.warn(
        { errorCode: error.code, model: error.meta?.modelName },
        "Site access settings are unavailable because the database migration has not been applied",
      );
      return siteAccessCache.config;
    }

    logger.error({ err: error }, "Failed to read site access settings; failing open");
    return siteAccessCache.config;
  }
}

/**
 * Persists an expired COMING_SOON/MAINTENANCE mode as NORMAL so the admin UI
 * converges with what is actually being served. Best effort only — a failure
 * here never blocks the request, because `getEffectiveAccessMode` already
 * opens the site at read time.
 */
async function persistEffectiveAccessMode(config: SiteAccessConfigRow | null) {
  if (!config) return;

  const effective = getEffectiveAccessMode(config);
  if (effective === config.websiteAccessMode) return;

  const from = toWebsiteAccessMode(config.websiteAccessMode);
  const to = toWebsiteAccessMode(effective);
  if (!from || !to) return;

  try {
    await prisma.siteSettings.updateMany({
      where: { id: config.id, websiteAccessMode: from },
      data: { websiteAccessMode: to, lastAccessConfigUpdatedAt: new Date() },
    });
    siteAccessCache = null;
    logger.info({ from, to }, "Auto-switched website access mode");
  } catch (error) {
    logger.warn({ err: error }, "Could not persist auto-switched website access mode");
  }
}

function toWebsiteAccessMode(value: string): WebsiteAccessMode | null {
  if (value === "NORMAL" || value === "COMING_SOON" || value === "MAINTENANCE") {
    return WebsiteAccessMode[value];
  }
  return null;
}

function isPublicPath(pathname: string) {
  if (pathname === "/") {
    return true;
  }

  if (pathname.startsWith("/api/")) {
    return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  }

  return PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getRequestIp(request: NextRequest) {
  // Prefer headers set by the trusted edge/proxy over a client-supplied
  // X-Forwarded-For, which the first hop may have forwarded verbatim.
  const cloudflareIp = request.headers.get("cf-connecting-ip");
  const realIp = request.headers.get("x-real-ip");
  const forwardedFor = request.headers.get("x-forwarded-for");

  return normalizeClientIp(cloudflareIp ?? realIp ?? forwardedFor ?? null) ?? "unknown";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  const isPublicRoutePath = isPublicPath(pathname);
  const identity = await getIdentityFromToken(request);
  const role = identity?.role ?? null;
  const isAuthPage = pathname === "/login" || pathname === "/staff-login" || pathname === "/register";

  if (!isApiRoute && !isPublicRoutePath && !isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (role && isAuthPage) {
    const destination = role in ROLE_HOME ? ROLE_HOME[role] ?? "/" : "/";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (!role) {
    if (isAuthPage) {
      return NextResponse.next();
    }

    if (isApiRoute) {
      if (isPublicRoutePath) {
        return NextResponse.next();
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isPublicRoutePath) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isApiRoute) {
    for (const [routeRole, prefixes] of Object.entries(ROLE_API_ROUTES)) {
      if (prefixes.some((prefix) => pathname.startsWith(prefix))) {
        if (role !== routeRole && role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    if (AUTHENTICATED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !role && !isPublicRoutePath) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (!isPublicRoutePath) {
    for (const [routeRole, prefixes] of Object.entries(ROLE_ROUTES)) {
      if (prefixes.some((prefix) => pathname.startsWith(prefix)) && role !== routeRole) {
        if (role !== "ADMIN") {
          const home = role ? ROLE_HOME[role as keyof typeof ROLE_HOME] ?? "/" : "/";
          return NextResponse.redirect(new URL(home, request.url));
        }
      }
    }
  }

  const siteConfig = await getSiteAccessConfig();
  await persistEffectiveAccessMode(siteConfig);

  const clientIp = getRequestIp(request);
  const siteAllowed = isSiteAccessAllowed(pathname, clientIp, siteConfig, role, identity?.email);

  if (!siteAllowed) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Site temporarily unavailable" }, { status: 503 });
    }

    const destination =
      getEffectiveAccessMode(siteConfig) === "MAINTENANCE" ? "/maintenance" : "/coming-soon";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
