import type { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";

export async function assertRole(allowedRoles: Role[]) {
  return requireRole(allowedRoles);
}
