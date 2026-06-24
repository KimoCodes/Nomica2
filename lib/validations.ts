import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .trim(),
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number",
    ),
  role: z.enum(["CLIENT", "COACH"]),
});

export const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  muscleGroup: z.string().min(1, "Muscle group is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  videoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  instructions: z.string().min(1, "Instructions are required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
