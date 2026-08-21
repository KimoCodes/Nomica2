import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { WorkoutTracker } from "./workout-tracker";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole([Role.CLIENT]);
  const { id } = await params;

  const programDay = await prisma.programDay.findUnique({
    where: { id },
    include: {
      week: {
        include: {
          program: {
            select: { id: true, title: true, description: true },
          },
        },
      },
      exercises: {
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
              muscleGroup: true,
              difficulty: true,
              videoUrl: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!programDay) {
    notFound();
  }

  const client = await prisma.clientProfile.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!client) {
    notFound();
  }

  const assignment = await prisma.clientProgram.findFirst({
    where: {
      clientProfileId: client.id,
      isActive: true,
      programId: programDay.week.program.id,
    },
    select: { id: true },
  });

  if (!assignment) {
    notFound();
  }

  const existingCompletion = await prisma.workoutCompletion.findFirst({
    where: {
      clientProfileId: client.id,
      programDayId: id,
    },
    include: {
      setLogs: {
        orderBy: [{ programExerciseId: "asc" }, { setNumber: "asc" }],
      },
    },
  });

  return (
    <DashboardLayout
      title="Workout"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/client/workouts"
            className="rounded-lg border border-border/50 p-2 transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {programDay.title || `Day ${programDay.dayNumber}`}
            </h2>
            <p className="text-sm text-muted-foreground">
              Week {programDay.week.weekNumber} &middot;{" "}
              {programDay.week.program.title}
            </p>
          </div>
        </div>

        {existingCompletion ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="size-4" />
              <span className="font-medium">Completed</span>
              <span className="text-green-600">
                &middot;{" "}
                {existingCompletion.completedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ) : null}

        <WorkoutTracker
          programDayId={id}
          clientProgramId={assignment?.id ?? ""}
          exercises={programDay.exercises.map((pe) => ({
            id: pe.id,
            exerciseId: pe.exercise.id,
            name: pe.exercise.name,
            muscleGroup: pe.exercise.muscleGroup,
            difficulty: pe.exercise.difficulty,
            videoUrl: pe.exercise.videoUrl,
            sets: pe.sets ?? 3,
            reps: pe.reps ?? 10,
            restSeconds: pe.restSeconds ?? 60,
            notes: pe.notes,
            order: pe.order,
          }))}
          isCompleted={!!existingCompletion}
          existingSetLogs={existingCompletion?.setLogs.map((sl) => ({
            programExerciseId: sl.programExerciseId,
            setNumber: sl.setNumber,
            actualReps: sl.actualReps,
            actualWeight: sl.actualWeight,
            completed: sl.completed,
          })) ?? []}
          existingNotes={existingCompletion?.notes ?? ""}
        />
      </div>
    </DashboardLayout>
  );
}
