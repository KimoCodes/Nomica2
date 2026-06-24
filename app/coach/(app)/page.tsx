import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import { getCoachDashboardSummary } from "@/server/services/dashboard.service";
import { getUnreadMessageCount } from "@/server/services/message.service";
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
  ClipboardCheck,
  FolderOpen,
  MessageSquare,
  ArrowRight,
  Clock,
  UserPlus,
} from "lucide-react";

export default async function CoachDashboardPage() {
  const session = await requireRole([Role.COACH]);
  const [dashboard, unreadMessages] = await Promise.all([
    getCoachDashboardSummary(session.user.id),
    getUnreadMessageCount(session.user.id),
  ]);

  const stats = [
    {
      label: "Active Clients",
      value: dashboard.activeClients,
      icon: Users,
      href: "/coach/clients",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Reviews",
      value: dashboard.pendingReviews,
      icon: ClipboardCheck,
      href: "/coach/check-ins",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Programs",
      value: dashboard.programTemplates,
      icon: FolderOpen,
      href: "/coach/programs",
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "Unread Messages",
      value: unreadMessages,
      icon: MessageSquare,
      href: "/coach/messages",
      color: "text-chart-5",
      bg: "bg-chart-5/10",
    },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      navItems={[...COACH_NAV]}
      userName={session.user.name}
      userRole="Coach"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0] ?? "Coach"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening with your coaching business today.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Link key={stat.label} href={stat.href}>
              <Card className={`group animate-slide-up stagger-${index + 1} card-hover-glow transition-all duration-200 hover:-translate-y-0.5`}>
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
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    View details
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 animate-slide-up stagger-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Messages</CardTitle>
              <Link
                href="/coach/messages"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {dashboard.recentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                  <MessageSquare className="mb-3 size-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Messages from your clients will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dashboard.recentMessages.slice(0, 5).map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-accent/30"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {message.sender.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{message.sender.name}</p>
                          <Badge
                            variant={message.readAt ? "secondary" : "default"}
                            className="shrink-0"
                          >
                            {message.readAt ? "Read" : "New"}
                          </Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {message.content || "Image attachment"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/coach/clients"
                className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all hover:bg-accent/30 hover:-translate-y-0.5"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <UserPlus className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Accept Clients</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboard.pendingClients} pending
                  </p>
                </div>
              </Link>
              <Link
                href="/coach/programs/new"
                className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all hover:bg-accent/30 hover:-translate-y-0.5"
              >
                <div className="rounded-lg bg-chart-3/10 p-2">
                  <FolderOpen className="size-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm font-medium">Create Program</p>
                  <p className="text-xs text-muted-foreground">
                    Build a new training plan
                  </p>
                </div>
              </Link>
              <Link
                href="/coach/exercises"
                className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all hover:bg-accent/30 hover:-translate-y-0.5"
              >
                <div className="rounded-lg bg-warning/10 p-2">
                  <Clock className="size-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">Exercise Library</p>
                  <p className="text-xs text-muted-foreground">
                    Manage your exercises
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
