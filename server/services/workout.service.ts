import { prisma } from "@/lib/prisma";
import { requireClientProfile } from "@/server/services/coach.service";
import type { CompleteWorkoutInput } from "@/server/validators/program.schema";

type ProgramDayWithExercises = {
  id: string;
  dayNumber: number;
  title: string | null;
  weekId: string;
  weekNumber: number;
  weekTitle: string | null;
  exercises: Array<{
    id: string;
    order: number;
    sets: number | null;
    reps: number | null;
    duration: number | null;
    restSeconds: number | null;
    notes: string | null;
    exercise: {
      id: string;
      name: string;
      muscleGroup: string;
      difficulty: string;
      instructions: string;
      videoUrl: string | null;
    };
  }>;
};

function differenceInCalendarDays(from: Date, to: Date): number {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function flattenProgramDays(
  weeks: Array<{
    weekNumber: number;
    title: string | null;
    days: Array<{
      id: string;
      dayNumber: number;
      title: string | null;
      exercises: ProgramDayWithExercises["exercises"];
    }>;
  }>,
): ProgramDayWithExercises[] {
  return weeks.flatMap((week) =>
    week.days.map((day) => ({
      id: day.id,
      dayNumber: day.dayNumber,
      title: day.title,
      weekId: "",
      weekNumber: week.weekNumber,
      weekTitle: week.title,
      exercises: day.exercises,
    })),
  );
}

function formatDayTitle(day: {
  weekNumber: number;
  dayNumber: number;
  title: string | null;
}) {
  return day.title ?? `Week ${day.weekNumber}, Day ${day.dayNumber}`;
}

const activeProgramInclude = {
  program: {
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" as const },
        include: {
          days: {
            orderBy: { dayNumber: "asc" as const },
            include: {
              exercises: {
                orderBy: { order: "asc" as const },
                include: { exercise: true },
              },
            },
          },
        },
      },
    },
  },
  completions: {
    select: { programDayId: true, completedAt: true },
  },
};

export async function getActiveClientProgram(clientUserId: string) {
  const client = await requireClientProfile(clientUserId);

  return prisma.clientProgram.findFirst({
    where: { clientProfileId: client.id, isActive: true },
    include: activeProgramInclude,
  });
}

export async function getTodaysWorkout(clientUserId: string) {
  const assignment = await getActiveClientProgram(clientUserId);

  if (!assignment) {
    return { assignment: null, scheduledDay: null, completedToday: false };
  }

  const allDays = flattenProgramDays(assignment.program.weeks);

  if (allDays.length === 0) {
    return { assignment, scheduledDay: null, completedToday: false };
  }

  const daysElapsed = Math.max(
    0,
    differenceInCalendarDays(assignment.startDate, new Date()),
  );
  const scheduledDay = allDays[daysElapsed % allDays.length]!;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const completedToday = assignment.completions.some(
    (completion) =>
      completion.programDayId === scheduledDay.id &&
      completion.completedAt >= todayStart,
  );

  return { assignment, scheduledDay, completedToday };
}

export async function getClientWorkoutOverview(clientUserId: string) {
  const assignment = await getActiveClientProgram(clientUserId);

  if (!assignment) {
    return null;
  }

  const allDays = flattenProgramDays(assignment.program.weeks);
  const completedDayIds = new Set(
    assignment.completions.map((c) => c.programDayId),
  );
  const recentCompletions = await prisma.workoutCompletion.findMany({
    where: {
      clientProgramId: assignment.id,
    },
    orderBy: { completedAt: "desc" },
    take: 10,
    include: {
      programDay: {
        include: {
          week: true,
        },
      },
    },
  });

  const completedWorkouts = assignment.completions.length;
  const completionRate =
    allDays.length === 0
      ? 0
      : Math.round((completedDayIds.size / allDays.length) * 100);

  return {
    assignment: {
      id: assignment.id,
      startDate: assignment.startDate,
      program: {
        id: assignment.program.id,
        title: assignment.program.title,
        description: assignment.program.description,
      },
    },
    days: allDays.map((day) => ({
      ...day,
      completed: completedDayIds.has(day.id),
    })),
    stats: {
      totalWorkouts: allDays.length,
      completedWorkouts,
      completionRate,
    },
    recentCompletions: recentCompletions.map((completion) => ({
      id: completion.id,
      completedAt: completion.completedAt,
      notes: completion.notes,
      dayTitle: formatDayTitle({
        weekNumber: completion.programDay.week.weekNumber,
        dayNumber: completion.programDay.dayNumber,
        title: completion.programDay.title,
      }),
      weekNumber: completion.programDay.week.weekNumber,
      dayNumber: completion.programDay.dayNumber,
    })),
    todaysWorkout: await getTodaysWorkout(clientUserId),
  };
}

export async function completeWorkout(
  clientUserId: string,
  input: CompleteWorkoutInput,
) {
  const client = await requireClientProfile(clientUserId);
  const assignment = await getActiveClientProgram(clientUserId);

  if (!assignment) {
    throw new Error("NO_ACTIVE_PROGRAM");
  }

  const dayBelongsToProgram = assignment.program.weeks.some((week) =>
    week.days.some((day) => day.id === input.programDayId),
  );

  if (!dayBelongsToProgram) {
    throw new Error("FORBIDDEN");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existingToday = await prisma.workoutCompletion.findFirst({
    where: {
      clientProfileId: client.id,
      programDayId: input.programDayId,
      clientProgramId: assignment.id,
      completedAt: { gte: todayStart },
    },
  });

  if (existingToday) {
    throw new Error("ALREADY_COMPLETED");
  }

  return prisma.workoutCompletion.create({
    data: {
      clientProfileId: client.id,
      programDayId: input.programDayId,
      clientProgramId: assignment.id,
      notes: input.notes || null,
    },
  });
}

export async function getClientDashboardWorkoutSummary(clientUserId: string) {
  const { assignment, scheduledDay, completedToday } =
    await getTodaysWorkout(clientUserId);

  if (!assignment || !scheduledDay) {
    return {
      hasProgram: false,
      programTitle: null,
      workoutTitle: null,
      exerciseCount: 0,
      completedToday: false,
    };
  }

  const workoutTitle =
    scheduledDay.title ??
    `Week ${scheduledDay.weekNumber}, Day ${scheduledDay.dayNumber}`;

  return {
    hasProgram: true,
    programTitle: assignment.program.title,
    workoutTitle,
    exerciseCount: scheduledDay.exercises.length,
    completedToday,
  };
}
