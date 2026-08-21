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
import Link from "next/link";
import {
  Users,
  CreditCard,
  Shield,
  DollarSign,
  UserPlus,
  UserCheck,
  LayoutGrid,
  Activity,
  TrendingUp,
  ArrowRight,
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

  const quickActions = [
    { label: "Manage Users", href: "/admin/users", icon: Users, description: "View and edit user accounts" },
    { label: "Review Coaches", href: "/admin/coaches", icon: UserCheck, description: "Approve pending coaches" },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard, description: "View active subscriptions" },
    { label: "Programs", href: "/admin/programs", icon: LayoutGrid, description: "Manage programs and bundles" },
  ];

  const { roleCounts, subscriptionStatusCounts } = dashboard;

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
                  <div className={`rounded-xl p-2.5 ${stat.bg} icon-hover`}>
                    <stat.icon className={`size-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dashboard.pendingCoaches > 0 && (
          <Link href="/admin/coaches">
            <Card className="border-warning/20 bg-warning/5 transition-colors hover:bg-warning/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-warning/10 p-2">
                    <UserPlus className="size-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {dashboard.pendingCoaches} coach{dashboard.pendingCoaches === 1 ? "" : "es"} pending approval
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Review and approve coaches to allow them to accept clients.
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl border border-border/50 px-4 py-3 transition-colors hover:bg-accent/30"
                  >
                    <div className="rounded-lg bg-primary/10 p-2">
                      <action.icon className="size-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-sm">Admins</span>
                  </div>
                  <span className="text-sm font-medium">{roleCounts.admins}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-chart-3" />
                    <span className="text-sm">Coaches</span>
                  </div>
                  <span className="text-sm font-medium">{roleCounts.coaches}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-success" />
                    <span className="text-sm">Clients</span>
                  </div>
                  <span className="text-sm font-medium">{roleCounts.clients}</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                {dashboard.totalUsers > 0 && (
                  <div className="flex h-full">
                    <div
                      className="bg-primary transition-all"
                      style={{ width: `${(roleCounts.admins / dashboard.totalUsers) * 100}%` }}
                    />
                    <div
                      className="bg-chart-3 transition-all"
                      style={{ width: `${(roleCounts.coaches / dashboard.totalUsers) * 100}%` }}
                    />
                    <div
                      className="bg-success transition-all"
                      style={{ width: `${(roleCounts.clients / dashboard.totalUsers) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-success" />
                    <span className="text-sm">Active</span>
                  </div>
                  <span className="text-sm font-medium">{subscriptionStatusCounts.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-sm">Trialing</span>
                  </div>
                  <span className="text-sm font-medium">{subscriptionStatusCounts.trialing}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-destructive" />
                    <span className="text-sm">Canceled</span>
                  </div>
                  <span className="text-sm font-medium">{subscriptionStatusCounts.canceled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-warning" />
                    <span className="text-sm">Past Due</span>
                  </div>
                  <span className="text-sm font-medium">{subscriptionStatusCounts.pastDue}</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                {dashboard.activeSubscriptions > 0 && (
                  <div className="flex h-full">
                    <div
                      className="bg-success transition-all"
                      style={{ width: `${(subscriptionStatusCounts.active / Math.max(dashboard.activeSubscriptions + subscriptionStatusCounts.trialing + subscriptionStatusCounts.canceled + subscriptionStatusCounts.pastDue, 1)) * 100}%` }}
                    />
                    <div
                      className="bg-primary transition-all"
                      style={{ width: `${(subscriptionStatusCounts.trialing / Math.max(dashboard.activeSubscriptions + subscriptionStatusCounts.trialing + subscriptionStatusCounts.canceled + subscriptionStatusCounts.pastDue, 1)) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="size-4" />
                    <span className="text-xs font-medium">Total Clients</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{dashboard.totalClients}</p>
                </div>
                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LayoutGrid className="size-4" />
                    <span className="text-xs font-medium">Active Programs</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{dashboard.totalPrograms}</p>
                </div>
                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="size-4" />
                    <span className="text-xs font-medium">Today&apos;s Workouts</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{dashboard.recentWorkoutCompletions}</p>
                </div>
                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="size-4" />
                    <span className="text-xs font-medium">Revenue</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {currencyFormatter.format(dashboard.revenueCents / 100)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Users</CardTitle>
              <a href="/admin/users" className="text-sm text-primary hover:underline">
                View all
              </a>
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
      </div>
    </DashboardLayout>
  );
}
