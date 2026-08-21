import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  muscleGroup: z.string().min(1, "Muscle group is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  videoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  instructions: z.string().min(1, "Instructions are required"),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
