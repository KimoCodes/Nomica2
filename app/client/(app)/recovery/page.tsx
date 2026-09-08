import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { getClientRecoveryData } from "@/server/services/dashboard.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { RecoveryDashboard } from "@/components/recovery-dashboard";

export default async function RecoveryPage() {
  const session = await requireRole([Role.CLIENT]);
  const data = await getClientRecoveryData(session.user.id);

  return (
    <DashboardLayout
      title="Recovery"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recovery Dashboard</h2>
          <p className="mt-1 text-muted-foreground">
            Monitor your recovery status, sleep quality, and training load to optimize your performance.
          </p>
        </div>
        <RecoveryDashboard
          readiness={data.readiness}
          insights={data.insights}
          recentWorkouts={data.recentWorkouts.map((w) => ({
            date: w.date.toISOString(),
            title: w.title,
            exerciseCount: w.exerciseCount,
          }))}
          recentCheckIns={data.recentCheckIns.map((ci) => ({
            ...ci,
            weekStart: ci.weekStart.toISOString(),
          }))}
          daysSinceLastWorkout={data.daysSinceLastWorkout}
        />
      </div>
    </DashboardLayout>
  );
}
