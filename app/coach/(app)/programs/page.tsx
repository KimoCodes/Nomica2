import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import {
  deleteProgramAction,
  duplicateProgramAction,
} from "@/actions/program.actions";
import { getProgramsByCoach } from "@/server/services/program.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { FolderOpen, Plus, Copy, Trash2, ArrowRight, Calendar, Users } from "lucide-react";

export default async function CoachProgramsPage() {
  const session = await requireRole([Role.COACH]);
  const programs = await getProgramsByCoach(session.user.id);

  return (
    <DashboardLayout
      title="Programs"
      navItems={[...COACH_NAV]}
      userName={session.user.name}
      userRole="Coach"
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Programs</h2>
            <p className="mt-1 text-muted-foreground">
              Create and manage training programs for your clients.
            </p>
          </div>
          <Link href="/coach/programs/new" className={buttonVariants()}>
            <Plus className="mr-1.5 size-4" />
            New Program
          </Link>
        </div>

        {programs.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No programs yet"
            description="Create your first training program to assign to clients."
            action={
              <Link href="/coach/programs/new" className={buttonVariants()}>
                <Plus className="mr-1.5 size-4" />
                Create Program
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program, index) => (
              <Card
                key={program.id}
                className={`group animate-slide-up stagger-${Math.min(index + 1, 8)} card-hover-glow transition-all duration-200 hover:-translate-y-0.5`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{program.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {program.weeks.length} week{program.weeks.length === 1 ? "" : "s"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {program._count.assignments} assignment{program._count.assignments === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    {program._count.assignments > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        In use
                      </Badge>
                    )}
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <Link
                      href={`/coach/programs/${program.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      Edit
                      <ArrowRight className="size-3.5" />
                    </Link>
                    <span className="text-muted-foreground/30">|</span>
                    <form
                      action={async () => {
                        "use server";
                        await duplicateProgramAction(program.id);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-3" />
                        Duplicate
                      </Button>
                    </form>
                    <span className="text-muted-foreground/30">|</span>
                    <form
                      action={async () => {
                        "use server";
                        await deleteProgramAction(program.id);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
