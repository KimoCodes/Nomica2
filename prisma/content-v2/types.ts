import type { Difficulty, MuscleGroup, ProductFocus, ProductKind } from "@prisma/client";

/**
 * Phase 2 content package (v2).
 *
 * These files are the reviewable source of truth for the professional rewrite
 * of every NomiTips-owned program. `scripts/phase3-load.ts` applies them to the
 * database; nothing here is written to the DB by importing it.
 *
 * Conventions (see docs/PHASE1-PROGRAM-BLUEPRINTS.md, Part 2):
 * - Every session = warm-up rows + main work + cooldown rows.
 * - `notes` carries labels (Warm-up/Cooldown), tempo, RPE, "Each side", band
 *   level and substitutions.
 * - Week titles are the weekly objective; day titles are the session objective.
 * - Exercise instructions live in Exercise.instructions as labelled lines
 *   separated by "\n" (rendered with whitespace-pre-line).
 */

/** A full exercise instruction block for the Exercise.instructions column. */
export type ExerciseInstruction = {
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  /** Labelled lines joined with "\n": Set-up / Execution / Breathing / Watch for (+ Easier / Harder). */
  instructions: string;
};

/** One row inside a ProgramDay (ProgramExercise). */
export type ExSpec = {
  name: string;
  sets: number;
  reps?: number;
  seconds?: number;
  rest: number;
  notes?: string;
};

/** One session: warm-up rows first, main work, cooldown rows last. */
export type DayTemplate = {
  title: string;
  exercises: ExSpec[];
};

/** One week with its explicit weekly objective and its days (day 1..n). */
export type WeekTemplate = {
  title: string;
  days: DayTemplate[];
};

/** A complete program draft keyed by product slug. */
export type ProgramV2 = {
  slug: string;
  title: string;
  weeks: WeekTemplate[];
};

/** Final storefront copy for a Product row. */
export type ProductCopy = {
  slug: string;
  name: string;
  kind: ProductKind;
  tagline: string;
  /** Full program introduction — rendered on the owned-program page. */
  description: string;
  features: string[];
  equipment: string[];
  priceCents: number;
  durationLabel: string;
  durationWeeks?: number | null;
  durationDays?: number | null;
  daysPerWeek?: number | null;
  focus?: ProductFocus | null;
  difficulty: Difficulty;
  sortOrder: number;
};
