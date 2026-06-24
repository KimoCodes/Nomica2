import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { getClientDashboardSummary } from "@/server/services/dashboard.service";
import { getClientDashboardWorkoutSummary } from "@/server/services/workout.service";
import { getUnreadMessageCount } from "@/server/services/message.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dumbbell,
  TrendingUp,
  MessageSquare,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";

export default async function ClientDashboardPage() {
  const session = await requireRole([Role.CLIENT]);
  const [workout, unreadMessages, dashboard] = await Promise.all([
    getClientDashboardWorkoutSummary(session.user.id),
    getUnreadMessageCount(session.user.id),
    getClientDashboardSummary(session.user.id),
  ]);

  const weightChange =
    dashboard.latestProgress?.weight && dashboard.previousProgress?.weight
      ? dashboard.latestProgress.weight - dashboard.previousProgress.weight
      : null;
  const checkInStatus = dashboard.currentCheckIn?.submittedAt
    ? dashboard.currentCheckIn.response
      ? "Reviewed"
      : "Submitted"
    : "Due this week";
  const subscriptionStatus = dashboard.subscription?.status ?? "unpaid";

  return (
    <DashboardLayout
      title="Dashboard"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0] ?? "there"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Let&apos;s keep the momentum going. Here&apos;s your fitness overview.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Today&apos;s Workout
                  </p>
                  <p className="text-lg font-bold leading-tight">
                    {workout.hasProgram ? workout.workoutTitle : "Rest Day"}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
                  <Dumbbell className="size-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                {workout.hasProgram ? (
                  <Link
                    href="/client/workouts"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {workout.completedToday ? "View workout" : "Start workout"}
                    <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Your coach will assign a program soon
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Weight Progress
                  </p>
                  <p className="text-lg font-bold">
                    {dashboard.latestProgress?.weight
                      ? `${dashboard.latestProgress.weight} kg`
                      : "--"}
                  </p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5 icon-hover">
                  <TrendingUp className="size-5 text-chart-3" />
                </div>
              </div>
              <div className="mt-4">
                {weightChange !== null ? (
                  <p className="text-xs font-medium">
                    <span className={weightChange > 0 ? "text-chart-5" : "text-success"}>
                      {weightChange > 0 ? "+" : ""}
                      {weightChange.toFixed(1)} kg
                    </span>
                    <span className="text-muted-foreground"> from last log</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Log progress to see trends
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Messages
                  </p>
                  <p className="text-lg font-bold">{unreadMessages}</p>
                </div>
                <div className="rounded-xl bg-warning/10 p-2.5 icon-hover">
                  <MessageSquare className="size-5 text-warning" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/client/messages"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Open messages
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-4 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Check-in
                  </p>
                  <p className="text-lg font-bold">{checkInStatus}</p>
                </div>
                <div className="rounded-xl bg-chart-5/10 p-2.5 icon-hover">
                  <CalendarCheck className="size-5 text-chart-5" />
                </div>
              </div>
              <div className="mt-4">
                {dashboard.currentCheckIn?.submittedAt ? (
                  <p className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="size-3" />
                    Submitted
                  </p>
                ) : (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    Due this week
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 animate-slide-up stagger-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Program Overview</CardTitle>
              {workout.hasProgram && (
                <Link
                  href="/client/workouts"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {workout.hasProgram ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-primary/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Zap className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{workout.programTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {workout.exerciseCount} exercise{workout.exerciseCount === 1 ? "" : "s"} today
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-2xl font-bold">
                        {dashboard.weeklyCompletions}
                      </p>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-2xl font-bold">
                        {dashboard.latestProgress?.weight ? `${dashboard.latestProgress.weight}` : "--"}
                      </p>
                      <p className="text-xs text-muted-foreground">Current kg</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-2xl font-bold capitalize">
                        {subscriptionStatus === "active" ? "Active" : subscriptionStatus}
                      </p>
                      <p className="text-xs text-muted-foreground">Subscription</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                  <Dumbbell className="mb-3 size-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium">No program assigned yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your coach will assign your first training program soon.
                  </p>
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
                href="/client/workouts"
                className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all hover:bg-accent/30 hover:-translate-y-0.5"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <Dumbbell className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Today&apos;s Workout</p>
                  <p className="text-xs text-muted-foreground">
                    {workout.completedToday ? "Completed" : "Start now"}
                  </p>
                </div>
              </Link>
              <Link
                href="/client/progress"
                className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all hover:bg-accent/30 hover:-translate-y-0.5"
              >
                <div className="rounded-lg bg-chart-3/10 p-2">
                  <TrendingUp className="size-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm font-medium">Log Progress</p>
                  <p className="text-xs text-muted-foreground">
                    Track your measurements
                  </p>
                </div>
              </Link>
              <Link
                href="/client/messages"
                className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all hover:bg-accent/30 hover:-translate-y-0.5"
              >
                <div className="rounded-lg bg-warning/10 p-2">
                  <MessageSquare className="size-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">Message Coach</p>
                  <p className="text-xs text-muted-foreground">
                    {unreadMessages > 0 ? `${unreadMessages} unread` : "Stay connected"}
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
