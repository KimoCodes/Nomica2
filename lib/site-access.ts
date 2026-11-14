function detectIpVersion(value: string): 4 | 6 | 0 {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) {
    const octets = trimmed.split(".");
    if (octets.every((octet) => /^\d+$/.test(octet) && Number(octet) >= 0 && Number(octet) <= 255)) {
      return 4;
    }
    return 0;
  }

  if (trimmed.includes(":")) {
    const normalized = trimmed.replace(/\[|\]/g, "");
    const segments = normalized.split("::");
    if (segments.length > 2) return 0;

    const left = segments[0] ? segments[0].split(":").filter(Boolean) : [];
    const right = segments.length > 1 && segments[1] ? segments[1].split(":").filter(Boolean) : [];
    if (left.length + right.length > 8) return 0;

    const allSegments = [...left, ...right];
    if (!allSegments.length) return 6;
    if (allSegments.some((segment) => segment.length === 0 || segment.length > 4 || !/^[0-9a-fA-F]+$/.test(segment))) {
      return 0;
    }

    if (segments.length === 1 && allSegments.length !== 8) return 0;
    if (segments.length === 2 && allSegments.length > 7) return 0;
    return 6;
  }

  return 0;
}

export const STAFF_COACH_EMAIL = "nomitipscoaching@gmail.com";

export const PUBLIC_PAGE_PREFIXES = [
  "/login",
  "/staff-login",
  "/register",
  "/verify-email",
  "/reset-password",
  "/pricing",
  "/programs",
  "/bundles",
  "/club",
  "/quiz",
  "/free-guide",
  "/transformations",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/coming-soon",
  "/maintenance",
  "/cart",
  "/checkout",
];

export const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/health",
  "/api/public",
  "/api/webhooks",
  "/api/brand-assets",
  "/api/analytics",
  "/api/catalog",
];

export const PROTECTED_PATH_PREFIXES = [
  "/admin",
  "/coach",
  "/client",
  "/onboarding",
];

export function normalizeClientIp(value?: string | null): string | null {
  if (!value) return null;

  const first = value
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);

  if (!first) return null;
  return first;
}

function ipv4ToNumber(ip: string): number | null {
  const octets = ip.split(".");
  if (octets.length !== 4) return null;

  const numbers = octets.map((octet) => Number(octet));
  if (numbers.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return null;

  return ((numbers[0] << 24) | (numbers[1] << 16) | (numbers[2] << 8) | numbers[3]) >>> 0;
}

function ipv6ToGroups(ip: string): number[] {
  const normalized = ip.toLowerCase().replace(/\[|\]|%[a-z0-9_-]+/gi, "");
  const [leftPart, rightPart = ""] = normalized.split("::");
  const left = leftPart ? leftPart.split(":").filter(Boolean) : [];
  const right = rightPart ? rightPart.split(":").filter(Boolean) : [];
  const missing = 8 - (left.length + right.length);
  const groups = [...left, ...Array.from({ length: Math.max(missing, 0) }, () => "0"), ...right];

  return groups.map((group) => {
    const value = Number.parseInt(group || "0", 16);
    if (!Number.isInteger(value) || value < 0 || value > 65535) {
      throw new Error("invalid ipv6");
    }
    return value;
  });
}

export function ipToBigInt(ip: string): number | null {
  const trimmed = ip.trim();
  const version = detectIpVersion(trimmed);
  if (version === 4) return ipv4ToNumber(trimmed);
  if (version === 6) {
    try {
      const groups = ipv6ToGroups(trimmed);
      return groups.reduce((value, group, index) => value + (group << ((7 - index) * 16)), 0);
    } catch {
      return null;
    }
  }
  return null;
}

export function ipMatchesCidr(ip: string, cidr: string): boolean {
  const [networkAddress, prefixValue] = cidr.split("/");
  if (!networkAddress || !prefixValue) return false;

  const prefix = Number(prefixValue);
  if (!Number.isInteger(prefix) || prefix < 0) return false;

  const ipVersion = detectIpVersion(ip);
  const networkVersion = detectIpVersion(networkAddress);
  if (ipVersion === 0 || networkVersion === 0 || ipVersion !== networkVersion) {
    return false;
  }

  if (ipVersion === 4) {
    const ipNumber = ipv4ToNumber(ip);
    const networkNumber = ipv4ToNumber(networkAddress);
    if (ipNumber === null || networkNumber === null) return false;

    const mask = prefix === 0 ? 0 : ((0xffffffff << (32 - prefix)) >>> 0);
    const networkStart = networkNumber & mask;
    const networkEnd = networkStart | (~mask >>> 0);
    return ipNumber >= networkStart && ipNumber <= networkEnd;
  }

  let ipGroups: number[];
  let networkGroups: number[];

  try {
    ipGroups = ipv6ToGroups(ip);
    networkGroups = ipv6ToGroups(networkAddress);
  } catch {
    return false;
  }

  const fullGroups = Math.floor(prefix / 16);
  for (let i = 0; i < fullGroups; i += 1) {
    if (ipGroups[i] !== networkGroups[i]) return false;
  }

  const remainder = prefix % 16;
  if (remainder > 0) {
    const mask = (0xffff << (16 - remainder)) >>> 0;
    const groupIndex = fullGroups;
    if ((ipGroups[groupIndex] & mask) !== (networkGroups[groupIndex] & mask)) return false;
  }

  return true;
}

export function ipMatchesApprovedList(ip: string, approvedIps: Array<{ value: string }>): boolean {
  if (!ip || !approvedIps.length) return false;

  return approvedIps.some((entry) => {
    const value = entry.value.trim();
    if (!value) return false;
    if (value.includes("/")) return ipMatchesCidr(ip, value);
    return ip === value;
  });
}

export type SiteAccessConfig = {
  websiteAccessMode?: string;
  publicAccessRestrictionEnabled?: boolean;
  comingSoonAutoSwitch?: boolean;
  comingSoonLaunchAt?: Date | string | null;
  maintenanceReturnAt?: Date | string | null;
  approvedIpAddresses?: Array<{ value: string }>;
};

function hasPassed(value: Date | string | null | undefined, now: Date): boolean {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp <= now.getTime();
}

/**
 * Resolves the mode that should be in force *right now*, honouring the
 * scheduled launch/return times so a stale COMING_SOON or MAINTENANCE row
 * cannot keep the site closed after its window has elapsed.
 */
export function getEffectiveAccessMode(
  config: Pick<SiteAccessConfig, "websiteAccessMode" | "comingSoonAutoSwitch" | "comingSoonLaunchAt" | "maintenanceReturnAt"> | null,
  now: Date = new Date(),
): string {
  const mode = config?.websiteAccessMode ?? "NORMAL";

  if (mode === "COMING_SOON" && config?.comingSoonAutoSwitch && hasPassed(config.comingSoonLaunchAt, now)) {
    return "NORMAL";
  }

  if (mode === "MAINTENANCE" && config && hasPassed(config.maintenanceReturnAt, now)) {
    return "NORMAL";
  }

  return mode;
}

/**
 * A past maintenance return time makes `getEffectiveAccessMode` open the site
 * on the very next request, so saving one with MAINTENANCE selected would
 * silently cancel maintenance seconds later. Returns an error message, or
 * null when the value is acceptable.
 */
export function validateMaintenanceReturnAt(
  mode: string | null | undefined,
  returnAt: Date | string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (mode !== "MAINTENANCE" || returnAt === null || returnAt === undefined || returnAt === "") {
    return null;
  }

  const timestamp = new Date(returnAt).getTime();
  if (!Number.isFinite(timestamp)) {
    return "Estimated return time is not a valid date.";
  }
  if (timestamp <= now.getTime()) {
    return "Estimated return time has already passed — maintenance would end immediately. Clear it or pick a future time.";
  }
  return null;
}

export function isStaffRole(role: string | null, email?: string | null): boolean {
  return (
    role === "ADMIN" ||
    (role === "COACH" && (email ?? "").trim().toLowerCase() === STAFF_COACH_EMAIL)
  );
}

export function isSiteAccessAllowed(
  pathname: string,
  clientIp: string,
  config: SiteAccessConfig | null,
  role: string | null,
  email?: string | null,
  now: Date = new Date(),
): boolean {
  if (!config) {
    return true;
  }

  const mode = getEffectiveAccessMode(config, now);
  const approvedIps = config.approvedIpAddresses ?? [];
  const isApprovedIp = ipMatchesApprovedList(clientIp, approvedIps);
  const isStaff = isStaffRole(role, email);

  if (mode === "NORMAL" && !config.publicAccessRestrictionEnabled) {
    return true;
  }

  if (pathname === "/coming-soon" || pathname === "/maintenance") {
    return true;
  }

  if (mode === "COMING_SOON" || mode === "MAINTENANCE") {
    if (pathname === "/login" || pathname === "/staff-login" || pathname === "/register") return true;
    return isStaff;
  }

  // NORMAL mode with IP restriction: staff must never be locked out, otherwise
  // an admin who enables the toggle without their own IP has no recovery path.
  if (config.publicAccessRestrictionEnabled) {
    return isStaff || isApprovedIp;
  }

  return true;
}

export function isPublicRoute(pathname: string): boolean {
  if (pathname.includes(".")) return true;
  if (pathname === "/") return true;

  if (pathname.startsWith("/api/")) {
    return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  }

  return PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isProtectedRoute(pathname: string): boolean {
  if (pathname.startsWith("/api/")) {
    return !PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  }

  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
