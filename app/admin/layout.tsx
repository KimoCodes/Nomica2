import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole([Role.ADMIN]);
  return children;
}
