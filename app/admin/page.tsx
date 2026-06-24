import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { ADMIN_NAV } from "@/constants/navigation";
import { getAdminDashboardSummary } from "@/server/services/dashboard.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  CreditCard,
  Shield,
  DollarSign,
  ArrowRight,
  UserPlus,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function AdminDashboardPage() {
  const session = await requireRole([Role.ADMIN]);
  const dashboard = await getAdminDashboardSummary();

  const stats = [
    {
      label: "Total Users",
      value: dashboard.totalUsers,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Active Subscriptions",
      value: dashboard.activeSubscriptions,
      icon: CreditCard,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Active Coaches",
      value: dashboard.activeCoaches,
      icon: Shield,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "Revenue",
      value: currencyFormatter.format(dashboard.revenueCents / 100),
      icon: DollarSign,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="mt-1 text-muted-foreground">
            Overview of your platform&apos;s performance and user activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={stat.label} className={`animate-slide-up stagger-${index + 1} card-hover-glow transition-all duration-200 hover:-translate-y-0.5`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                    <stat.icon className={`size-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dashboard.pendingCoaches > 0 && (
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <UserPlus className="size-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">
                    {dashboard.pendingCoaches} coach{dashboard.pendingCoaches === 1 ? "" : "es"} pending approval
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Review and approve coaches to allow them to accept clients.
                  </p>
                </div>
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Users</CardTitle>
            <Badge variant="secondary">{dashboard.recentUsers.length}</Badge>
          </CardHeader>
          <CardContent>
            {dashboard.recentUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <Users className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No users yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Users will appear here once they register.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboard.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {user.role.toLowerCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {user.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
