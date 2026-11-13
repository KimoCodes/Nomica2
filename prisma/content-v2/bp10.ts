import type { ProgramV2 } from "./types";
import { cd, ex, exSec, wu } from "./warmup";

/**
 * BP-10 · NoMi 8-Week Signature Program (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 8 weeks × 5 days · the catalog's only concurrent program: three strength
 * sessions and two conditioning-quality sessions per week, with mobility
 * folded into every warm-up and cooldown and a low-load core day.
 * Scope correction: general fitness (strength, conditioning, balanced-eating
 * education in the product copy) — no diet plan, no weight-loss promise.
 * Deload week 4 and consolidation week 8 (R11/R12); one variable per week.
 * Every session: `wu(kind)` + 5 main rows + `cd(kind)`.
 */

export const BP10: ProgramV2 = {
  slug: "nomi-8-week-signature-program",
  title: "NoMi 8-Week Signature Program",
  weeks: [
    // ── Week 1 · Foundation ────────────────────────────────────────────────
    {
      title: "Foundation",
      days: [
        {
          title: "Strength A",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 3, 10, 75, { notes: "RPE 6–7 · elbows inside the knees · whole foot planted" }),
            ex("Dumbbell Romanian Deadlift", 3, 10, 75, { notes: "RPE 6–7 · hinge, don't squat · stop at the first hamstring stretch" }),
            ex("Dumbbell Bench Press", 3, 10, 75, { notes: "RPE 6–7 · shoulder blades pinned · ribs down" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · RPE 6–7 · front knee tracks over the toes · torso upright" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6–7 · brace on your thigh · pull the elbow past the ribs" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning",
          exercises: [
            ...wu("conditioning"),
            exSec("March in Place", 2, 60, 30, "Steady block · moderate pace · nose breathing if you can"),
            exSec("Lateral Step Touch", 2, 60, 30, "Steady block · step wide, knees soft · arms relaxed"),
            exSec("High Knees", 4, 30, 30, "Interval · 30s hard / 30s easy · low-impact option: fast march"),
            exSec("Skater", 4, 30, 30, "Interval · sit the hip back · step instead of jump to scale it down"),
            exSec("Mountain Climber", 3, 30, 30, "Interval · hips level · fast knees, quiet feet"),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Strength B",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 3, 12, 75, { notes: "RPE 6–7 · wide stance, toes turned out · knees track over the toes" }),
            ex("Dumbbell Hip Thrust", 3, 12, 75, { notes: "RPE 6–7 · upper back on the bench (or floor) · drive through the heels" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "RPE 6–7 · no arching the lower back · weights finish over the shoulders" }),
            ex("Dumbbell Bent-Over Row", 3, 10, 75, { notes: "RPE 6–7 · flat back · drive the elbows past the ribs" }),
            ex("Walking Lunge", 3, 10, 60, { notes: "Each side · RPE 6–7 · tall torso · dumbbells at your sides" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Core + Mobility",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 3, 10, 45, { notes: "Light · RPE 6 · lower back pressed down · three-second reach" }),
            ex("Plank", 3, 40, 45, { seconds: true, notes: "Light · RPE 6 · breathe steadily · hips level, ribs down" }),
            ex("Band Pallof Press", 3, 12, 45, { notes: "Each side · RPE 6 · loop band · resist the twist, ribs down" }),
            ex("Side Plank", 3, 30, 45, { seconds: true, notes: "Each side · RPE 6 · hips high and stacked · keep breathing" }),
            ex("Bird Dog", 3, 10, 45, { notes: "Each side · RPE 6 · pause three seconds at full extension" }),
            ...cd("core"),
          ],
        },
        {
          title: "Full Body + Finisher",
          exercises: [
            ...wu("conditioning"),
            ex("Push-Up", 3, 12, 60, { notes: "RPE 6–7 · body in one line · or incline push-up on a bench" }),
            ex("Goblet Squat", 3, 12, 60, { notes: "RPE 6–7 · light-to-moderate load · knees track over the toes" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · brace on a chair · pull the elbow past the ribs" }),
            ex("Glute Bridge", 3, 15, 45, { notes: "RPE 6–7 · band above the knees optional · one-second squeeze at the top" }),
            exSec("In-and-Out Squat", 3, 40, 45, "Finisher · land soft, knees soft · steady rhythm · step out if you need to"),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    // ── Week 2 · Build ─────────────────────────────────────────────────────
    {
      title: "Build",
      days: [
        {
          title: "Strength A",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 4, 10, 75, { notes: "+1 set vs week 1 · RPE 7 · own every rep before you add load" }),
            ex("Dumbbell Romanian Deadlift", 4, 10, 75, { notes: "+1 set vs week 1 · RPE 7 · hinge, don't squat" }),
            ex("Dumbbell Bench Press", 3, 10, 75, { notes: "Hold week 1 reps · RPE 7 · shoulder blades pinned" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · hold week 1 reps · front knee tracks over the toes" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · hold week 1 reps · elbow past the ribs" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning",
          exercises: [
            ...wu("conditioning"),
            exSec("March in Place", 2, 60, 30, "Steady block · hold week 1 pace · moderate effort"),
            exSec("Lateral Step Touch", 2, 60, 30, "Steady block · hold week 1 pace · knees soft"),
            exSec("High Knees", 4, 30, 30, "Interval · hold week 1 rounds · 30s hard / 30s easy"),
            exSec("Skater", 4, 30, 30, "Interval · hold week 1 rounds · step instead of jump to scale"),
            exSec("Mountain Climber", 3, 30, 30, "Interval · hips level · fast knees, quiet feet"),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Strength B",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 4, 12, 75, { notes: "+1 set vs week 1 · RPE 7 · knees track over the toes" }),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "+1 set vs week 1 · RPE 7 · ribs down, squeeze at the top" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "Hold week 1 reps · RPE 7 · no arching" }),
            ex("Dumbbell Bent-Over Row", 3, 10, 75, { notes: "Hold week 1 reps · flat back · elbows past the ribs" }),
            ex("Walking Lunge", 3, 10, 60, { notes: "Each side · hold week 1 reps · tall torso" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Core + Mobility",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 3, 10, 45, { notes: "Hold week 1 reps · RPE 6 · lower back pressed down" }),
            ex("Plank", 3, 40, 45, { seconds: true, notes: "Hold week 1 time · breathe steadily · hips level" }),
            ex("Band Pallof Press", 3, 12, 45, { notes: "Each side · hold week 1 reps · three-second pause" }),
            ex("Side Plank", 3, 30, 45, { seconds: true, notes: "Each side · hold week 1 time · hips high" }),
            ex("Bird Dog", 3, 10, 45, { notes: "Each side · slower than week 1 · pause at full extension" }),
            ...cd("core"),
          ],
        },
        {
          title: "Full Body + Finisher",
          exercises: [
            ...wu("conditioning"),
            ex("Push-Up", 3, 12, 60, { notes: "Hold week 1 reps · RPE 7 · body in one line" }),
            ex("Goblet Squat", 3, 12, 60, { notes: "Hold week 1 reps · RPE 7 · knees track over the toes" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · hold week 1 reps · elbow past the ribs" }),
            ex("Glute Bridge", 3, 15, 45, { notes: "Hold week 1 reps · one-second squeeze at the top" }),
            exSec("In-and-Out Squat", 3, 40, 40, "Finisher · rest −5s vs week 1 · land soft, steady rhythm"),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    // ── Week 3 · Volume ────────────────────────────────────────────────────
    {
      title: "Volume",
      days: [
        {
          title: "Strength A",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 4, 10, 75, { notes: "Hold week 2 volume · RPE 7 · elbows inside the knees" }),
            ex("Dumbbell Romanian Deadlift", 4, 10, 75, { notes: "Hold week 2 volume · RPE 7 · stop at the first hamstring stretch" }),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Rest −15s vs week 2 · RPE 7 · shoulder blades pinned" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · rest −15s vs week 2 · front knee tracks over the toes" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 45, { notes: "Each side · rest −15s vs week 2 · elbow past the ribs" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning",
          exercises: [
            ...wu("conditioning"),
            exSec("March in Place", 2, 60, 20, "Steady block · rest −10s vs week 2 · moderate pace"),
            exSec("Lateral Step Touch", 2, 60, 20, "Steady block · rest −10s vs week 2 · step wide"),
            exSec("High Knees", 4, 30, 20, "Interval · rest −10s vs week 2 · 30s hard / 20s easy"),
            exSec("Skater", 4, 30, 20, "Interval · rest −10s vs week 2 · sit the hip back"),
            exSec("Mountain Climber", 3, 30, 20, "Interval · rest −10s vs week 2 · hips level, fast knees"),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Strength B",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 4, 12, 75, { notes: "Hold week 2 volume · RPE 7 · wide stance" }),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "Hold week 2 volume · RPE 7 · drive through the heels" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "Rest −15s vs week 2 · RPE 7 · no arching" }),
            ex("Dumbbell Bent-Over Row", 3, 10, 60, { notes: "Rest −15s vs week 2 · flat back" }),
            ex("Walking Lunge", 3, 10, 45, { notes: "Each side · rest −15s vs week 2 · tall torso" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Core + Mobility",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 3, 12, 45, { notes: "+2 reps vs week 2 · lower back pressed down" }),
            ex("Plank", 3, 45, 45, { seconds: true, notes: "+5s vs week 2 · breathe steadily · hips level" }),
            ex("Band Pallof Press", 3, 12, 30, { notes: "Each side · rest −15s vs week 2 · resist the twist" }),
            ex("Side Plank", 3, 35, 45, { seconds: true, notes: "+5s vs week 2 · hips high and stacked" }),
            ex("Bird Dog", 3, 12, 30, { notes: "Each side · +2 reps vs week 2 · three-second pause" }),
            ...cd("core"),
          ],
        },
        {
          title: "Full Body + Finisher",
          exercises: [
            ...wu("conditioning"),
            ex("Push-Up", 3, 14, 60, { notes: "+2 reps vs week 2 · body in one line · or incline push-up" }),
            ex("Goblet Squat", 3, 12, 45, { notes: "Rest −15s vs week 2 · RPE 7 · knees track over the toes" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 45, { notes: "Each side · rest −15s vs week 2 · elbow past the ribs" }),
            ex("Glute Bridge", 3, 17, 45, { notes: "+2 reps vs week 2 · one-second squeeze at the top" }),
            exSec("In-and-Out Squat", 3, 40, 30, "Finisher · rest −10s vs week 2 · land soft, steady rhythm"),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    // ── Week 4 · Deload ────────────────────────────────────────────────────
    {
      title: "Deload",
      days: [
        {
          title: "Strength A",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 2, 10, 105, { notes: "Deload · RPE 5 · ~40% less volume · crisp technique · rest +30s" }),
            ex("Dumbbell Romanian Deadlift", 2, 10, 105, { notes: "Deload · RPE 5 · ~40% less volume · hinge, don't squat" }),
            ex("Dumbbell Bench Press", 2, 10, 105, { notes: "Deload · RPE 5 · ~40% less volume · smooth reps" }),
            ex("Reverse Lunge", 2, 10, 90, { notes: "Each side · Deload · RPE 5 · control over speed" }),
            ex("Single-Arm Dumbbell Row", 2, 10, 90, { notes: "Each side · Deload · RPE 5 · elbows past the ribs" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning",
          exercises: [
            ...wu("conditioning"),
            exSec("March in Place", 2, 60, 60, "Deload · easy pace · rest +30s · nose breathing"),
            exSec("Lateral Step Touch", 2, 60, 60, "Deload · easy pace · knees soft"),
            exSec("High Knees", 2, 30, 60, "Deload · 2 rounds only · moderate, not hard · rest +30s"),
            exSec("Skater", 2, 30, 60, "Deload · step, don't jump · easy rhythm"),
            exSec("Mountain Climber", 2, 30, 60, "Deload · slow and controlled · hips level"),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Strength B",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 2, 12, 105, { notes: "Deload · RPE 5 · ~40% less volume · crisp technique" }),
            ex("Dumbbell Hip Thrust", 2, 12, 105, { notes: "Deload · RPE 5 · ~40% less volume · squeeze, don't grind" }),
            ex("Dumbbell Shoulder Press", 2, 12, 90, { notes: "Deload · RPE 5 · rest +30s · no arching" }),
            ex("Dumbbell Bent-Over Row", 2, 10, 105, { notes: "Deload · RPE 5 · flat back" }),
            ex("Walking Lunge", 2, 10, 90, { notes: "Each side · Deload · RPE 5 · easy pace, tall torso" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Core + Mobility",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 2, 10, 75, { notes: "Deload · RPE 5 · ~40% less volume · lower back pressed down" }),
            ex("Plank", 2, 40, 75, { seconds: true, notes: "Deload · RPE 5 · hold week 1 time · breathe steadily" }),
            ex("Band Pallof Press", 2, 12, 75, { notes: "Each side · Deload · RPE 5 · easy tension" }),
            ex("Side Plank", 2, 30, 75, { seconds: true, notes: "Each side · Deload · RPE 5 · hips high" }),
            ex("Bird Dog", 2, 10, 75, { notes: "Each side · Deload · RPE 5 · slow, controlled reach" }),
            ...cd("core"),
          ],
        },
        {
          title: "Full Body + Finisher",
          exercises: [
            ...wu("conditioning"),
            ex("Push-Up", 2, 12, 90, { notes: "Deload · RPE 5 · ~40% less volume · easy tempo" }),
            ex("Goblet Squat", 2, 12, 90, { notes: "Deload · RPE 5 · light load · crisp technique" }),
            ex("Single-Arm Dumbbell Row", 2, 10, 90, { notes: "Each side · Deload · RPE 5 · smooth reps" }),
            ex("Glute Bridge", 2, 15, 75, { notes: "Deload · RPE 5 · squeeze, don't chase the burn" }),
            exSec("In-and-Out Squat", 2, 40, 60, "Deload · easy rhythm · rest +30s · land soft"),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    // ── Week 5 · Intensify ─────────────────────────────────────────────────
    {
      title: "Intensify",
      days: [
        {
          title: "Strength A",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 4, 10, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Romanian Deadlift", 4, 10, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 45, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning",
          exercises: [
            ...wu("conditioning"),
            exSec("March in Place", 2, 60, 20, "Steady block · rest back to week 3 · moderate pace"),
            exSec("Lateral Step Touch", 2, 60, 20, "Steady block · rest back to week 3 · step wide"),
            exSec("High Knees", 4, 30, 20, "Interval · 30s hard / 20s easy · honest effort on the work side"),
            exSec("Skater", 4, 30, 20, "Interval · sit the hip back · step to scale"),
            exSec("Mountain Climber", 3, 30, 20, "Interval · hips level · fast knees, quiet feet"),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Strength B",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 4, 12, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Bent-Over Row", 3, 10, 60, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Walking Lunge", 3, 10, 45, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Core + Mobility",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 3, 12, 45, { notes: "RPE 6–7 · add 2–10% (band tension) when you beat the target" }),
            ex("Plank", 3, 45, 45, { seconds: true, notes: "RPE 6–7 · hold week 3 time · breathe steadily" }),
            ex("Band Pallof Press", 3, 12, 30, { notes: "Each side · heavier band when you beat the target by 1–2 reps" }),
            ex("Side Plank", 3, 35, 45, { seconds: true, notes: "Each side · hold week 3 time · hips high" }),
            ex("Bird Dog", 3, 12, 30, { notes: "Each side · three-second pause · hips stay level" }),
            ...cd("core"),
          ],
        },
        {
          title: "Full Body + Finisher",
          exercises: [
            ...wu("conditioning"),
            ex("Push-Up", 3, 14, 60, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Goblet Squat", 3, 12, 45, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 45, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Glute Bridge", 3, 17, 45, { notes: "Add 2–10% (band above the knees) when you beat the target" }),
            exSec("In-and-Out Squat", 3, 40, 30, "Finisher · rest back to week 3 · land soft, steady rhythm"),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    // ── Week 6 · Peak ──────────────────────────────────────────────────────
    {
      title: "Peak",
      days: [
        {
          title: "Strength A",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 1, 6, 90, { notes: "Top set · RPE 8–9 · heavier than week 5 · own the rep first" }),
            ex("Goblet Squat", 3, 10, 75, { notes: "Back-off · RPE 7 · drop ~10% and retest week 5's 10 reps" }),
            ex("Dumbbell Romanian Deadlift", 4, 10, 75, { notes: "Peak · top set on set 1, then back-off ~10% · flat back" }),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Peak · top set on set 1, then back-off · shoulder blades pinned" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · peak · retest week 5's reps" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 45, { notes: "Each side · peak · elbow past the ribs" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning",
          exercises: [
            ...wu("conditioning"),
            exSec("March in Place", 2, 60, 20, "Steady block · hold week 5 pace"),
            exSec("Lateral Step Touch", 2, 60, 20, "Steady block · step wide, knees soft"),
            exSec("High Knees", 4, 30, 20, "Interval · peak week · honest 30s hard / 20s easy"),
            exSec("Skater", 4, 30, 20, "Interval · peak week · step to scale · land soft"),
            exSec("Mountain Climber", 3, 30, 20, "Interval · peak week · hips level, fast knees"),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Strength B",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 1, 8, 90, { notes: "Top set · RPE 8–9 · heavier than week 5 · knees track over the toes" }),
            ex("Sumo Squat", 3, 12, 75, { notes: "Back-off · RPE 7 · drop ~10% and retest week 5's 12 reps" }),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "Peak · top set on set 1, then back-off · squeeze at the top" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "Peak · top set on set 1, then back-off · no arching" }),
            ex("Dumbbell Bent-Over Row", 3, 10, 60, { notes: "Peak · top set on set 1, then back-off · flat back" }),
            ex("Walking Lunge", 3, 10, 45, { notes: "Each side · peak · retest week 5's reps · tall torso" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Core + Mobility",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 3, 12, 45, { notes: "Peak · hold week 5 reps · lower back pressed down" }),
            ex("Plank", 3, 50, 45, { seconds: true, notes: "Peak · beat week 5 by 5s · breathe steadily, hips level" }),
            ex("Band Pallof Press", 3, 12, 30, { notes: "Each side · peak band · three-second pause" }),
            ex("Side Plank", 3, 40, 45, { seconds: true, notes: "Each side · beat week 5 by 5s · hips high" }),
            ex("Bird Dog", 3, 12, 30, { notes: "Each side · three-second pause · control over speed" }),
            ...cd("core"),
          ],
        },
        {
          title: "Full Body + Finisher",
          exercises: [
            ...wu("conditioning"),
            ex("Push-Up", 1, 8, 60, { notes: "Top set · RPE 8–9 · body in one line · own every rep" }),
            ex("Push-Up", 3, 14, 45, { notes: "Back-off · RPE 7 · retest week 5's 14 reps" }),
            ex("Goblet Squat", 3, 12, 45, { notes: "Peak · top set on set 1, then back-off ~10% · knees track over the toes" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 45, { notes: "Each side · peak · elbow past the ribs" }),
            ex("Glute Bridge", 3, 17, 45, { notes: "Peak · hold week 5 reps · one-second squeeze" }),
            exSec("In-and-Out Squat", 3, 40, 30, "Finisher · peak week · land soft, steady rhythm"),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    // ── Week 7 · Overreach ─────────────────────────────────────────────────
    {
      title: "Overreach",
      days: [
        {
          title: "Strength A",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 5, 10, 75, { notes: "+1 set vs week 5 · RPE 8 · highest week of the block — earn the consolidation" }),
            ex("Dumbbell Romanian Deadlift", 4, 10, 75, { notes: "Hold week 5 volume · RPE 8 · hinge, don't squat" }),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Hold week 5 volume · RPE 8 · shoulder blades pinned" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · hold week 5 reps · RPE 8" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 45, { notes: "Each side · hold week 5 reps · elbows past the ribs" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning",
          exercises: [
            ...wu("conditioning"),
            exSec("March in Place", 2, 60, 20, "Steady block · hold week 5 pace · honest moderate effort"),
            exSec("Lateral Step Touch", 2, 60, 20, "Steady block · step wide, knees soft"),
            exSec("High Knees", 5, 30, 20, "+1 round vs week 5 · 30s hard / 20s easy · RPE 8"),
            exSec("Skater", 5, 30, 20, "+1 round vs week 5 · sit the hip back · land soft"),
            exSec("Mountain Climber", 4, 30, 20, "+1 round vs week 5 · hips level, fast knees"),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Strength B",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 5, 12, 75, { notes: "+1 set vs week 5 · RPE 8 · knees track over the toes" }),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "Hold week 5 volume · RPE 8 · drive through the heels" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "Hold week 5 volume · RPE 8 · no arching" }),
            ex("Dumbbell Bent-Over Row", 3, 10, 60, { notes: "Hold week 5 volume · flat back" }),
            ex("Walking Lunge", 3, 10, 45, { notes: "Each side · hold week 5 reps · tall torso" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Core + Mobility",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 4, 12, 45, { notes: "+1 set vs week 5 · RPE 7 · lower back pressed down" }),
            ex("Plank", 3, 50, 45, { seconds: true, notes: "Hold week 5 time · breathe steadily · hips level" }),
            ex("Band Pallof Press", 3, 12, 30, { notes: "Each side · hold week 5 band · resist the twist" }),
            ex("Side Plank", 3, 40, 45, { seconds: true, notes: "Each side · hold week 5 time · hips high" }),
            ex("Bird Dog", 3, 12, 30, { notes: "Each side · three-second pause · hips stay level" }),
            ...cd("core"),
          ],
        },
        {
          title: "Full Body + Finisher",
          exercises: [
            ...wu("conditioning"),
            ex("Push-Up", 4, 14, 60, { notes: "+1 set vs week 5 · RPE 8 · body in one line" }),
            ex("Goblet Squat", 3, 12, 45, { notes: "Hold week 5 volume · RPE 8 · knees track over the toes" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 45, { notes: "Each side · hold week 5 reps · elbow past the ribs" }),
            ex("Glute Bridge", 3, 17, 45, { notes: "Hold week 5 reps · one-second squeeze" }),
            exSec("In-and-Out Squat", 3, 40, 25, "Finisher · rest −5s vs week 5 · land soft"),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    // ── Week 8 · Consolidate ───────────────────────────────────────────────
    {
      title: "Consolidate",
      days: [
        {
          title: "Strength A",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 3, 10, 75, { notes: "Consolidate · RPE 6–7 · retest week 5's loads for more reps" }),
            ex("Dumbbell Romanian Deadlift", 3, 10, 75, { notes: "Consolidate · RPE 6–7 · retest week 5's loads for more reps" }),
            ex("Dumbbell Bench Press", 3, 10, 75, { notes: "Consolidate · RPE 6–7 · smooth, controlled reps" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · retest week 5's reps · finish fresh" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · retest week 5's reps · elbow past the ribs" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning",
          exercises: [
            ...wu("conditioning"),
            exSec("March in Place", 2, 60, 30, "Steady block · week 1 pace · reflect on how far the last eight weeks took you"),
            exSec("Lateral Step Touch", 2, 60, 30, "Steady block · easy rhythm · knees soft"),
            exSec("High Knees", 4, 30, 30, "Retest · week 1's intervals at week 5 effort — they should feel easier"),
            exSec("Skater", 4, 30, 30, "Retest · step or jump · land soft · compare week 1"),
            exSec("Mountain Climber", 3, 30, 30, "Retest · hips level · quiet feet · compare week 1"),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Strength B",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 3, 12, 75, { notes: "Consolidate · RPE 6–7 · retest week 5's loads for more reps" }),
            ex("Dumbbell Hip Thrust", 3, 12, 75, { notes: "Consolidate · RPE 6–7 · one-second squeeze at the top" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "Consolidate · RPE 6–7 · no arching" }),
            ex("Dumbbell Bent-Over Row", 3, 10, 75, { notes: "Consolidate · RPE 6–7 · flat back · elbows past the ribs" }),
            ex("Walking Lunge", 3, 10, 60, { notes: "Each side · retest week 5's reps · tall torso" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Core + Mobility",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 3, 10, 45, { notes: "Consolidate · RPE 6 · retest week 1's reps with better control" }),
            ex("Plank", 3, 45, 45, { seconds: true, notes: "Consolidate · retest week 1's 40s — hold longer, breathing calm" }),
            ex("Band Pallof Press", 3, 12, 45, { notes: "Each side · easy band · three-second pause" }),
            ex("Side Plank", 3, 35, 45, { seconds: true, notes: "Each side · retest week 1's 30s · hips high" }),
            ex("Bird Dog", 3, 10, 45, { notes: "Each side · three-second pause · control over speed" }),
            ...cd("core"),
          ],
        },
        {
          title: "Full Body + Finisher",
          exercises: [
            ...wu("conditioning"),
            ex("Push-Up", 3, 12, 60, { notes: "Consolidate · RPE 6–7 · retest week 1's 12 reps — they should feel lighter" }),
            ex("Goblet Squat", 3, 12, 60, { notes: "Consolidate · RPE 6–7 · retest week 5's load for more reps" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · retest week 5's load · elbow past the ribs" }),
            ex("Glute Bridge", 3, 15, 45, { notes: "Consolidate · retest week 1's 15 reps · one-second squeeze" }),
            exSec("In-and-Out Squat", 3, 40, 45, "Final finisher · easy rhythm · land soft · then set your next goal"),
            ...cd("conditioning"),
          ],
        },
      ],
    },
  ],
};

export default BP10;
