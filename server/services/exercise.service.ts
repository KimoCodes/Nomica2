import { prisma } from "@/lib/prisma";
import { requireCoachProfile } from "@/server/services/coach.service";
import type {
  CreateExerciseInput,
  UpdateExerciseInput,
} from "@/server/validators/program.schema";

export async function getExercisesForCoach(coachUserId: string) {
  const coach = await requireCoachProfile(coachUserId);

  return prisma.exercise.findMany({
    where: {
      OR: [{ coachId: null }, { coachId: coach.id }],
    },
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
    take: 200,
  });
}

export async function getExerciseById(exerciseId: string, coachUserId: string) {
  const coach = await requireCoachProfile(coachUserId);

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) {
    return null;
  }

  if (exercise.coachId && exercise.coachId !== coach.id) {
    throw new Error("FORBIDDEN");
  }

  return exercise;
}

export async function createExercise(
  coachUserId: string,
  input: CreateExerciseInput,
) {
  const coach = await requireCoachProfile(coachUserId);

  return prisma.exercise.create({
    data: {
      name: input.name,
      muscleGroup: input.muscleGroup,
      difficulty: input.difficulty,
      instructions: input.instructions,
      videoUrl: input.videoUrl || null,
      coachId: coach.id,
    },
  });
}

export async function updateExercise(
  coachUserId: string,
  exerciseId: string,
  input: UpdateExerciseInput,
) {
  const exercise = await getExerciseById(exerciseId, coachUserId);

  if (!exercise) {
    throw new Error("NOT_FOUND");
  }

  if (!exercise.coachId) {
    throw new Error("SYSTEM_EXERCISE_READONLY");
  }

  return prisma.exercise.update({
    where: { id: exerciseId },
    data: {
      name: input.name,
      muscleGroup: input.muscleGroup,
      difficulty: input.difficulty,
      instructions: input.instructions,
      videoUrl: input.videoUrl || null,
    },
  });
}

export async function deleteExercise(coachUserId: string, exerciseId: string) {
  const exercise = await getExerciseById(exerciseId, coachUserId);

  if (!exercise) {
    throw new Error("NOT_FOUND");
  }

  if (!exercise.coachId) {
    throw new Error("SYSTEM_EXERCISE_READONLY");
  }

  const inUse = await prisma.programExercise.count({
    where: { exerciseId },
  });

  if (inUse > 0) {
    throw new Error("EXERCISE_IN_USE");
  }

  return prisma.exercise.delete({
    where: { id: exerciseId },
  });
}
