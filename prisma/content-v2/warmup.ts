import type { ExSpec } from "./types";

/**
 * Warm-up and cooldown row builders shared by every v2 program.
 *
 * Rows are ordinary ProgramExercise entries so they render in the client
 * program page and the workout player without any schema change. Labels live
 * in `notes` ("Warm-up · …" / "Cooldown · …").
 *
 * Session skeleton (docs/PHASE1-PROGRAM-BLUEPRINTS.md §2.1):
 *   1 pulse raiser → 1 dynamic mobility → 1 activation → main work → 2 cooldown
 */

/** Rep-based row. */
export const ex = (
  name: string,
  sets: number,
  repsOrSeconds: number,
  rest: number,
  opts?: { seconds?: boolean; notes?: string },
): ExSpec =>
  opts?.seconds
    ? { name, sets, seconds: repsOrSeconds, rest, notes: opts.notes }
    : { name, sets, reps: repsOrSeconds, rest, notes: opts?.notes };

/** Time-based row (duration in seconds). */
export const exSec = (
  name: string,
  sets: number,
  seconds: number,
  rest: number,
  notes?: string,
): ExSpec => ({ name, sets, seconds, rest, notes });

export type SessionKind = "lower" | "glutes" | "upper" | "core" | "conditioning";

const WARMUPS: Record<SessionKind, ExSpec[]> = {
  // Legs / full-body strength days
  lower: [
    exSec("March in Place", 1, 40, 10, "Warm-up · pulse raiser"),
    exSec("World's Greatest Stretch", 1, 30, 10, "Warm-up · dynamic mobility · 15s each side"),
    ex("Glute Bridge", 1, 12, 10, { notes: "Warm-up · activation · squeeze at the top" }),
  ],
  // Glute-focused band days
  glutes: [
    exSec("March in Place", 1, 40, 10, "Warm-up · pulse raiser"),
    exSec("Cat-Cow", 1, 30, 10, "Warm-up · dynamic mobility · slow with your breath"),
    ex("Glute Bridge", 1, 12, 10, { notes: "Warm-up · glute activation · ribs down" }),
  ],
  // Upper-body days
  upper: [
    exSec("Step Jack", 1, 40, 10, "Warm-up · pulse raiser"),
    exSec("Torso Rotation", 1, 30, 10, "Warm-up · thoracic mobility · pivot on your toes"),
    ex("Rear Delt Fly", 1, 12, 10, { notes: "Warm-up · scapular activation · very light load" }),
  ],
  // Trunk / core days
  core: [
    exSec("Torso Rotation", 1, 30, 10, "Warm-up · gentle rotation · keep hips facing forward"),
    exSec("Cat-Cow", 1, 30, 10, "Warm-up · segmental mobility · slow with your breath"),
    ex("Dead Bug", 1, 8, 10, { notes: "Warm-up · bracing activation · lower back pressed down" }),
  ],
  // Conditioning / circuit days
  conditioning: [
    exSec("March in Place", 1, 40, 10, "Warm-up · pulse raiser"),
    exSec("Torso Rotation", 1, 30, 10, "Warm-up · dynamic mobility"),
    ex("Squat to Calf Raise", 1, 10, 10, { notes: "Warm-up · movement rehearsal" }),
  ],
};

const COOLDOWNS: Record<SessionKind, ExSpec[]> = {
  lower: [
    exSec("Child's Pose", 1, 45, 10, "Cooldown · hold 45s · breathe into your back"),
    exSec("Hip Flexor Stretch", 1, 40, 10, "Cooldown · 20s each side · tuck your pelvis"),
  ],
  glutes: [
    exSec("Hip Flexor Stretch", 1, 40, 10, "Cooldown · 20s each side · tuck your pelvis"),
    exSec("Child's Pose", 1, 45, 10, "Cooldown · hold 45s · breathe into your back"),
  ],
  upper: [
    exSec("Torso Rotation", 1, 30, 10, "Cooldown · slow rotation · let your arms swing"),
    exSec("Child's Pose", 1, 45, 10, "Cooldown · hold 45s · reach your arms long"),
  ],
  core: [
    exSec("Child's Pose", 1, 45, 10, "Cooldown · hold 45s · breathe into your back"),
    exSec("Cat-Cow", 1, 30, 10, "Cooldown · gentle motion · no forcing"),
  ],
  conditioning: [
    exSec("Hamstring Stretch", 1, 40, 10, "Cooldown · 20s each side · hinge from the hips"),
    exSec("Hip Flexor Stretch", 1, 40, 10, "Cooldown · 20s each side · tuck your pelvis"),
  ],
};

/** Warm-up rows for a session kind (3 rows). */
export const wu = (kind: SessionKind): ExSpec[] => WARMUPS[kind].map((r) => ({ ...r }));

/** Cooldown rows for a session kind (2 rows). */
export const cd = (kind: SessionKind): ExSpec[] => COOLDOWNS[kind].map((r) => ({ ...r }));
