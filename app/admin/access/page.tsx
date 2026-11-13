import { Role } from "@prisma/client";
import { headers } from "next/headers";
import { requireRole } from "@/lib/auth";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ADMIN_NAV } from "@/constants/navigation";
import { getWebsiteAccessSettings } from "@/server/services/admin.service";
import { WebsiteAccessManager } from "@/components/admin/website-access-manager";

export default async function WebsiteAccessPage() {
  const session = await requireRole([Role.ADMIN]);
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const detectedPublicIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unavailable in this environment";

  const settings = await getWebsiteAccessSettings();

  return (
    <DashboardLayout
      title="Website Access"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Website Access Management</h2>
          <p className="mt-1 text-muted-foreground">
            Manage public site availability modes and approved administrator IP access.
          </p>
        </div>

        <WebsiteAccessManager
          detectedPublicIp={detectedPublicIp}
          initialSettings={{
            websiteAccessMode: settings.websiteAccessMode ?? "NORMAL",
            publicAccessRestrictionEnabled: settings.publicAccessRestrictionEnabled ?? false,
            comingSoonHeadline: settings.comingSoonHeadline ?? "NomiTips is launching soon",
            comingSoonMessage: settings.comingSoonMessage ?? "We’re building a premium experience to help you transform with confidence.",
            comingSoonLaunchAt: settings.comingSoonLaunchAt ? new Date(settings.comingSoonLaunchAt).toISOString() : null,
            comingSoonTimezone: settings.comingSoonTimezone ?? "UTC",
            comingSoonAutoSwitch: settings.comingSoonAutoSwitch ?? false,
            maintenanceHeadline: settings.maintenanceHeadline ?? "We’re making updates",
            maintenanceMessage: settings.maintenanceMessage ?? "NomiTips is temporarily unavailable while we improve the experience.",
            maintenanceReturnAt: settings.maintenanceReturnAt ? new Date(settings.maintenanceReturnAt).toISOString() : null,
            maintenanceTimezone: settings.maintenanceTimezone ?? "UTC",
            approvedIpAddresses: settings.approvedIpAddresses.map((ip) => ({
              id: ip.id,
              value: ip.value,
              label: ip.label,
              createdAt: ip.createdAt.toISOString(),
            })),
          }}
        />
      </div>
    </DashboardLayout>
  );
}
