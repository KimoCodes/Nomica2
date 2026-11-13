import type { ProgramV2 } from "./types";
import { cd, ex, wu } from "./warmup";

/**
 * BP-O2 · 6-Week Glutes & Quads Builder (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 6 weeks × 5 days · balanced lower-body hypertrophy — quad and glute emphasis days alternate.
 * Skeleton per session: wu(kind) → 5–6 main rows → cd(kind). Week 4 is the deload.
 */

export const O2: ProgramV2 = {
  slug: "6-week-glutes-and-quads-builder",
  title: "6-Week Glutes & Quads Builder",
  weeks: [
    {
      title: "Foundation",
      days: [
        {
          title: "Quad Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Leg Press", 3, 10, 90, { notes: "RPE 6–7 · or Goblet Squat if no leg press · knees reach ~90°, never lock out" }),
            ex("Goblet Squat", 3, 12, 60, { notes: "RPE 6–7 · elbows inside the knees · whole foot planted" }),
            ex("Sumo Squat", 3, 12, 60, { notes: "RPE 6–7 · wide stance, toes turned out · squeeze the glutes at the top" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 6–7 · soft step back" }),
            ex("Leg Extension", 3, 15, 45, { notes: "Machine · or band at home · RPE 6–7 · pause at full lockout" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Hip Thrust", 3, 12, 75, { notes: "RPE 6–7 · upper back on the bench, ribs down · drive through the heels" }),
            ex("Banded Good Morning", 3, 12, 60, { notes: "Band across your upper back · RPE 6–7 · hinge, don't squat · flat back" }),
            ex("Curtsy Lunge", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 6–7 · hips stay facing forward" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 6–7 · sit the hip back" }),
            ex("Banded Kickback", 3, 12, 45, { notes: "Each side, start with your weaker side · RPE 6–7 · squeeze at full extension" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · maintenance, not a growth day" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 6 · brace on your thigh or a bench" }),
            ex("Dumbbell Shoulder Press", 2, 12, 60, { notes: "RPE 6 · wrists stacked over the elbows · no leg drive" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "RPE 6 · slight bend in the elbows · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "RPE 6 · elbows pinned to your sides" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side · RPE 6 · squeeze at full extension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior + Carry",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 3, 10, 90, { notes: "RPE 6–7 · tempo 3-1-1 · neutral spine, stop at the first hamstring stretch" }),
            ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg, start with your weaker side · RPE 6–7 · loaded carry, stay tall" }),
            ex("Lying Leg Curl", 3, 12, 45, { notes: "Machine · or band at home · RPE 6–7 · squeeze at the top" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 6–7 · full range · one-second pause at the top" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 6–7 · breathe steadily · hips level" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Quads + Glutes Metabolic",
          exercises: [
            ...wu("conditioning"),
            ex("Sumo Squat", 3, 15, 45, { notes: "High-rep circuit · RPE 6–7 · light load, continuous rhythm" }),
            ex("Reverse Lunge", 3, 12, 45, { notes: "Each side, start with your weaker side · RPE 6–7 · short rest, keep moving" }),
            ex("Glute Bridge", 3, 20, 30, { notes: "RPE 6–7 · dumbbell across the hips optional · no pausing at the floor" }),
            ex("Frog Pump", 3, 20, 30, { notes: "RPE 6–7 · soles together · small pulses" }),
            ex("Wall Sit", 3, 45, 30, { seconds: true, notes: "RPE 6–7 · thighs parallel · breathe steadily" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    {
      title: "Build",
      days: [
        {
          title: "Quad Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Leg Press", 4, 10, 90, { notes: "+1 set vs week 1 · RPE 7 · or Goblet Squat if no leg press · knees reach ~90°" }),
            ex("Goblet Squat", 3, 12, 60, { notes: "RPE 7 · elbows inside the knees · whole foot planted" }),
            ex("Sumo Squat", 3, 12, 60, { notes: "RPE 7 · wide stance, toes turned out · squeeze the glutes at the top" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 7 · soft step back" }),
            ex("Leg Extension", 3, 15, 45, { notes: "Machine · or band at home · RPE 7 · pause at full lockout" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "+1 set vs week 1 · RPE 7 · ribs down, drive through the heels" }),
            ex("Banded Good Morning", 3, 12, 60, { notes: "Band across your upper back · RPE 7 · hinge, don't squat · flat back" }),
            ex("Curtsy Lunge", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 7 · hips stay facing forward" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 7 · sit the hip back" }),
            ex("Banded Kickback", 3, 12, 45, { notes: "Each side, start with your weaker side · RPE 7 · squeeze at full extension" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · hold week 1 load — this day never progresses" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 6 · hold week 1 load · brace on your thigh" }),
            ex("Dumbbell Shoulder Press", 2, 12, 60, { notes: "RPE 6 · hold week 1 load · no leg drive" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "RPE 6 · hold week 1 load · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "RPE 6 · elbows pinned to your sides" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side · RPE 6 · squeeze at full extension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior + Carry",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 3, 10, 90, { notes: "RPE 7 · tempo 3-1-1 · neutral spine, stop at the first hamstring stretch" }),
            ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg, start with your weaker side · RPE 7 · loaded carry, stay tall" }),
            ex("Lying Leg Curl", 3, 12, 45, { notes: "Machine · or band at home · RPE 7 · squeeze at the top" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 7 · full range · one-second pause at the top" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 7 · breathe steadily · hips level" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Quads + Glutes Metabolic",
          exercises: [
            ...wu("conditioning"),
            ex("Sumo Squat", 3, 15, 45, { notes: "High-rep circuit · RPE 7 · light load, continuous rhythm" }),
            ex("Reverse Lunge", 3, 12, 45, { notes: "Each side, start with your weaker side · RPE 7 · short rest, keep moving" }),
            ex("Glute Bridge", 3, 20, 30, { notes: "RPE 7 · dumbbell across the hips optional · no pausing at the floor" }),
            ex("Frog Pump", 3, 20, 30, { notes: "RPE 7 · soles together · small pulses" }),
            ex("Wall Sit", 3, 45, 30, { seconds: true, notes: "RPE 7 · thighs parallel · breathe steadily" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    {
      title: "Volume",
      days: [
        {
          title: "Quad Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Leg Press", 4, 10, 90, { notes: "Hold 4 sets from week 2 · RPE 7–8 · or Goblet Squat if no leg press" }),
            ex("Goblet Squat", 3, 12, 45, { notes: "Rest −15s vs week 2 · RPE 7–8 · elbows inside the knees" }),
            ex("Sumo Squat", 3, 12, 45, { notes: "Rest −15s vs week 2 · RPE 7–8 · wide stance, toes out" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side, start with your weaker side · rest −15s vs week 2 · RPE 7–8" }),
            ex("Leg Extension", 3, 15, 30, { notes: "Machine · or band at home · rest −15s vs week 2 · RPE 7–8" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "Hold 4 sets from week 2 · RPE 7–8 · ribs down, drive through the heels" }),
            ex("Banded Good Morning", 3, 12, 45, { notes: "Rest −15s vs week 2 · RPE 7–8 · hinge, don't squat" }),
            ex("Curtsy Lunge", 3, 10, 45, { notes: "Each side, start with your weaker side · rest −15s vs week 2 · RPE 7–8" }),
            ex("Lateral Lunge", 3, 10, 45, { notes: "Each side, start with your weaker side · rest −15s vs week 2 · RPE 7–8" }),
            ex("Banded Kickback", 3, 12, 30, { notes: "Each side, start with your weaker side · rest −15s vs week 2 · RPE 7–8" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · hold week 1 load — this day never progresses" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 6 · hold week 1 load · brace on your thigh" }),
            ex("Dumbbell Shoulder Press", 2, 12, 60, { notes: "RPE 6 · hold week 1 load · no leg drive" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "RPE 6 · hold week 1 load · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "RPE 6 · elbows pinned to your sides" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side · RPE 6 · squeeze at full extension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior + Carry",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 10, 90, { notes: "+1 set vs week 2 · RPE 7–8 · neutral spine, stop at the first hamstring stretch" }),
            ex("Walking Lunge", 3, 12, 45, { notes: "12 each leg, start with your weaker side · rest −15s vs week 2 · RPE 7–8" }),
            ex("Lying Leg Curl", 3, 12, 30, { notes: "Machine · or band at home · rest −15s vs week 2 · RPE 7–8" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Rest −15s vs week 2 · RPE 7–8 · pause at the top" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 7–8 · breathe steadily · hips level" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Quads + Glutes Metabolic",
          exercises: [
            ...wu("conditioning"),
            ex("Sumo Squat", 4, 15, 45, { notes: "+1 set vs week 2 · RPE 7–8 · light load, continuous rhythm" }),
            ex("Reverse Lunge", 3, 12, 30, { notes: "Each side, start with your weaker side · rest −15s vs week 2 · RPE 7–8" }),
            ex("Glute Bridge", 3, 20, 30, { notes: "RPE 7–8 · dumbbell across the hips optional · no pausing" }),
            ex("Frog Pump", 3, 20, 30, { notes: "RPE 7–8 · soles together · small pulses" }),
            ex("Wall Sit", 3, 45, 30, { seconds: true, notes: "RPE 7–8 · thighs parallel · breathe steadily" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    {
      title: "Deload",
      days: [
        {
          title: "Quad Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Leg Press", 2, 10, 120, { notes: "Deload · RPE 5 · ~40% less volume · or Goblet Squat if no leg press" }),
            ex("Goblet Squat", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · elbows inside the knees" }),
            ex("Sumo Squat", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · wide stance, toes out" }),
            ex("Reverse Lunge", 2, 10, 75, { notes: "Deload · RPE 5 · ~40% less volume · each side, start with your weaker side" }),
            ex("Leg Extension", 2, 15, 60, { notes: "Deload · RPE 5 · ~40% less volume · pause at full lockout" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Hip Thrust", 2, 12, 105, { notes: "Deload · RPE 5 · ~40% less volume · ribs down, drive through the heels" }),
            ex("Banded Good Morning", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · hinge, don't squat" }),
            ex("Curtsy Lunge", 2, 10, 75, { notes: "Deload · RPE 5 · ~40% less volume · each side, start with your weaker side" }),
            ex("Lateral Lunge", 2, 10, 75, { notes: "Deload · RPE 5 · ~40% less volume · each side, start with your weaker side" }),
            ex("Banded Kickback", 2, 12, 60, { notes: "Deload · RPE 5 · ~40% less volume · each side, start with your weaker side" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 2, 10, 90, { notes: "Deload · RPE 5 · ~40% less volume · light maintenance" }),
            ex("Single-Arm Dumbbell Row", 2, 10, 90, { notes: "Deload · RPE 5 · ~40% less volume · each side, start with your weaker side" }),
            ex("Dumbbell Shoulder Press", 2, 12, 90, { notes: "Deload · RPE 5 · ~40% less volume · no leg drive" }),
            ex("Lateral Raise", 2, 15, 75, { notes: "Deload · RPE 5 · ~40% less volume · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · elbows pinned" }),
            ex("Tricep Kickback", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · each side, start with your weaker side" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior + Carry",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 2, 10, 120, { notes: "Deload · RPE 5 · ~40% less volume · crisp reps, no grinding" }),
            ex("Walking Lunge", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · 12 each leg, start with your weaker side" }),
            ex("Lying Leg Curl", 2, 12, 60, { notes: "Deload · RPE 5 · ~40% less volume · machine or band" }),
            ex("Calf Raise", 2, 15, 60, { notes: "Deload · RPE 5 · ~40% less volume · full range" }),
            ex("Plank", 2, 45, 60, { seconds: true, notes: "Deload · RPE 5 · ~40% less volume · breathe steadily" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Quads + Glutes Metabolic",
          exercises: [
            ...wu("conditioning"),
            ex("Sumo Squat", 2, 15, 75, { notes: "Deload · RPE 5 · ~40% less volume · light load, continuous rhythm" }),
            ex("Reverse Lunge", 2, 12, 60, { notes: "Deload · RPE 5 · ~40% less volume · each side, start with your weaker side" }),
            ex("Glute Bridge", 2, 20, 60, { notes: "Deload · RPE 5 · ~40% less volume · no pausing at the floor" }),
            ex("Frog Pump", 2, 20, 60, { notes: "Deload · RPE 5 · ~40% less volume · small pulses" }),
            ex("Wall Sit", 2, 45, 60, { seconds: true, notes: "Deload · RPE 5 · ~40% less volume · thighs parallel" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    {
      title: "Intensify",
      days: [
        {
          title: "Quad Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Leg Press", 4, 10, 90, { notes: "Or Goblet Squat if no leg press · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Goblet Squat", 3, 12, 45, { notes: "Elbows inside the knees · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Sumo Squat", 3, 12, 45, { notes: "Wide stance, toes out · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side, start with your weaker side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Leg Extension", 3, 15, 30, { notes: "Pause at full lockout · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "Ribs down, drive through the heels · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Banded Good Morning", 3, 12, 45, { notes: "Hinge, don't squat · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Curtsy Lunge", 3, 10, 45, { notes: "Each side, start with your weaker side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lateral Lunge", 3, 10, 45, { notes: "Each side, start with your weaker side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Banded Kickback", 3, 12, 30, { notes: "Each side, start with your weaker side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Shoulder Press", 2, 12, 60, { notes: "No leg drive · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "No swinging · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "Elbows pinned · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side, start with your weaker side · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior + Carry",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 10, 90, { notes: "Neutral spine · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Walking Lunge", 3, 12, 45, { notes: "12 each leg, start with your weaker side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lying Leg Curl", 3, 12, 30, { notes: "Squeeze at the top · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Pause at the top · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "Breathe steadily · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Quads + Glutes Metabolic",
          exercises: [
            ...wu("conditioning"),
            ex("Sumo Squat", 4, 15, 45, { notes: "Continuous rhythm · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Reverse Lunge", 3, 12, 30, { notes: "Each side, start with your weaker side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Glute Bridge", 3, 20, 30, { notes: "No pausing · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Frog Pump", 3, 20, 30, { notes: "Small pulses · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Wall Sit", 3, 45, 30, { seconds: true, notes: "Thighs parallel · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    {
      title: "Peak",
      days: [
        {
          title: "Quad Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Leg Press", 4, 10, 90, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · or Goblet Squat if no leg press" }),
            ex("Goblet Squat", 3, 12, 60, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · beat your week 3 reps" }),
            ex("Sumo Squat", 3, 12, 60, { notes: "RPE 8 · hold week 3 reps · quality over load" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 8 · hold week 3 reps" }),
            ex("Leg Extension", 3, 15, 45, { notes: "Machine or band · RPE 7 · hold week 3 volume" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute Emphasis",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Hip Thrust", 4, 12, 75, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · beat your week 3 reps" }),
            ex("Banded Good Morning", 3, 12, 60, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · beat your week 3 reps" }),
            ex("Curtsy Lunge", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 8 · hold week 3 reps" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 8 · hold week 3 reps" }),
            ex("Banded Kickback", 3, 12, 45, { notes: "Each side, start with your weaker side · RPE 7 · hold week 3 volume" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · hold week 3 load — maintenance, not a test day" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side, start with your weaker side · RPE 6 · hold week 3 load" }),
            ex("Dumbbell Shoulder Press", 2, 12, 60, { notes: "RPE 6 · hold week 3 load · no leg drive" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "RPE 6 · hold week 3 load · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "RPE 6 · hold week 3 load · elbows pinned" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side, start with your weaker side · RPE 6 · hold week 3 load" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Posterior + Carry",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 10, 90, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · beat your week 3 reps" }),
            ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg, start with your weaker side · RPE 8 · hold week 3 reps" }),
            ex("Lying Leg Curl", 3, 12, 45, { notes: "Machine or band · RPE 7 · hold week 3 volume" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 7 · hold week 3 volume · pause at the top" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 7 · hold week 3 volume · breathe steadily" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Quads + Glutes Metabolic",
          exercises: [
            ...wu("conditioning"),
            ex("Sumo Squat", 4, 15, 45, { notes: "Retest week 1 · top set RPE 8–9, then back-off · beat your week 1 reps" }),
            ex("Reverse Lunge", 3, 12, 45, { notes: "Retest week 1 · each side, start with your weaker side · beat your week 1 reps" }),
            ex("Glute Bridge", 3, 20, 30, { notes: "Retest week 1 · beat 20 reps at the same load" }),
            ex("Frog Pump", 3, 20, 30, { notes: "Retest week 1 · beat 20 reps with small pulses" }),
            ex("Wall Sit", 3, 45, 30, { seconds: true, notes: "Retest week 1 · beat 45s with the thighs parallel" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },
  ],
};

export default O2;
