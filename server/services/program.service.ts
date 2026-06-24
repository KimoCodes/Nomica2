import { prisma } from "@/lib/prisma";
import { requireCoachProfile } from "@/server/services/coach.service";
import type {
  AddProgramExerciseInput,
  CreateProgramInput,
  UpdateProgramExerciseInput,
} from "@/server/validators/program.schema";

const programInclude = {
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
  _count: { select: { assignments: true } },
};

export async function requireOwnedProgram(coachUserId: string, programId: string) {
  const coach = await requireCoachProfile(coachUserId);

  const program = await prisma.program.findUnique({
    where: { id: programId },
  });

  if (!program) {
    throw new Error("NOT_FOUND");
  }

  if (program.coachId !== coach.id) {
    throw new Error("FORBIDDEN");
  }

  return { coach, program };
}

export async function getProgramsByCoach(coachUserId: string) {
  const coach = await requireCoachProfile(coachUserId);

  return prisma.program.findMany({
    where: { coachId: coach.id },
    include: {
      weeks: { select: { id: true } },
      _count: { select: { assignments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProgramById(coachUserId: string, programId: string) {
  await requireOwnedProgram(coachUserId, programId);

  return prisma.program.findUnique({
    where: { id: programId },
    include: programInclude,
  });
}

export async function createProgram(
  coachUserId: string,
  input: CreateProgramInput,
) {
  const coach = await requireCoachProfile(coachUserId);

  return prisma.program.create({
    data: {
      title: input.title,
      description: input.description || null,
      isTemplate: input.isTemplate ?? true,
      coachId: coach.id,
    },
  });
}

export async function updateProgram(
  coachUserId: string,
  programId: string,
  input: Partial<CreateProgramInput>,
) {
  await requireOwnedProgram(coachUserId, programId);

  return prisma.program.update({
    where: { id: programId },
    data: {
      title: input.title,
      description: input.description === "" ? null : input.description,
      isTemplate: input.isTemplate,
    },
  });
}

export async function deleteProgram(coachUserId: string, programId: string) {
  await requireOwnedProgram(coachUserId, programId);

  const activeAssignments = await prisma.clientProgram.count({
    where: { programId, isActive: true },
  });

  if (activeAssignments > 0) {
    throw new Error("PROGRAM_HAS_ACTIVE_ASSIGNMENTS");
  }

  return prisma.program.delete({ where: { id: programId } });
}

export async function duplicateProgram(coachUserId: string, programId: string) {
  const source = await getProgramById(coachUserId, programId);

  if (!source) {
    throw new Error("NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const copy = await tx.program.create({
      data: {
        title: `${source.title} (Copy)`,
        description: source.description,
        isTemplate: source.isTemplate,
        coachId: source.coachId,
      },
    });

    for (const week of source.weeks) {
      const newWeek = await tx.programWeek.create({
        data: {
          programId: copy.id,
          weekNumber: week.weekNumber,
          title: week.title,
        },
      });

      for (const day of week.days) {
        const newDay = await tx.programDay.create({
          data: {
            weekId: newWeek.id,
            dayNumber: day.dayNumber,
            title: day.title,
          },
        });

        for (const programExercise of day.exercises) {
          await tx.programExercise.create({
            data: {
              dayId: newDay.id,
              exerciseId: programExercise.exerciseId,
              order: programExercise.order,
              sets: programExercise.sets,
              reps: programExercise.reps,
              duration: programExercise.duration,
              restSeconds: programExercise.restSeconds,
              notes: programExercise.notes,
            },
          });
        }
      }
    }

    return copy;
  });
}

export async function addProgramWeek(
  coachUserId: string,
  programId: string,
  title?: string,
) {
  await requireOwnedProgram(coachUserId, programId);

  const lastWeek = await prisma.programWeek.findFirst({
    where: { programId },
    orderBy: { weekNumber: "desc" },
  });

  return prisma.programWeek.create({
    data: {
      programId,
      weekNumber: (lastWeek?.weekNumber ?? 0) + 1,
      title: title || null,
    },
  });
}

export async function updateProgramWeek(
  coachUserId: string,
  weekId: string,
  title?: string,
) {
  const week = await prisma.programWeek.findUnique({
    where: { id: weekId },
  });

  if (!week) {
    throw new Error("NOT_FOUND");
  }

  await requireOwnedProgram(coachUserId, week.programId);

  return prisma.programWeek.update({
    where: { id: weekId },
    data: { title: title || null },
  });
}

export async function deleteProgramWeek(coachUserId: string, weekId: string) {
  const week = await prisma.programWeek.findUnique({
    where: { id: weekId },
  });

  if (!week) {
    throw new Error("NOT_FOUND");
  }

  await requireOwnedProgram(coachUserId, week.programId);

  return prisma.programWeek.delete({
    where: { id: weekId },
  });
}

export async function addProgramDay(
  coachUserId: string,
  weekId: string,
  title?: string,
) {
  const week = await prisma.programWeek.findUnique({
    where: { id: weekId },
    include: { program: true },
  });

  if (!week) {
    throw new Error("NOT_FOUND");
  }

  await requireOwnedProgram(coachUserId, week.programId);

  const lastDay = await prisma.programDay.findFirst({
    where: { weekId },
    orderBy: { dayNumber: "desc" },
  });

  return prisma.programDay.create({
    data: {
      weekId,
      dayNumber: (lastDay?.dayNumber ?? 0) + 1,
      title: title || null,
    },
  });
}

export async function updateProgramDay(
  coachUserId: string,
  dayId: string,
  title?: string,
) {
  const day = await prisma.programDay.findUnique({
    where: { id: dayId },
    include: { week: true },
  });

  if (!day) {
    throw new Error("NOT_FOUND");
  }

  await requireOwnedProgram(coachUserId, day.week.programId);

  return prisma.programDay.update({
    where: { id: dayId },
    data: { title: title || null },
  });
}

export async function deleteProgramDay(coachUserId: string, dayId: string) {
  const day = await prisma.programDay.findUnique({
    where: { id: dayId },
    include: { week: true },
  });

  if (!day) {
    throw new Error("NOT_FOUND");
  }

  await requireOwnedProgram(coachUserId, day.week.programId);

  return prisma.programDay.delete({
    where: { id: dayId },
  });
}

export async function addExerciseToDay(
  coachUserId: string,
  dayId: string,
  input: AddProgramExerciseInput,
) {
  const day = await prisma.programDay.findUnique({
    where: { id: dayId },
    include: { week: { include: { program: true } } },
  });

  if (!day) {
    throw new Error("NOT_FOUND");
  }

  const { coach } = await requireOwnedProgram(
    coachUserId,
    day.week.programId,
  );

  const exercise = await prisma.exercise.findUnique({
    where: { id: input.exerciseId },
  });

  if (!exercise) {
    throw new Error("EXERCISE_NOT_FOUND");
  }

  if (exercise.coachId && exercise.coachId !== coach.id) {
    throw new Error("FORBIDDEN");
  }

  const lastOrder = await prisma.programExercise.findFirst({
    where: { dayId },
    orderBy: { order: "desc" },
  });

  return prisma.programExercise.create({
    data: {
      dayId,
      exerciseId: input.exerciseId,
      order: (lastOrder?.order ?? 0) + 1,
      sets: input.sets ?? null,
      reps: input.reps ?? null,
      duration: input.duration ?? null,
      restSeconds: input.restSeconds ?? null,
      notes: input.notes || null,
    },
    include: { exercise: true },
  });
}

export async function updateProgramExercise(
  coachUserId: string,
  programExerciseId: string,
  input: UpdateProgramExerciseInput,
) {
  const programExercise = await prisma.programExercise.findUnique({
    where: { id: programExerciseId },
    include: {
      day: { include: { week: { include: { program: true } } } },
    },
  });

  if (!programExercise) {
    throw new Error("NOT_FOUND");
  }

  await requireOwnedProgram(
    coachUserId,
    programExercise.day.week.programId,
  );

  return prisma.programExercise.update({
    where: { id: programExerciseId },
    data: {
      sets: input.sets ?? null,
      reps: input.reps ?? null,
      duration: input.duration ?? null,
      restSeconds: input.restSeconds ?? null,
      notes: input.notes || null,
    },
    include: { exercise: true },
  });
}

export async function removeProgramExercise(
  coachUserId: string,
  programExerciseId: string,
) {
  const programExercise = await prisma.programExercise.findUnique({
    where: { id: programExerciseId },
    include: {
      day: { include: { week: { include: { program: true } } } },
    },
  });

  if (!programExercise) {
    throw new Error("NOT_FOUND");
  }

  await requireOwnedProgram(
    coachUserId,
    programExercise.day.week.programId,
  );

  return prisma.programExercise.delete({
    where: { id: programExerciseId },
  });
}

export async function getCoachProgramStats(coachUserId: string) {
  const coach = await requireCoachProfile(coachUserId);

  const [programCount, clientCount] = await Promise.all([
    prisma.program.count({ where: { coachId: coach.id } }),
    prisma.clientProfile.count({ where: { coachId: coachUserId } }),
  ]);

  return { programCount, clientCount };
}
