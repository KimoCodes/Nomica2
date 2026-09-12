import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ADMIN_NAV } from "@/constants/navigation";
import BrandingClient from "@/components/admin/content/branding-client";

export default async function BrandingPage() {
  const session = await requireRole([Role.ADMIN]);

  return (
    <DashboardLayout
      title="Brand Assets"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name || "Admin"}
      userRole="Admin"
    >
      <BrandingClient />
    </DashboardLayout>
  );
}
