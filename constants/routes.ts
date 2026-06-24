export const PUBLIC_ROUTES = ["/", "/pricing", "/programs", "/bundles", "/club", "/quiz", "/free-guide", "/transformations", "/login", "/register"] as const;

export const AUTH_ROUTES = ["/login", "/register"] as const;

export const CLIENT_ROUTES = ["/client", "/onboarding"] as const;

export const COACH_ROUTES = ["/coach"] as const;

export const ADMIN_ROUTES = ["/admin"] as const;

export const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN: "/admin",
  COACH: "/coach",
  CLIENT: "/client",
};

export const ONBOARDING_ROUTES = {
  CLIENT: "/onboarding",
  COACH: "/coach/onboarding",
} as const;
