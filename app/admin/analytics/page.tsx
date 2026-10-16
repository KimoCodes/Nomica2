import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { ADMIN_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { getAnalyticsDashboard } from "@/server/services/analytics.service";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AdminAnalyticsPage() {
  const session = await requireRole([Role.ADMIN]);

  const now = new Date();
  const range = {
    from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    to: now,
  };

  const data = await getAnalyticsDashboard(range);

  return (
    <DashboardLayout
      title="Analytics"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <AnalyticsDashboard data={data} />
    </DashboardLayout>
  );
}
