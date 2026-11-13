import type { ProgramV2 } from "./types";
import { cd, ex, wu } from "./warmup";

/**
 * BP-02 · 8-Week Glute Growth Blueprint (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 8 weeks × 5 days · lower-body hypertrophy with upper-body maintenance.
 * Five session roles: barbell strength (3–5 reps), hypertrophy volume (8–12),
 * upper + core maintenance (8–12), posterior chain (6–10), glute peak
 * (12–20 reps plus a loaded-carry lunge). Planned deload in week 4 and
 * consolidation in week 8 (R11/R12); one variable advances per week (§2.2).
 * Every session: `wu(kind)` + 5 main rows + `cd(kind)`.
 */

export const BP02: ProgramV2 = {
  slug: "8-week-glute-growth-blueprint",
  title: "8-Week Glute Growth Blueprint",
  weeks: [
    // ── Week 1 · Foundation ────────────────────────────────────────────────
    {
      title: "Foundation",
      days: [
        {
          title: "Barbell Strength",
          exercises: [
            ...wu("lower"),
            ex("Barbell Back Squat", 3, 5, 150, { notes: "RPE 6–7 · 3–5 rep range · brace, sit down and back · or Goblet Squat if you have no rack" }),
            ex("Barbell Romanian Deadlift", 3, 6, 120, { notes: "RPE 6–7 · hinge, don't squat · stop at the first hamstring stretch · or Dumbbell RDL" }),
            ex("Barbell Hip Thrust", 3, 8, 90, { notes: "RPE 6–7 · upper back on the bench, chin tucked · drive through the heels · or dumbbell across the hips" }),
            ex("Reverse Lunge", 3, 10, 75, { notes: "Each side · RPE 6–7 · front knee tracks over the toes · torso upright" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 6–7 · full range · one-second pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Hypertrophy",
          exercises: [
            ...wu("glutes"),
            ex("Goblet Squat", 3, 10, 75, { notes: "RPE 6–7 · elbows inside the knees · whole foot planted" }),
            ex("Dumbbell Hip Thrust", 3, 12, 75, { notes: "RPE 6–7 · ribs down · one-second squeeze at the top" }),
            ex("Bulgarian Split Squat", 3, 10, 75, { notes: "Each side · RPE 6–7 · never take a split squat to failure when you train alone" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side · RPE 6–7 · sit the hip back, trailing leg straight" }),
            ex("Leg Extension", 3, 15, 45, { notes: "Machine · or band at home · RPE 6–7 · pause at full lockout" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · maintenance, not a growth day · shoulder blades pinned" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6 · brace on your thigh or a bench" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "RPE 6 · no arching the lower back · weights finish over the shoulders" }),
            ex("Hammer Curl", 2, 12, 45, { notes: "RPE 6 · elbows pinned to the sides · neutral grip" }),
            ex("Dead Bug", 3, 10, 45, { notes: "RPE 6 · lower back pressed down · opposite arm and leg" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior Chain",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 3, 8, 90, { notes: "RPE 6–7 · tempo 3-1-1 · or barbell if you have one" }),
            ex("Step-Up", 3, 12, 75, { notes: "Each side · RPE 6–7 · drive through the top foot, don't push off" }),
            ex("Lying Leg Curl", 3, 12, 45, { notes: "Machine · at home curl a dumbbell between your feet · RPE 6–7" }),
            ex("Single-Leg Glute Bridge", 3, 10, 45, { notes: "Each side · RPE 6–7 · hips level at the top" }),
            ex("Glute Bridge March", 3, 12, 45, { notes: "RPE 6–7 · hips level · small steps only" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Peak",
          exercises: [
            ...wu("glutes"),
            ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg · RPE 6–7 · dumbbells at your sides, stay tall — this is your carry" }),
            ex("Sumo Squat", 3, 15, 60, { notes: "RPE 6–7 · wide stance, toes turned out · knees track over the toes" }),
            ex("Glute Bridge", 3, 15, 45, { notes: "RPE 6–7 · drive through the heels · one-second squeeze at the top" }),
            ex("Frog Pump", 3, 20, 30, { notes: "RPE 6–7 · soles together · small pulses, glutes only" }),
            ex("Wall Sit", 3, 45, 45, { seconds: true, notes: "RPE 6–7 · thighs parallel · breathe steadily" }),
            ...cd("glutes"),
          ],
        },
      ],
    },

    // ── Week 2 · Build ─────────────────────────────────────────────────────
    {
      title: "Build",
      days: [
        {
          title: "Barbell Strength",
          exercises: [
            ...wu("lower"),
            ex("Barbell Back Squat", 4, 5, 150, { notes: "+1 set vs week 1 · RPE 7 · own every rep before you add load" }),
            ex("Barbell Romanian Deadlift", 3, 6, 120, { notes: "Hold week 1 reps · RPE 7 · hinge, don't squat" }),
            ex("Barbell Hip Thrust", 3, 8, 90, { notes: "Hold week 1 reps · RPE 7 · chin tucked, ribs down" }),
            ex("Reverse Lunge", 3, 10, 75, { notes: "Each side · hold week 1 reps · front knee tracks over the toes" }),
            ex("Calf Raise", 3, 15, 45, { notes: "Hold week 1 reps · full range · pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Hypertrophy",
          exercises: [
            ...wu("glutes"),
            ex("Goblet Squat", 3, 10, 75, { notes: "Hold week 1 reps · RPE 7 · whole foot planted" }),
            ex("Dumbbell Hip Thrust", 3, 12, 75, { notes: "Hold week 1 reps · RPE 7 · one-second squeeze at the top" }),
            ex("Bulgarian Split Squat", 3, 10, 75, { notes: "Each side · hold week 1 reps · RPE 7" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side · hold week 1 reps · sit the hip back" }),
            ex("Leg Extension", 3, 15, 45, { notes: "Machine · hold week 1 reps · pause at full lockout" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Hold week 1 load — this day never progresses · RPE 6" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · hold week 1 load · brace on your thigh" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "Hold week 1 load · RPE 6 · no arching the lower back" }),
            ex("Hammer Curl", 2, 12, 45, { notes: "Hold week 1 reps · elbows pinned to the sides" }),
            ex("Dead Bug", 3, 10, 45, { notes: "Hold week 1 reps · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior Chain",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 8, 90, { notes: "+1 set vs week 1 · RPE 7 · tempo 3-1-1 · stop at the first hamstring stretch" }),
            ex("Step-Up", 3, 12, 75, { notes: "Each side · hold week 1 reps · RPE 7 · full hip extension" }),
            ex("Lying Leg Curl", 3, 12, 45, { notes: "Hold week 1 reps · squeeze at the top" }),
            ex("Single-Leg Glute Bridge", 3, 10, 45, { notes: "Each side · hold week 1 reps · hips level" }),
            ex("Glute Bridge March", 3, 12, 45, { notes: "Hold week 1 reps · no hip drop" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Peak",
          exercises: [
            ...wu("glutes"),
            ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg · hold week 1 reps · loaded carry, stay tall" }),
            ex("Sumo Squat", 3, 15, 60, { notes: "Hold week 1 reps · RPE 7 · knees track over the toes" }),
            ex("Glute Bridge", 3, 15, 45, { notes: "Hold week 1 reps · one-second squeeze at the top" }),
            ex("Frog Pump", 3, 20, 30, { notes: "Hold week 1 reps · small pulses, glutes only" }),
            ex("Wall Sit", 3, 45, 45, { seconds: true, notes: "Hold week 1 time · breathe steadily" }),
            ...cd("glutes"),
          ],
        },
      ],
    },

    // ── Week 3 · Volume ────────────────────────────────────────────────────
    {
      title: "Volume",
      days: [
        {
          title: "Barbell Strength",
          exercises: [
            ...wu("lower"),
            ex("Barbell Back Squat", 4, 5, 150, { notes: "Hold week 2 volume · RPE 7 · brace before every rep" }),
            ex("Barbell Romanian Deadlift", 3, 6, 120, { notes: "Hold week 2 reps · RPE 7 · stop at the first hamstring stretch" }),
            ex("Barbell Hip Thrust", 3, 8, 75, { notes: "Rest −15s vs week 2 · RPE 7 · drive through the heels" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · rest −15s vs week 2 · torso upright" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Rest −15s vs week 2 · pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Hypertrophy",
          exercises: [
            ...wu("glutes"),
            ex("Goblet Squat", 4, 10, 75, { notes: "+1 set vs week 2 · RPE 7 · elbows inside the knees" }),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "+1 set vs week 2 · RPE 7 · ribs down, squeeze at the top" }),
            ex("Bulgarian Split Squat", 3, 10, 60, { notes: "Each side · rest −15s vs week 2 · RPE 7" }),
            ex("Lateral Lunge", 3, 10, 45, { notes: "Each side · rest −15s vs week 2 · sit the hip back" }),
            ex("Leg Extension", 3, 15, 30, { notes: "Rest −15s vs week 2 · pause at full lockout" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Hold week 1 load — this day never progresses · RPE 6" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · hold week 1 load · brace on your thigh" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "Rest −15s vs week 2 · RPE 6 · no arching" }),
            ex("Hammer Curl", 2, 12, 30, { notes: "Rest −15s vs week 2 · elbows pinned" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Rest −15s vs week 2 · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior Chain",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 8, 90, { notes: "Hold week 2 volume · RPE 7–8 · tempo 3-1-1" }),
            ex("Step-Up", 3, 12, 60, { notes: "Each side · rest −15s vs week 2 · drive through the top foot" }),
            ex("Lying Leg Curl", 3, 12, 30, { notes: "Rest −15s vs week 2 · squeeze at the top" }),
            ex("Single-Leg Glute Bridge", 3, 10, 30, { notes: "Each side · rest −15s vs week 2 · hips level" }),
            ex("Glute Bridge March", 3, 12, 30, { notes: "Rest −15s vs week 2 · no hip drop" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Peak",
          exercises: [
            ...wu("glutes"),
            ex("Walking Lunge", 4, 12, 60, { notes: "+1 set vs week 2 · loaded carry, stay tall" }),
            ex("Sumo Squat", 4, 15, 60, { notes: "+1 set vs week 2 · RPE 7 · knees track over the toes" }),
            ex("Glute Bridge", 3, 15, 30, { notes: "Rest −15s vs week 2 · one-second squeeze" }),
            ex("Frog Pump", 3, 20, 20, { notes: "Rest −10s vs week 2 · burnout pace" }),
            ex("Wall Sit", 3, 45, 30, { seconds: true, notes: "Rest −15s vs week 2 · thighs parallel" }),
            ...cd("glutes"),
          ],
        },
      ],
    },

    // ── Week 4 · Deload ────────────────────────────────────────────────────
    {
      title: "Deload",
      days: [
        {
          title: "Barbell Strength",
          exercises: [
            ...wu("lower"),
            ex("Barbell Back Squat", 2, 5, 180, { notes: "Deload · RPE 5 · ~40% less volume · smooth reps, no grind · rest +30s" }),
            ex("Barbell Romanian Deadlift", 2, 6, 150, { notes: "Deload · RPE 5 · ~40% less volume · crisp hinge" }),
            ex("Barbell Hip Thrust", 2, 8, 120, { notes: "Deload · RPE 5 · ~40% less volume · rest +30s" }),
            ex("Reverse Lunge", 2, 10, 105, { notes: "Each side · Deload · RPE 5 · ~40% less volume" }),
            ex("Calf Raise", 2, 15, 75, { notes: "Deload · RPE 5 · full range, easy" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Hypertrophy",
          exercises: [
            ...wu("glutes"),
            ex("Goblet Squat", 2, 10, 105, { notes: "Deload · RPE 5 · ~40% less volume · crisp technique" }),
            ex("Dumbbell Hip Thrust", 2, 12, 105, { notes: "Deload · RPE 5 · ~40% less volume · rest +30s" }),
            ex("Bulgarian Split Squat", 2, 10, 105, { notes: "Each side · Deload · RPE 5 · ~40% less volume" }),
            ex("Lateral Lunge", 2, 10, 75, { notes: "Each side · Deload · RPE 5 · sit the hip back" }),
            ex("Leg Extension", 2, 15, 75, { notes: "Deload · RPE 5 · easy sets, no burnout" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 2, 10, 90, { notes: "Deload · RPE 5 · ~40% less volume · maintenance day stays light" }),
            ex("Single-Arm Dumbbell Row", 2, 10, 90, { notes: "Each side · Deload · RPE 5 · smooth reps" }),
            ex("Dumbbell Shoulder Press", 2, 12, 90, { notes: "Deload · RPE 5 · rest +30s · no arching" }),
            ex("Hammer Curl", 2, 12, 75, { notes: "Deload · RPE 5 · elbows pinned" }),
            ex("Dead Bug", 2, 10, 75, { notes: "Deload · RPE 5 · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior Chain",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 2, 8, 120, { notes: "Deload · RPE 5 · ~40% less volume · hinge, don't squat" }),
            ex("Step-Up", 2, 12, 105, { notes: "Each side · Deload · RPE 5 · control, no push-off" }),
            ex("Lying Leg Curl", 2, 12, 75, { notes: "Deload · RPE 5 · easy sets" }),
            ex("Single-Leg Glute Bridge", 2, 10, 75, { notes: "Each side · Deload · RPE 5 · hips level" }),
            ex("Glute Bridge March", 2, 12, 75, { notes: "Deload · RPE 5 · no hip drop" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Peak",
          exercises: [
            ...wu("glutes"),
            ex("Walking Lunge", 2, 12, 90, { notes: "Deload · RPE 5 · ~40% less volume · carry tall, easy pace" }),
            ex("Sumo Squat", 2, 15, 90, { notes: "Deload · RPE 5 · ~40% less volume · crisp technique" }),
            ex("Glute Bridge", 2, 15, 75, { notes: "Deload · RPE 5 · squeeze, don't chase the burn" }),
            ex("Frog Pump", 2, 20, 60, { notes: "Deload · RPE 5 · small pulses, easy" }),
            ex("Wall Sit", 2, 45, 75, { seconds: true, notes: "Deload · RPE 5 · breathe steadily" }),
            ...cd("glutes"),
          ],
        },
      ],
    },

    // ── Week 5 · Intensify ─────────────────────────────────────────────────
    {
      title: "Intensify",
      days: [
        {
          title: "Barbell Strength",
          exercises: [
            ...wu("lower"),
            ex("Barbell Back Squat", 4, 5, 150, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Barbell Romanian Deadlift", 3, 6, 120, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Barbell Hip Thrust", 3, 8, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Hypertrophy",
          exercises: [
            ...wu("glutes"),
            ex("Goblet Squat", 4, 10, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Bulgarian Split Squat", 3, 10, 60, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lateral Lunge", 3, 10, 45, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Leg Extension", 3, 15, 30, { notes: "Add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · this day never progresses · maintenance only" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6 · hold week 1 load" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "RPE 6 · no arching the lower back" }),
            ex("Hammer Curl", 2, 12, 30, { notes: "RPE 6 · elbows pinned to the sides" }),
            ex("Dead Bug", 3, 10, 30, { notes: "RPE 6 · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior Chain",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 8, 90, { notes: "RPE 7–8 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Step-Up", 3, 12, 60, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lying Leg Curl", 3, 12, 30, { notes: "Add 2–10% when you beat the target by 1–2 reps" }),
            ex("Single-Leg Glute Bridge", 3, 10, 30, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Glute Bridge March", 3, 12, 30, { notes: "Add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Peak",
          exercises: [
            ...wu("glutes"),
            ex("Walking Lunge", 4, 12, 60, { notes: "Loaded carry, stay tall · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Sumo Squat", 4, 15, 60, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Glute Bridge", 3, 15, 30, { notes: "Add 2–10% when you beat the target by 1–2 reps" }),
            ex("Frog Pump", 3, 20, 20, { notes: "Burnout · small pulses, glutes only" }),
            ex("Wall Sit", 3, 45, 30, { seconds: true, notes: "Breathe steadily · thighs parallel" }),
            ...cd("glutes"),
          ],
        },
      ],
    },

    // ── Week 6 · Peak ──────────────────────────────────────────────────────
    {
      title: "Peak",
      days: [
        {
          title: "Barbell Strength",
          exercises: [
            ...wu("lower"),
            ex("Barbell Back Squat", 1, 3, 180, { notes: "Top set · RPE 8–9 · heavier than week 5 · own the rep first" }),
            ex("Barbell Back Squat", 3, 5, 150, { notes: "Back-off · RPE 7 · drop ~10% and retest week 5's reps" }),
            ex("Barbell Romanian Deadlift", 3, 6, 120, { notes: "Peak · top set on set 1, then back-off ~10% · RPE 7–8" }),
            ex("Barbell Hip Thrust", 3, 8, 75, { notes: "Peak · top set on set 1, then back-off ~10% · chin tucked" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · peak · retest week 5's reps" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Peak · hold week 5 load · pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Hypertrophy",
          exercises: [
            ...wu("glutes"),
            ex("Goblet Squat", 4, 10, 75, { notes: "Peak · top set on set 1, then back-off ~10% · RPE 8 on the top set only" }),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "Peak · top set then back-off · ribs down, squeeze at the top" }),
            ex("Bulgarian Split Squat", 3, 10, 60, { notes: "Each side · peak · retest week 5's reps" }),
            ex("Lateral Lunge", 3, 10, 45, { notes: "Each side · peak · sit the hip back" }),
            ex("Leg Extension", 3, 15, 30, { notes: "Peak · hold week 5 load · pause at full lockout" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · maintenance day, unaffected by the peak" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6 · hold week 1 load" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "RPE 6 · no arching the lower back" }),
            ex("Hammer Curl", 2, 12, 30, { notes: "RPE 6 · elbows pinned" }),
            ex("Dead Bug", 3, 10, 30, { notes: "RPE 6 · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior Chain",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 1, 5, 120, { notes: "Top set · RPE 8–9 · heavier than week 5 · flat back throughout" }),
            ex("Dumbbell Romanian Deadlift", 3, 8, 90, { notes: "Back-off · RPE 7 · drop ~10% and retest week 5's 8 reps" }),
            ex("Step-Up", 3, 12, 60, { notes: "Each side · peak · retest week 5's reps" }),
            ex("Lying Leg Curl", 3, 12, 30, { notes: "Peak · top set on set 1, then back-off · squeeze at the top" }),
            ex("Single-Leg Glute Bridge", 3, 10, 30, { notes: "Each side · peak · hips level at the top" }),
            ex("Glute Bridge March", 3, 12, 30, { notes: "Peak · hold week 5 reps · no hip drop" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Peak",
          exercises: [
            ...wu("glutes"),
            ex("Walking Lunge", 4, 12, 60, { notes: "Loaded carry, stay tall · peak · retest week 5's 12 each leg" }),
            ex("Sumo Squat", 4, 15, 60, { notes: "Peak · top set on set 1, then back-off · RPE 8 on the top set only" }),
            ex("Glute Bridge", 3, 15, 30, { notes: "Peak · hold week 5 load · one-second squeeze" }),
            ex("Frog Pump", 3, 20, 20, { notes: "Peak · burnout · small pulses" }),
            ex("Wall Sit", 3, 45, 30, { seconds: true, notes: "Peak · retest week 5's time" }),
            ...cd("glutes"),
          ],
        },
      ],
    },

    // ── Week 7 · Overreach ─────────────────────────────────────────────────
    {
      title: "Overreach",
      days: [
        {
          title: "Barbell Strength",
          exercises: [
            ...wu("lower"),
            ex("Barbell Back Squat", 5, 5, 150, { notes: "+1 set vs week 5 · RPE 8 · highest week of the block — earn the deload next week" }),
            ex("Barbell Romanian Deadlift", 4, 6, 120, { notes: "+1 set vs week 5 · RPE 8 · hinge, don't squat" }),
            ex("Barbell Hip Thrust", 3, 8, 75, { notes: "Hold week 5 volume · RPE 8 · chin tucked" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · hold week 5 reps · RPE 8" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Hold week 5 volume · pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Hypertrophy",
          exercises: [
            ...wu("glutes"),
            ex("Goblet Squat", 5, 10, 75, { notes: "+1 set vs week 5 · RPE 8 · own every rep" }),
            ex("Dumbbell Hip Thrust", 5, 12, 75, { notes: "+1 set vs week 5 · RPE 8 · ribs down, squeeze at the top" }),
            ex("Bulgarian Split Squat", 3, 10, 60, { notes: "Each side · hold week 5 reps · RPE 8" }),
            ex("Lateral Lunge", 3, 10, 45, { notes: "Each side · hold week 5 reps" }),
            ex("Leg Extension", 3, 15, 30, { notes: "Hold week 5 reps · pause at full lockout" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 4, 10, 60, { notes: "+1 set · still light (RPE 7) · maintenance, not the point of this week" }),
            ex("Single-Arm Dumbbell Row", 4, 10, 60, { notes: "Each side · +1 set · RPE 7 · brace on your thigh" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "Hold week 5 volume · RPE 7" }),
            ex("Hammer Curl", 2, 12, 30, { notes: "Hold week 5 reps · elbows pinned" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Hold week 5 reps · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior Chain",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 5, 8, 90, { notes: "+1 set vs week 5 · RPE 8 · tempo 3-1-1" }),
            ex("Step-Up", 4, 12, 60, { notes: "Each side · +1 set vs week 5 · RPE 8" }),
            ex("Lying Leg Curl", 3, 12, 30, { notes: "Hold week 5 volume · RPE 8" }),
            ex("Single-Leg Glute Bridge", 3, 10, 30, { notes: "Each side · hold week 5 reps" }),
            ex("Glute Bridge March", 3, 12, 30, { notes: "Hold week 5 reps · hips level" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Peak",
          exercises: [
            ...wu("glutes"),
            ex("Walking Lunge", 5, 12, 60, { notes: "+1 set vs week 5 · loaded carry, stay tall · RPE 8" }),
            ex("Sumo Squat", 5, 15, 60, { notes: "+1 set vs week 5 · RPE 8 · knees track over the toes" }),
            ex("Glute Bridge", 3, 15, 30, { notes: "Hold week 5 volume · one-second squeeze" }),
            ex("Frog Pump", 3, 20, 20, { notes: "Hold week 5 reps · burnout pace" }),
            ex("Wall Sit", 3, 45, 30, { seconds: true, notes: "Hold week 5 time · breathe steadily" }),
            ...cd("glutes"),
          ],
        },
      ],
    },

    // ── Week 8 · Consolidate ───────────────────────────────────────────────
    {
      title: "Consolidate",
      days: [
        {
          title: "Barbell Strength",
          exercises: [
            ...wu("lower"),
            ex("Barbell Back Squat", 3, 5, 150, { notes: "Consolidate · RPE 6–7 · retest week 5's loads for more reps" }),
            ex("Barbell Romanian Deadlift", 3, 6, 120, { notes: "Consolidate · RPE 6–7 · retest week 5's loads for more reps" }),
            ex("Barbell Hip Thrust", 3, 8, 90, { notes: "Consolidate · RPE 6–7 · smooth, controlled reps" }),
            ex("Reverse Lunge", 3, 10, 75, { notes: "Each side · retest week 5's reps · finish fresh" }),
            ex("Calf Raise", 3, 15, 45, { notes: "Easy · full range · pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Hypertrophy",
          exercises: [
            ...wu("glutes"),
            ex("Goblet Squat", 3, 10, 75, { notes: "Consolidate · RPE 6–7 · retest week 5's loads for more reps" }),
            ex("Dumbbell Hip Thrust", 3, 12, 75, { notes: "Consolidate · RPE 6–7 · one-second squeeze at the top" }),
            ex("Bulgarian Split Squat", 3, 10, 75, { notes: "Each side · retest week 5's reps · never to failure" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side · retest week 5's reps" }),
            ex("Leg Extension", 3, 15, 45, { notes: "Easy sets · pause at full lockout" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · maintenance only" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6 · brace on your thigh" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "RPE 6 · no arching the lower back" }),
            ex("Hammer Curl", 2, 12, 45, { notes: "RPE 6 · elbows pinned" }),
            ex("Dead Bug", 3, 10, 45, { notes: "RPE 6 · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior Chain",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 3, 8, 90, { notes: "Consolidate · RPE 6–7 · retest week 5's loads for more reps" }),
            ex("Step-Up", 3, 12, 75, { notes: "Each side · retest week 5's reps · drive through the top foot" }),
            ex("Lying Leg Curl", 3, 12, 45, { notes: "Easy sets · squeeze at the top" }),
            ex("Single-Leg Glute Bridge", 3, 10, 45, { notes: "Each side · hips level at the top" }),
            ex("Glute Bridge March", 3, 12, 45, { notes: "Easy pace · no hip drop" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Peak",
          exercises: [
            ...wu("glutes"),
            ex("Walking Lunge", 3, 12, 60, { notes: "Loaded carry, stay tall · retest week 1's reps at week 5 load" }),
            ex("Sumo Squat", 3, 15, 60, { notes: "Consolidate · RPE 6–7 · retest week 5's load for more reps" }),
            ex("Glute Bridge", 3, 15, 45, { notes: "Controlled · three seconds up, one down" }),
            ex("Frog Pump", 2, 20, 30, { notes: "Easy set · finish fresh, not destroyed" }),
            ex("Wall Sit", 3, 45, 45, { seconds: true, notes: "Final session · retest week 1's time" }),
            ...cd("glutes"),
          ],
        },
      ],
    },
  ],
};

export default BP02;
