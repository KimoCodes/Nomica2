import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import { acceptClientAction } from "@/actions/assignment.actions";
import {
  getCoachClients,
  getUnassignedClients,
} from "@/server/services/assignment.service";
import { getProgramsByCoach } from "@/server/services/program.service";
import { AssignProgramForm } from "@/components/forms/assign-program-form";
import { DeactivateAssignmentButton } from "@/components/forms/deactivate-assignment-button";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Users, UserPlus, Mail, Calendar, CheckCircle2 } from "lucide-react";

export default async function CoachClientsPage() {
  const session = await requireRole([Role.COACH]);
  const [clients, pendingClients, programs] = await Promise.all([
    getCoachClients(session.user.id),
    getUnassignedClients(),
    getProgramsByCoach(session.user.id),
  ]);

  const programOptions = programs.map((program) => ({
    id: program.id,
    title: program.title,
  }));

  return (
    <DashboardLayout
      title="Clients"
      navItems={[...COACH_NAV]}
      userName={session.user.name}
      userRole="Coach"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Management</h2>
          <p className="mt-1 text-muted-foreground">
            Manage your clients, assign programs, and track their progress.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Active Clients</h3>
                <Badge variant="secondary">{clients.length}</Badge>
              </div>

              {clients.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No active clients yet"
                  description="Accept pending clients below to start coaching."
                />
              ) : (
                <div className="space-y-4">
                  {clients.map((client, index) => {
                    const activeAssignment = client.programs.find(
                      (assignment) => assignment.isActive,
                    );
                    const activeProgram = activeAssignment?.program;
                    return (
                      <Card
                        key={client.id}
                        className={`animate-slide-up stagger-${Math.min(index + 1, 8)} card-hover-glow transition-all hover:-translate-y-0.5`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {client.user.name?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{client.user.name}</p>
                                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Mail className="size-3" />
                                    {client.user.email}
                                  </p>
                                </div>
                                <Badge variant={activeProgram ? "default" : "secondary"}>
                                  {activeProgram ? activeProgram.title : "No program"}
                                </Badge>
                              </div>

                              {client.programs.length > 0 && (
                                <div className="mt-4 space-y-2 rounded-xl bg-muted/40 p-3">
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Assignment History
                                  </p>
                                  {client.programs.map((assignment) => (
                                    <div
                                      key={assignment.id}
                                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                          {assignment.program.title}
                                        </p>
                                        {assignment.isActive && (
                                          <Badge variant="outline" className="border-success/30 text-success">
                                            Active
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="size-3" />
                                          {assignment.startDate.toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <CheckCircle2 className="size-3" />
                                          {assignment._count.completions} completed
                                        </span>
                                        {assignment.isActive ? (
                                          <DeactivateAssignmentButton
                                            assignmentId={assignment.id}
                                            programTitle={assignment.program.title}
                                          />
                                        ) : (
                                          <Badge variant="secondary">Inactive</Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="mt-4">
                                <AssignProgramForm
                                  clientProfileId={client.id}
                                  clientName={client.user.name}
                                  programs={programOptions}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pending Clients</h3>
              <Badge variant="secondary">{pendingClients.length}</Badge>
            </div>

            <Card>
              <CardContent className="p-4">
                {pendingClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <UserPlus className="mb-3 size-8 text-muted-foreground/30" />
                    <p className="text-sm font-medium">No pending clients</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      New clients will appear here after onboarding.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-accent/30"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {client.user.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{client.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {client.user.email}
                          </p>
                        </div>
                        <form
                          action={async () => {
                            "use server";
                            await acceptClientAction(client.id);
                          }}
                        >
                          <Button type="submit" size="sm">
                            Accept
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
