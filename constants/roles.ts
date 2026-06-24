import type { Role } from "@prisma/client";

export const ROLES = {
  ADMIN: "ADMIN",
  COACH: "COACH",
  CLIENT: "CLIENT",
} as const satisfies Record<string, Role>;

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  COACH: "Coach",
  CLIENT: "Client",
};
