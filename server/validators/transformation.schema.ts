import { z } from "zod";

export const createTransformationSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  quote: z.string().min(10).max(500).trim(),
  story: z.string().min(20).max(2000).trim(),
  beforeWeight: z.coerce.number().positive().max(500).optional().nullable(),
  afterWeight: z.coerce.number().positive().max(500).optional().nullable(),
  duration: z.string().max(50).trim().optional().nullable(),
  programName: z.string().max(100).trim().optional().nullable(),
});

export type CreateTransformationInput = z.infer<typeof createTransformationSchema>;
