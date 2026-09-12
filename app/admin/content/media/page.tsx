import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ADMIN_NAV } from "@/constants/navigation";
import MediaLibraryClient from "@/components/admin/content/media-library-client";

export default async function MediaLibraryPage() {
  const session = await requireRole([Role.ADMIN]);

  return (
    <DashboardLayout
      title="Media Library"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name || "Admin"}
      userRole="Admin"
    >
      <MediaLibraryClient />
    </DashboardLayout>
  );
}
