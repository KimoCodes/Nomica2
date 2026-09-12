import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ADMIN_NAV } from "@/constants/navigation";
import ThemeManagerClient from "@/components/admin/content/theme-manager-client";

export default async function ThemeManagerPage() {
  const session = await requireRole([Role.ADMIN]);

  return (
    <DashboardLayout
      title="Theme Manager"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name || "Admin"}
      userRole="Admin"
    >
      <ThemeManagerClient />
    </DashboardLayout>
  );
}
