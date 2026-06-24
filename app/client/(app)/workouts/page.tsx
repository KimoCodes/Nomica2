import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import {
  DIFFICULTY_LABELS,
  MUSCLE_GROUP_LABELS,
} from "@/constants/exercises";
import { getClientWorkoutOverview } from "@/server/services/workout.service";
import { CompleteWorkoutForm } from "@/components/forms/complete-workout-form";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dumbbell,
  Play,
  CheckCircle2,
  ExternalLink,
  Trophy,
  Flame,
  Target,
} from "lucide-react";

export default async function ClientWorkoutsPage() {
  const session = await requireRole([Role.CLIENT]);
  const overview = await getClientWorkoutOverview(session.user.id);
  const todaysWorkout = overview?.todaysWorkout;

  if (!overview) {
    return (
      <DashboardLayout
        title="Workouts"
        navItems={[...CLIENT_NAV]}
        userName={session.user.name}
        userRole="Client"
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <Dumbbell className="mb-4 size-12 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold">No program assigned</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your coach will assign a training program soon. Check back here for daily workouts.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const scheduledDay = todaysWorkout?.scheduledDay;

  return (
    <DashboardLayout
      title="Workouts"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {overview.assignment.program.title}
          </h2>
          {overview.assignment.program.description && (
            <p className="mt-1 text-muted-foreground">
              {overview.assignment.program.description}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
                  <Target className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {overview.stats.completionRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <CheckCircle2 className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {overview.stats.completedWorkouts}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-warning/10 p-2.5 icon-hover">
                  <Flame className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {overview.stats.totalWorkouts}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {scheduledDay && (
          <Card className="overflow-hidden">
            <div className="border-b border-border/50 bg-primary/5 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Play className="size-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {scheduledDay.title ??
                        `Week ${scheduledDay.weekNumber}, Day ${scheduledDay.dayNumber}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {scheduledDay.exercises.length} exercise
                      {scheduledDay.exercises.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {todaysWorkout?.completedToday && (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle2 className="mr-1 size-3" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {scheduledDay.exercises.map((item, index) => (
                  <div
                    key={item.id}
                    className="group rounded-xl border border-border/50 p-4 transition-all hover:border-primary/20 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium">{item.exercise.name}</h4>
                          <Badge variant="outline" className="font-normal text-xs">
                            {MUSCLE_GROUP_LABELS[item.exercise.muscleGroup as keyof typeof MUSCLE_GROUP_LABELS]}
                          </Badge>
                          <Badge variant="secondary" className="font-normal text-xs">
                            {DIFFICULTY_LABELS[item.exercise.difficulty as keyof typeof DIFFICULTY_LABELS]}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            <strong className="font-semibold text-foreground">{item.sets ?? "—"}</strong> sets
                          </span>
                          <span>
                            <strong className="font-semibold text-foreground">{item.reps ?? "—"}</strong> reps
                          </span>
                          {item.restSeconds && (
                            <span>
                              <strong className="font-semibold text-foreground">{item.restSeconds}</strong>s rest
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {item.exercise.instructions}
                        </p>
                        {item.exercise.videoUrl && (
                          <Link
                            href={item.exercise.videoUrl}
                            target="_blank"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Play className="size-3" />
                            Watch demo
                            <ExternalLink className="size-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <CompleteWorkoutForm
                  programDayId={scheduledDay.id}
                  disabled={todaysWorkout?.completedToday}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Program Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overview.days.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex items-center gap-3">
                      {day.completed ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : (
                        <div className="size-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className="text-sm">
                        Week {day.weekNumber}, Day {day.dayNumber}
                        {day.title ? `: ${day.title}` : ""}
                      </span>
                    </div>
                    <Badge variant={day.completed ? "default" : "secondary"}>
                      {day.completed ? "Done" : `${day.exercises.length} exercises`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Completions</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.recentCompletions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Trophy className="mb-3 size-8 text-muted-foreground/30" />
                  <p className="text-sm font-medium">No completions yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Complete your first workout to see history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {overview.recentCompletions.map((completion) => (
                    <div
                      key={completion.id}
                      className="flex items-center gap-3 rounded-xl border border-border/50 p-3"
                    >
                      <div className="rounded-lg bg-success/10 p-2">
                        <CheckCircle2 className="size-4 text-success" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{completion.dayTitle}</p>
                        {completion.notes && (
                          <p className="truncate text-xs text-muted-foreground">
                            {completion.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {completion.completedAt.toLocaleDateString()}
                      </span>
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
