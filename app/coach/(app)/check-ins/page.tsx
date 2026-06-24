import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import {
  getCoachPendingCheckIns,
  getCoachCheckInHistory,
} from "@/server/services/checkin.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Battery,
  Moon,
  Dumbbell,
} from "lucide-react";

export default async function CoachCheckInsPage() {
  const session = await requireRole([Role.COACH]);
  const [pendingCheckIns, history] = await Promise.all([
    getCoachPendingCheckIns(session.user.id),
    getCoachCheckInHistory(session.user.id),
  ]);

  return (
    <DashboardLayout
      title="Check-ins"
      navItems={[...COACH_NAV]}
      userName={session.user.name}
      userRole="Coach"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Check-ins</h2>
          <p className="mt-1 text-muted-foreground">
            Review weekly check-ins from your clients and provide feedback.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                  <p className="text-3xl font-bold">{pendingCheckIns.length}</p>
                </div>
                <div className="rounded-xl bg-warning/10 p-2.5 icon-hover">
                  <AlertCircle className="size-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                  <p className="text-3xl font-bold">{history.length}</p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <CheckCircle2 className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {pendingCheckIns.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Pending Reviews</h3>
            <div className="space-y-4">
              {pendingCheckIns.map((checkIn) => (
                <Card key={checkIn.id} className="border-warning/20">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {checkIn.clientProfile.user.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {checkIn.clientProfile.user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Week of {checkIn.weekStart.toLocaleDateString()}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {checkIn.workoutsCompleted != null && (
                              <span className="flex items-center gap-1.5">
                                <Dumbbell className="size-3.5" />
                                {checkIn.workoutsCompleted} workouts
                              </span>
                            )}
                            {checkIn.energyLevel != null && (
                              <span className="flex items-center gap-1.5">
                                <Battery className="size-3.5" />
                                Energy: {checkIn.energyLevel}/10
                              </span>
                            )}
                            {checkIn.sleepQuality != null && (
                              <span className="flex items-center gap-1.5">
                                <Moon className="size-3.5" />
                                Sleep: {checkIn.sleepQuality}/10
                              </span>
                            )}
                            {checkIn.currentWeight != null && (
                              <span className="flex items-center gap-1.5">
                                <Dumbbell className="size-3.5" />
                                {checkIn.currentWeight} kg
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-warning/10 text-warning border-warning/20">
                        Pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Review History</CardTitle>
            <Badge variant="secondary">{history.length}</Badge>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <CalendarCheck className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No reviews yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reviewed check-ins will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="rounded-xl border border-border/50 p-4 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {checkIn.clientProfile.user.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {checkIn.clientProfile.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Week of {checkIn.weekStart.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="mr-1 size-3" />
                        Reviewed
                      </Badge>
                    </div>
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
