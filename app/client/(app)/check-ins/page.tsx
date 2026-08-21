import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { getClientCheckIns, getCurrentWeekCheckIn } from "@/server/services/checkin.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { CheckInForm } from "@/components/forms/check-in-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Battery,
  Moon,
  Dumbbell,
} from "lucide-react";

export default async function ClientCheckInsPage() {
  const session = await requireRole([Role.CLIENT]);
  const [checkIns, currentCheckIn] = await Promise.all([
    getClientCheckIns(session.user.id),
    getCurrentWeekCheckIn(session.user.id),
  ]);

  const submittedThisWeek = Boolean(currentCheckIn?.submittedAt);
  const hasResponse = Boolean(currentCheckIn?.response);

  return (
    <DashboardLayout
      title="Check-ins"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Weekly Check-ins</h2>
          <p className="mt-1 text-muted-foreground">
            Submit your weekly status and receive feedback from your coach.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-lg font-bold">
                    {submittedThisWeek ? "Submitted" : "Pending"}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
                  <CalendarCheck className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Coach Response</p>
                  <p className="text-lg font-bold">
                    {hasResponse ? "Received" : submittedThisWeek ? "Awaiting" : "Not yet submitted"}
                  </p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <MessageSquare className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Check-ins</p>
                  <p className="text-2xl font-bold">{checkIns.length}</p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5 icon-hover">
                  <CheckCircle2 className="size-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {currentCheckIn?.response && (
          <Card className="border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="size-4 text-success" />
                Latest Coach Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{currentCheckIn.response.feedback}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Week of {currentCheckIn.weekStart.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}

        {!submittedThisWeek && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submit This Week&apos;s Check-in</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckInForm />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Check-in History</CardTitle>
            <Badge variant="secondary">{checkIns.length}</Badge>
          </CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <CalendarCheck className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No check-ins yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your coach will set up weekly check-ins soon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="rounded-xl border border-border/50 p-4 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {checkIn.weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div>
                          <p className="font-medium">
                            Week of {checkIn.weekStart.toLocaleDateString()}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            {checkIn.submittedAt ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="size-3 text-success" />
                                Submitted
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                Not submitted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {checkIn.response && (
                          <Badge className="bg-success/10 text-success border-success/20">
                            <MessageSquare className="mr-1 size-3" />
                            Feedback
                          </Badge>
                        )}
                      </div>
                    </div>

                    {checkIn.submittedAt && (
                      <div className="mt-3 flex flex-wrap gap-4 border-t border-border/50 pt-3 text-sm">
                        {checkIn.workoutsCompleted != null && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Dumbbell className="size-3.5" />
                            {checkIn.workoutsCompleted} workouts
                          </div>
                        )}
                        {checkIn.energyLevel != null && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Battery className="size-3.5" />
                            Energy: {checkIn.energyLevel}/10
                          </div>
                        )}
                        {checkIn.sleepQuality != null && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Moon className="size-3.5" />
                            Sleep: {checkIn.sleepQuality}/10
                          </div>
                        )}
                        {checkIn.currentWeight != null && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Dumbbell className="size-3.5" />
                            {checkIn.currentWeight} kg
                          </div>
                        )}
                      </div>
                    )}

                    {checkIn.response && (
                      <div className="mt-3 rounded-lg bg-muted/50 p-3">
                        <p className="text-sm">{checkIn.response.feedback}</p>
                      </div>
                    )}
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
