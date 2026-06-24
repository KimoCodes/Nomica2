import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import { getExercisesForCoach } from "@/server/services/exercise.service";
import { getProgramById } from "@/server/services/program.service";
import { ProgramBuilder } from "@/components/programs/program-builder";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireRole([Role.COACH]);
  const [program, exercises] = await Promise.all([
    getProgramById(session.user.id, id),
    getExercisesForCoach(session.user.id),
  ]);

  if (!program) {
    notFound();
  }

  return (
    <DashboardLayout title={program.title} navItems={[...COACH_NAV]}>
      <div className="space-y-6">
        <div>
          <Link
            href="/coach/programs"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "mb-4 group",
            })}
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-0.5" />
            Back to programs
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">{program.title}</h2>
          {program.description && (
            <p className="mt-1 text-muted-foreground">{program.description}</p>
          )}
        </div>

        <ProgramBuilder
          programId={program.id}
          weeks={program.weeks}
          exercises={exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
          }))}
        />
      </div>
    </DashboardLayout>
  );
}
