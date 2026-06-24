import { z } from "zod";

const optionalMetric = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().positive().max(1000).optional(),
);

export const createProgressLogSchema = z
  .object({
    weight: optionalMetric,
    bodyFat: optionalMetric.pipe(z.number().max(100).optional()),
    waist: optionalMetric,
    chest: optionalMetric,
    hips: optionalMetric,
    notes: z.string().max(1000).trim().optional().or(z.literal("")),
  })
  .refine(
    (input) =>
      input.weight ||
      input.bodyFat ||
      input.waist ||
      input.chest ||
      input.hips ||
      input.notes,
    {
      message: "Add at least one metric or note",
    },
  );

export type CreateProgressLogInput = z.infer<typeof createProgressLogSchema>;
