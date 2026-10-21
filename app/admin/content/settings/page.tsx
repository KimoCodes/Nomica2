import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ADMIN_NAV } from "@/constants/navigation";
import { isVideoGuidedWorkoutsEnabled } from "@/server/services/admin.service";
import { SiteSettingsClient } from "@/components/admin/content/site-settings-client";

export default async function AdminSettingsPage() {
  const session = await requireRole([Role.ADMIN]);
  const videosOn = await isVideoGuidedWorkoutsEnabled();

  return (
    <DashboardLayout
      title="Site Settings"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name || "Admin"}
      userRole="Admin"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Site Settings</h2>
          <p className="mt-1 text-muted-foreground">
            Feature switches that control what clients see across the app.
          </p>
        </div>

        <SiteSettingsClient initialVideoGuidedWorkouts={videosOn} />
      </div>
    </DashboardLayout>
  );
}
