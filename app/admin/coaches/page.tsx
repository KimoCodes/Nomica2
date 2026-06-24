import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { ADMIN_NAV } from "@/constants/navigation";
import { getAdminCoaches } from "@/server/services/admin.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CoachActions } from "./coach-actions";
import { Shield, CheckCircle2, Clock, FolderOpen, Mail } from "lucide-react";

export default async function AdminCoachesPage() {
  const session = await requireRole([Role.ADMIN]);
  const coaches = await getAdminCoaches();

  const approvedCount = coaches.filter((c) => c.approved).length;
  const pendingCount = coaches.filter((c) => !c.approved).length;

  return (
    <DashboardLayout
      title="Coaches"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coaches</h2>
          <p className="mt-1 text-muted-foreground">
            Review and manage coach accounts and approvals.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Coaches</p>
                  <p className="text-3xl font-bold">{coaches.length}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
                  <Shield className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold">{approvedCount}</p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <CheckCircle2 className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">{pendingCount}</p>
                </div>
                <div className="rounded-xl bg-warning/10 p-2.5 icon-hover">
                  <Clock className="size-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {coaches.map((coach, index) => (
            <Card
              key={coach.id}
              className={`animate-slide-up stagger-${Math.min(index + 1, 8)} card-hover-glow transition-all duration-200 hover:-translate-y-0.5`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {coach.user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{coach.user.name}</p>
                        <Badge variant={coach.approved ? "default" : "secondary"}>
                          {coach.approved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="size-3" />
                        {coach.user.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {coach.specialties.map((s) => (
                          <Badge key={s} variant="outline" className="font-normal text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        {coach.yearsExperience != null && (
                          <span>{coach.yearsExperience} years experience</span>
                        )}
                        {coach.certification && (
                          <span>{coach.certification}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <FolderOpen className="size-3" />
                          {coach.programs.length} programs
                        </span>
                      </div>
                    </div>
                  </div>
                  <CoachActions
                    coachProfileId={coach.id}
                    isApproved={coach.approved}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
