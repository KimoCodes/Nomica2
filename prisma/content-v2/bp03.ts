import type { ProgramV2 } from "./types";
import { cd, ex, exSec, wu } from "./warmup";

/**
 * BP-03 · 21-Day Strong Abs & Core Challenge (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 3 weeks × 5 days · trunk motor control and local endurance built on four
 * categories (R8): anti-extension, anti-rotation, lateral control and dynamic
 * flexion. Each day takes one category as primary; every session carries one
 * compound movement (R9) so the trunk works under load, not only on the floor.
 * Week 1 braces with isometrics, week 2 adds motion and instability, week 3
 * integrates everything into 3-round circuits with carries. No deload in three
 * weeks (R11 places deloads at 4–6 week intervals).
 * Every session: `wu("core")` + 4–5 main rows + `cd("core")`.
 */

export const BP03: ProgramV2 = {
  slug: "21-day-strong-abs-and-core-challenge",
  title: "21-Day Strong Abs & Core Challenge",
  weeks: [
    // ── Week 1 · Foundation ────────────────────────────────────────────────
    {
      title: "Foundation — learn to brace",
      days: [
        {
          title: "Core Foundation",
          exercises: [
            ...wu("core"),
            exSec("Plank", 3, 40, 45, "Anti-extension · breathe steadily · hips level, ribs down"),
            exSec("Hollow Body Hold", 3, 25, 45, "Lower back pressed down · legs lower only as far as your back stays down"),
            ex("Push-Up", 3, 10, 60, { notes: "Compound · body in one line · or incline push-up on a bench" }),
            ex("Dead Bug", 3, 10, 45, { notes: "Bracing · lower back pressed down · three-second reach" }),
            ex("Bird Dog", 3, 10, 45, { notes: "Each side · anti-rotation · pause three seconds at full extension" }),
            ...cd("core"),
          ],
        },
        {
          title: "Lower Abs",
          exercises: [
            ...wu("core"),
            exSec("Hollow Body Hold", 3, 20, 45, "Brace first · lower back stays down the whole time"),
            ex("Lying Leg Raise", 3, 8, 45, { notes: "Slow · lower back pressed down · lower only as far as it stays down" }),
            ex("Heel Tap", 3, 12, 45, { notes: "Slow · ribs down · small, controlled range" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · compound · soft step back, torso upright" }),
            ...cd("core"),
          ],
        },
        {
          title: "Obliques",
          exercises: [
            ...wu("core"),
            exSec("Side Plank", 3, 30, 45, "Each side · hips high and stacked · keep breathing"),
            ex("Standing Side Crunch", 3, 12, 45, { notes: "Each side · elbow toward hip · hand stays light behind the head" }),
            ex("Russian Twist", 3, 12, 45, { notes: "6 each side · feet down · rotate from the ribs, slow" }),
            ex("Step-Up", 3, 10, 60, { notes: "Each side · compound · drive through the top foot" }),
            ...cd("core"),
          ],
        },
        {
          title: "Deep Core",
          exercises: [
            ...wu("core"),
            ex("Band Pallof Press", 3, 12, 45, { notes: "Each side · anti-rotation · no band? hold a Bird Dog for three seconds instead" }),
            ex("Bird Dog", 3, 10, 45, { notes: "Each side · hips stay level · three-second pause" }),
            ex("Dead Bug", 3, 10, 45, { notes: "Bracing · exhale as the arm travels back · lower back pressed down" }),
            ex("Goblet Squat", 3, 10, 60, { notes: "Compound · bodyweight this week, hands at your chest · knees track over the toes" }),
            ...cd("core"),
          ],
        },
        {
          title: "Core Circuit",
          exercises: [
            ...wu("core"),
            exSec("Plank", 2, 35, 45, "Technique circuit · round-based · breathe steadily, hips level"),
            exSec("Side Plank", 2, 30, 45, "Each side · round-based · hips high and stacked"),
            ex("Dead Bug", 2, 10, 45, { notes: "Round-based · lower back pressed down" }),
            ex("Push-Up", 2, 10, 60, { notes: "Compound · round-based · easy pace, body in one line" }),
            ...cd("core"),
          ],
        },
      ],
    },

    // ── Week 2 · Build ─────────────────────────────────────────────────────
    {
      title: "Build — add motion",
      days: [
        {
          title: "Core Foundation",
          exercises: [
            ...wu("core"),
            exSec("Plank", 3, 40, 30, "Rest −15s vs week 1 · breathe steadily · hips level"),
            exSec("Marching Plank", 3, 30, 30, "New this week · instability · hips level, no rocking side to side"),
            ex("Push-Up", 3, 10, 45, { notes: "Rest −15s vs week 1 · body in one line" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Rest −15s vs week 1 · lower back pressed down" }),
            ex("Bird Dog", 3, 10, 30, { notes: "Each side · rest −15s vs week 1 · pause three seconds" }),
            ...cd("core"),
          ],
        },
        {
          title: "Lower Abs",
          exercises: [
            ...wu("core"),
            exSec("Hollow Body Hold", 3, 20, 30, "Rest −15s vs week 1 · lower back stays down"),
            ex("Lying Leg Raise", 3, 8, 30, { notes: "Rest −15s vs week 1 · slow, control over range" }),
            ex("Heel Tap", 3, 12, 30, { notes: "Rest −15s vs week 1 · ribs down" }),
            ex("Flutter Kicks", 3, 15, 30, { notes: "New this week · lower back pressed down · small quick kicks" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · compound · rest −15s vs week 1" }),
            ...cd("core"),
          ],
        },
        {
          title: "Obliques",
          exercises: [
            ...wu("core"),
            exSec("Side Plank", 3, 30, 30, "Each side · rest −15s vs week 1 · hips high"),
            ex("Standing Side Crunch", 3, 12, 30, { notes: "Each side · rest −15s vs week 1 · elbow toward hip" }),
            ex("Russian Twist", 3, 12, 30, { notes: "6 each side · rest −15s vs week 1 · rotate from the ribs" }),
            ex("Bicycle Crunch", 3, 16, 30, { notes: "New this week · 8 each side · slow · light hands behind the head" }),
            ex("Step-Up", 3, 10, 45, { notes: "Each side · compound · drive through the top foot" }),
            ...cd("core"),
          ],
        },
        {
          title: "Deep Core",
          exercises: [
            ...wu("core"),
            ex("Band Pallof Press", 3, 12, 30, { notes: "Each side · three-second pause at full press · resist the twist" }),
            ex("Bird Dog", 3, 10, 30, { notes: "Each side · hips stay level · slower than week 1" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Bracing · rest −15s vs week 1 · exhale on the reach" }),
            ex("Goblet Squat", 3, 10, 45, { notes: "Compound · bodyweight · knees track over the toes · brace before you descend" }),
            ...cd("core"),
          ],
        },
        {
          title: "Core Circuit",
          exercises: [
            ...wu("core"),
            exSec("Plank", 3, 35, 30, "Circuit · 3 rounds · rest 30s between rounds"),
            exSec("Side Plank", 3, 30, 30, "Each side · circuit · hips high and stacked"),
            ex("Dead Bug", 3, 10, 30, { notes: "Circuit · lower back pressed down" }),
            ex("Push-Up", 3, 10, 30, { notes: "Compound · circuit · body in one line" }),
            ...cd("core"),
          ],
        },
      ],
    },

    // ── Week 3 · Express ───────────────────────────────────────────────────
    {
      title: "Express — integrate and carry",
      days: [
        {
          title: "Core Foundation",
          exercises: [
            ...wu("core"),
            exSec("Plank", 3, 50, 30, "Circuit · longer final hold · breathe steadily, hips level"),
            ex("Push-Up", 3, 12, 30, { notes: "Compound pairing · round-based · or incline push-up" }),
            ex("Dead Bug", 3, 12, 30, { notes: "Round-based · +2 reps vs week 2 · lower back pressed down" }),
            ex("Bird Dog", 3, 12, 30, { notes: "Each side · round-based · three-second pause" }),
            ex("Marching Plank", 3, 35, 30, { notes: "Round-based · instability · hips level, no rocking" }),
            ...cd("core"),
          ],
        },
        {
          title: "Lower Abs",
          exercises: [
            ...wu("core"),
            ex("Reverse Lunge", 3, 12, 30, { notes: "Compound pairing · round-based · control over speed" }),
            ex("Lying Leg Raise", 3, 10, 30, { notes: "Round-based · +2 reps vs week 2 · lower back pressed down" }),
            ex("V-Up", 3, 8, 30, { notes: "New this week · advanced · lower back pressed down · stop if it arches" }),
            ex("Flutter Kicks", 3, 20, 30, { notes: "Round-based · +5 reps vs week 2 · small quick kicks" }),
            exSec("Hollow Body Hold", 3, 30, 30, "Longer final hold · +10s vs week 2 · lower back stays down"),
            ...cd("core"),
          ],
        },
        {
          title: "Obliques",
          exercises: [
            ...wu("core"),
            exSec("Side Plank", 3, 40, 30, "Each side · longer hold · +10s vs week 2 · hips high"),
            ex("Bicycle Crunch", 3, 20, 30, { notes: "Round-based · 10 each side · slow, no yanking the neck" }),
            ex("Standing Side Crunch", 3, 15, 30, { notes: "Each side · +3 reps vs week 2 · elbow toward hip" }),
            ex("Russian Twist", 3, 16, 30, { notes: "8 each side · round-based · rotate from the ribs" }),
            ex("Step-Up", 3, 12, 30, { notes: "Each side · compound pairing · light dumbbell optional" }),
            ...cd("core"),
          ],
        },
        {
          title: "Deep Core",
          exercises: [
            ...wu("core"),
            ex("Band Pallof Press", 3, 12, 30, { notes: "Each side · three-second pause · anti-rotation under tension" }),
            ex("Goblet Squat", 3, 12, 45, { notes: "Compound · light dumbbell this week · brace hard before every rep" }),
            ex("Bird Dog", 3, 12, 30, { notes: "Each side · round-based · hips stay level" }),
            ex("Dead Bug", 3, 12, 30, { notes: "Round-based · exhale on the reach" }),
            exSec("March in Place", 3, 40, 30, "Loaded carry · light dumbbell at your chest (or band at shoulder height) · stay tall"),
            ...cd("core"),
          ],
        },
        {
          title: "Core Circuit",
          exercises: [
            ...wu("core"),
            ex("Push-Up", 3, 12, 30, { notes: "Compound pairing · circuit · body in one line" }),
            ex("V-Up", 3, 8, 30, { notes: "New on this day · lower back pressed down · stop if it arches" }),
            ex("Bicycle Crunch", 3, 20, 30, { notes: "Circuit · 10 each side · light hands behind the head" }),
            exSec("Plank", 3, 50, 30, "Longer final hold · breathe steadily · hips level"),
            exSec("Side Plank", 3, 40, 30, "Each side · longer hold · hips high and stacked"),
            ...cd("core"),
          ],
        },
      ],
    },
  ],
};

export default BP03;
