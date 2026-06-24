import { Difficulty, MuscleGroup } from "@prisma/client";
import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().optional(),
);

export const createExerciseSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  muscleGroup: z.nativeEnum(MuscleGroup),
  difficulty: z.nativeEnum(Difficulty),
  instructions: z.string().min(10).max(5000).trim(),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

export const updateExerciseSchema = createExerciseSchema;

export const createProgramSchema = z.object({
  title: z.string().min(2).max(120).trim(),
  description: z.string().max(1000).trim().optional().or(z.literal("")),
  isTemplate: z.coerce.boolean().optional().default(true),
});

export const updateProgramSchema = createProgramSchema.partial();

export const addWeekSchema = z.object({
  title: z.string().max(120).trim().optional().or(z.literal("")),
});

export const addDaySchema = z.object({
  title: z.string().max(120).trim().optional().or(z.literal("")),
});

export const updateWeekSchema = addWeekSchema;

export const updateDaySchema = addDaySchema;

export const addProgramExerciseSchema = z.object({
  exerciseId: z.string().cuid(),
  sets: optionalNumber.pipe(z.number().int().min(1).max(20).optional()),
  reps: optionalNumber.pipe(z.number().int().min(1).max(100).optional()),
  duration: optionalNumber.pipe(z.number().int().min(1).max(3600).optional()),
  restSeconds: optionalNumber.pipe(z.number().int().min(0).max(600).optional()),
  notes: z.string().max(500).trim().optional().or(z.literal("")),
});

export const updateProgramExerciseSchema = addProgramExerciseSchema.omit({
  exerciseId: true,
});

export const assignProgramSchema = z.object({
  clientProfileId: z.string().cuid(),
  programId: z.string().cuid(),
});

export const deactivateAssignmentSchema = z.object({
  clientProgramId: z.string().cuid(),
});

export const completeWorkoutSchema = z.object({
  programDayId: z.string().cuid(),
  notes: z.string().max(500).trim().optional().or(z.literal("")),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type AddProgramExerciseInput = z.infer<typeof addProgramExerciseSchema>;
export type UpdateProgramExerciseInput = z.infer<typeof updateProgramExerciseSchema>;
export type AssignProgramInput = z.infer<typeof assignProgramSchema>;
export type DeactivateAssignmentInput = z.infer<typeof deactivateAssignmentSchema>;
export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>;
