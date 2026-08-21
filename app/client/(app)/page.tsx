import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { ACTIVE_STATUSES } from "@/constants/subscriptions";
import { getClientDashboardSummary } from "@/server/services/dashboard.service";
import { getClientDashboardWorkoutSummary } from "@/server/services/workout.service";
import { getUnreadMessageCount } from "@/server/services/message.service";
import { getClientFreeTrial } from "@/server/services/free-trial.service";
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
  Flame,
  Crown,
  Gift,
} from "lucide-react";
import { WeightTrendChart } from "@/components/charts/weight-trend-chart";

export default async function ClientDashboardPage() {
  const session = await requireRole([Role.CLIENT]);
  const [workout, unreadMessages, dashboard, freeTrial] = await Promise.all([
    getClientDashboardWorkoutSummary(session.user.id),
    getUnreadMessageCount(session.user.id),
    getClientDashboardSummary(session.user.id),
    getClientFreeTrial(session.user.id),
  ]);

  const checkInStatus = dashboard.currentCheckIn?.submittedAt
    ? dashboard.currentCheckIn.response
      ? "Reviewed"
      : "Submitted"
    : "Due this week";
  const subStatus = dashboard.subscription?.status ?? null;
  const now = new Date();
  const trialDaysRemaining = freeTrial
    ? Math.max(0, Math.ceil((freeTrial.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const hasActiveTrial = trialDaysRemaining > 0;
  const hasActiveSubscription = subStatus !== null && ACTIVE_STATUSES.includes(subStatus);
  const subscriptionLabel = hasActiveSubscription
    ? subStatus!.replaceAll("_", " ")
    : hasActiveTrial
      ? "Free Trial"
      : "None";

  return (
    <DashboardLayout
      title="Dashboard"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-8">
        {hasActiveTrial && (
          <Card className="border-primary/30 bg-primary/5 animate-slide-up">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Gift className="size-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Free Trial Active</p>
                  <p className="text-sm text-muted-foreground">
                    You have {trialDaysRemaining} day{trialDaysRemaining === 1 ? "" : "s"} left.
                    Subscribe to keep access after your trial expires.
                  </p>
                </div>
              </div>
              <Link
                href="/client/subscription"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:-translate-y-0.5"
              >
                View plans
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        {!hasActiveSubscription && !hasActiveTrial && (
          <Card className="border-primary/20 bg-primary/5 animate-slide-up">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Crown className="size-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Unlock your full potential</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a plan to access workouts, progress tracking, nutrition, and more.
                  </p>
                </div>
              </div>
              <Link
                href="/client/subscription"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:-translate-y-0.5"
              >
                Choose a plan
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0] ?? "there"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s your fitness overview for this week.
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
                    Workouts This Week
                  </p>
                  <p className="text-3xl font-bold">{dashboard.weeklyCompletions}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
                  <Flame className="size-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                {dashboard.streak > 0 ? (
                  <p className="text-xs font-medium text-success">
                    {dashboard.streak} day streak — keep it up!
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Complete a workout to start a streak
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
                  <p className="text-3xl font-bold">{unreadMessages}</p>
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
                      <p className="text-xs text-muted-foreground">Weight (kg)</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-2xl font-bold capitalize">
                        {subscriptionLabel}
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

        <Card className="animate-slide-up stagger-6">
          <CardHeader>
            <CardTitle className="text-base">Weight Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightTrendChart data={dashboard.weightTrend} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
