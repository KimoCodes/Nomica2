import type { ProgramV2 } from "./types";
import { cd, ex, wu } from "./warmup";

/**
 * BP-O1 · 6-Week Dumbbell Glute Growth (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 6 weeks × 5 days · dumbbell-only lower-body hypertrophy — no barbell anywhere.
 * Skeleton per session: wu(kind) → 5–6 main rows → cd(kind). Week 4 is the deload.
 */

export const O1: ProgramV2 = {
  slug: "6-week-dumbbell-glute-growth",
  title: "6-Week Dumbbell Glute Growth",
  weeks: [
    {
      title: "Foundation",
      days: [
        {
          title: "Lower Heavy",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 3, 10, 90, { notes: "RPE 6–7 · tempo 3-1-1 · hinge, don't squat · stop at the first hamstring stretch" }),
            ex("Goblet Squat", 3, 12, 75, { notes: "RPE 6–7 · elbows inside the knees · whole foot planted" }),
            ex("Dumbbell Hip Thrust", 3, 12, 75, { notes: "RPE 6–7 · upper back on the bench, chin tucked · drive through the heels" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · RPE 6–7 · soft step back, front shin stays vertical" }),
            ex("Lying Leg Curl", 3, 12, 45, { notes: "Machine · at home curl a dumbbell between your feet · RPE 6–7" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 6–7 · full range · one-second pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · maintenance, not a growth day" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6 · brace on your thigh or a bench" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "RPE 6 · slight bend in the elbows · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "RPE 6 · elbows pinned to your sides" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side · RPE 6 · squeeze at full extension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Glute Volume",
          exercises: [
            ...wu("lower"),
            ex("Glute Bridge", 3, 15, 45, { notes: "RPE 6–7 · dumbbell across the hips once bodyweight feels easy" }),
            ex("Sumo Squat", 3, 12, 60, { notes: "RPE 6–7 · wide stance, toes turned out · knees track over the toes" }),
            ex("Reverse Lunge", 3, 12, 60, { notes: "Each side · RPE 6–7 · control over speed" }),
            ex("Frog Pump", 3, 20, 30, { notes: "RPE 6–7 · soles together · small pulses, glutes only" }),
            ex("Leg Extension", 3, 15, 45, { notes: "Machine · or band at home · RPE 6–7 · pause at full lockout" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Lower Unilateral",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 3, 10, 75, { notes: "Each side · RPE 6–7 · never take a split squat to failure when you train alone" }),
            ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg · RPE 6–7 · tall torso, step all the way through" }),
            ex("Step-Up", 3, 12, 60, { notes: "Each side, dumbbells at sides · RPE 6–7 · drive through the heel, don't push off" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side · RPE 6–7 · sit the hip back, trailing leg straight" }),
            ex("Single-Leg Glute Bridge", 3, 12, 45, { notes: "Each side · RPE 6–7 · hips level at the top" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 6–7 · full stretch at the bottom" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute + Core",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 3, 12, 60, { notes: "RPE 6–7 · chest up · sit down between your heels" }),
            ex("Dumbbell Hip Thrust", 3, 15, 60, { notes: "RPE 6–7 · ribs down · one-second squeeze at the top" }),
            ex("Russian Twist", 3, 16, 45, { notes: "8 each side · RPE 6–7 · hold a dumbbell if it feels easy" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 6–7 · breathe steadily · hips level" }),
            ex("Dead Bug", 3, 10, 45, { notes: "RPE 6–7 · lower back pressed down · opposite arm and leg" }),
            ...cd("lower"),
          ],
        },
      ],
    },

    {
      title: "Build",
      days: [
        {
          title: "Lower Heavy",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 10, 90, { notes: "+1 set vs week 1 · RPE 7 · tempo 3-1-1 · stop at the first hamstring stretch" }),
            ex("Goblet Squat", 3, 12, 75, { notes: "RPE 7 · elbows inside the knees · whole foot planted" }),
            ex("Dumbbell Hip Thrust", 3, 12, 75, { notes: "RPE 7 · upper back on the bench, chin tucked · drive through the heels" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · RPE 7 · soft step back, front shin stays vertical" }),
            ex("Lying Leg Curl", 3, 12, 45, { notes: "Machine · at home curl a dumbbell between your feet · RPE 7" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 7 · full range · one-second pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · hold week 1 load — this day never progresses" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6 · hold week 1 load · brace on your thigh" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "RPE 6 · hold week 1 load · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "RPE 6 · elbows pinned to your sides" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side · RPE 6 · squeeze at full extension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Glute Volume",
          exercises: [
            ...wu("lower"),
            ex("Glute Bridge", 4, 15, 45, { notes: "+1 set vs week 1 · RPE 7 · dumbbell across the hips once bodyweight feels easy" }),
            ex("Sumo Squat", 3, 12, 60, { notes: "RPE 7 · wide stance, toes turned out · knees track over the toes" }),
            ex("Reverse Lunge", 3, 12, 60, { notes: "Each side · RPE 7 · control over speed" }),
            ex("Frog Pump", 3, 20, 30, { notes: "RPE 7 · soles together · small pulses, glutes only" }),
            ex("Leg Extension", 3, 15, 45, { notes: "Machine · or band at home · RPE 7 · pause at full lockout" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Lower Unilateral",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 3, 10, 75, { notes: "Each side · RPE 7 · never take a split squat to failure when you train alone" }),
            ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg · RPE 7 · tall torso, step all the way through" }),
            ex("Step-Up", 3, 12, 60, { notes: "Each side, dumbbells at sides · RPE 7 · drive through the heel, don't push off" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side · RPE 7 · sit the hip back, trailing leg straight" }),
            ex("Single-Leg Glute Bridge", 3, 12, 45, { notes: "Each side · RPE 7 · hips level at the top" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 7 · full stretch at the bottom" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute + Core",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 3, 12, 60, { notes: "RPE 7 · chest up · sit down between your heels" }),
            ex("Dumbbell Hip Thrust", 3, 15, 60, { notes: "RPE 7 · ribs down · one-second squeeze at the top" }),
            ex("Russian Twist", 3, 16, 45, { notes: "8 each side · RPE 7 · hold a dumbbell if it feels easy" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 7 · breathe steadily · hips level" }),
            ex("Dead Bug", 3, 10, 45, { notes: "RPE 7 · lower back pressed down · opposite arm and leg" }),
            ...cd("lower"),
          ],
        },
      ],
    },

    {
      title: "Volume",
      days: [
        {
          title: "Lower Heavy",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 10, 90, { notes: "Hold 4 sets from week 2 · RPE 7–8 · tempo 3-1-1 · stop at the first hamstring stretch" }),
            ex("Goblet Squat", 3, 12, 60, { notes: "Rest −15s vs week 2 · RPE 7–8 · elbows inside the knees" }),
            ex("Dumbbell Hip Thrust", 3, 12, 60, { notes: "Rest −15s vs week 2 · RPE 7–8 · ribs down, drive through the heels" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · rest −15s vs week 2 · RPE 7–8" }),
            ex("Lying Leg Curl", 3, 12, 30, { notes: "Machine · rest −15s vs week 2 · RPE 7–8 · squeeze at the top" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Rest −15s vs week 2 · RPE 7–8 · pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · hold week 1 load — this day never progresses" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6 · hold week 1 load · brace on your thigh" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "RPE 6 · hold week 1 load · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "RPE 6 · elbows pinned to your sides" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side · RPE 6 · squeeze at full extension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Glute Volume",
          exercises: [
            ...wu("lower"),
            ex("Glute Bridge", 4, 15, 45, { notes: "Hold 4 sets from week 2 · RPE 7–8 · dumbbell across the hips" }),
            ex("Sumo Squat", 3, 12, 45, { notes: "Rest −15s vs week 2 · RPE 7–8 · wide stance, toes turned out" }),
            ex("Reverse Lunge", 3, 12, 45, { notes: "Each side · rest −15s vs week 2 · RPE 7–8 · control over speed" }),
            ex("Frog Pump", 3, 20, 30, { notes: "RPE 7–8 · soles together · small pulses, glutes only" }),
            ex("Leg Extension", 3, 15, 30, { notes: "Machine · or band at home · rest −15s vs week 2 · RPE 7–8" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Lower Unilateral",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 4, 10, 75, { notes: "+1 set vs week 2 · RPE 7–8 · never take a split squat to failure when you train alone" }),
            ex("Walking Lunge", 3, 12, 45, { notes: "12 each leg · rest −15s vs week 2 · RPE 7–8 · tall torso" }),
            ex("Step-Up", 3, 12, 45, { notes: "Each side, dumbbells at sides · rest −15s vs week 2 · RPE 7–8" }),
            ex("Lateral Lunge", 3, 10, 45, { notes: "Each side · rest −15s vs week 2 · RPE 7–8 · sit the hip back" }),
            ex("Single-Leg Glute Bridge", 3, 12, 30, { notes: "Each side · rest −15s vs week 2 · RPE 7–8 · hips level" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Rest −15s vs week 2 · RPE 7–8 · full stretch at the bottom" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute + Core",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 4, 12, 60, { notes: "+1 set vs week 2 · RPE 7–8 · chest up, sit between the heels" }),
            ex("Dumbbell Hip Thrust", 3, 15, 45, { notes: "Rest −15s vs week 2 · RPE 7–8 · ribs down, one-second squeeze" }),
            ex("Russian Twist", 3, 16, 30, { notes: "8 each side · rest −15s vs week 2 · RPE 7–8" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 7–8 · breathe steadily · hips level" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Rest −15s vs week 2 · RPE 7–8 · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
      ],
    },

    {
      title: "Deload",
      days: [
        {
          title: "Lower Heavy",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 2, 10, 120, { notes: "Deload · RPE 5 · ~40% less volume · crisp reps, no grinding" }),
            ex("Goblet Squat", 2, 12, 90, { notes: "Deload · RPE 5 · ~40% less volume · elbows inside the knees" }),
            ex("Dumbbell Hip Thrust", 2, 12, 90, { notes: "Deload · RPE 5 · ~40% less volume · drive through the heels, ribs down" }),
            ex("Reverse Lunge", 2, 10, 75, { notes: "Deload · RPE 5 · ~40% less volume · each side" }),
            ex("Lying Leg Curl", 2, 12, 60, { notes: "Deload · RPE 5 · ~40% less volume · machine or dumbbell at home" }),
            ex("Calf Raise", 2, 15, 60, { notes: "Deload · RPE 5 · ~40% less volume · pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 2, 10, 90, { notes: "Deload · RPE 5 · ~40% less volume · light maintenance" }),
            ex("Single-Arm Dumbbell Row", 2, 10, 90, { notes: "Deload · RPE 5 · ~40% less volume · each side" }),
            ex("Lateral Raise", 2, 15, 75, { notes: "Deload · RPE 5 · ~40% less volume · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · elbows pinned" }),
            ex("Tricep Kickback", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · each side" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Glute Volume",
          exercises: [
            ...wu("lower"),
            ex("Glute Bridge", 2, 15, 75, { notes: "Deload · RPE 5 · ~40% less volume · dumbbell across the hips" }),
            ex("Sumo Squat", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · wide stance, toes out" }),
            ex("Reverse Lunge", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · each side" }),
            ex("Frog Pump", 2, 20, 60, { notes: "Deload · RPE 5 · ~40% less volume · small pulses" }),
            ex("Leg Extension", 2, 15, 60, { notes: "Deload · RPE 5 · ~40% less volume · pause at full lockout" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Lower Unilateral",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 2, 10, 105, { notes: "Deload · RPE 5 · ~40% less volume · each side, well short of failure" }),
            ex("Walking Lunge", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · 12 each leg" }),
            ex("Step-Up", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · each side" }),
            ex("Lateral Lunge", 2, 10, 75, { notes: "Deload · RPE 5 · ~40% less volume · each side" }),
            ex("Single-Leg Glute Bridge", 2, 12, 60, { notes: "Deload · RPE 5 · ~40% less volume · each side, hips level" }),
            ex("Calf Raise", 2, 15, 60, { notes: "Deload · RPE 5 · ~40% less volume · full range" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute + Core",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 2, 12, 90, { notes: "Deload · RPE 5 · ~40% less volume · chest up" }),
            ex("Dumbbell Hip Thrust", 2, 15, 75, { notes: "Deload · RPE 5 · ~40% less volume · ribs down" }),
            ex("Russian Twist", 2, 16, 60, { notes: "Deload · RPE 5 · ~40% less volume · 8 each side" }),
            ex("Plank", 2, 45, 60, { seconds: true, notes: "Deload · RPE 5 · ~40% less volume · breathe steadily" }),
            ex("Dead Bug", 2, 10, 60, { notes: "Deload · RPE 5 · ~40% less volume · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
      ],
    },

    {
      title: "Intensify",
      days: [
        {
          title: "Lower Heavy",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 10, 90, { notes: "Tempo 3-1-1 · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Goblet Squat", 3, 12, 60, { notes: "Elbows inside the knees · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Hip Thrust", 3, 12, 60, { notes: "Ribs down, drive through the heels · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lying Leg Curl", 3, 12, 30, { notes: "Machine · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Pause at the top · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "No swinging · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "Elbows pinned · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side · RPE 6 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Glute Volume",
          exercises: [
            ...wu("lower"),
            ex("Glute Bridge", 4, 15, 45, { notes: "Dumbbell across the hips · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Sumo Squat", 3, 12, 45, { notes: "Wide stance, toes out · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Reverse Lunge", 3, 12, 45, { notes: "Each side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Frog Pump", 3, 20, 30, { notes: "Small pulses · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Leg Extension", 3, 15, 30, { notes: "Pause at full lockout · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Lower Unilateral",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 4, 10, 75, { notes: "Each side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Walking Lunge", 3, 12, 45, { notes: "12 each leg · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Step-Up", 3, 12, 45, { notes: "Each side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lateral Lunge", 3, 10, 45, { notes: "Each side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Single-Leg Glute Bridge", 3, 12, 30, { notes: "Each side, hips level · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Calf Raise", 3, 15, 30, { notes: "Full range · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute + Core",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 4, 12, 60, { notes: "Chest up · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Hip Thrust", 3, 15, 45, { notes: "Ribs down · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Russian Twist", 3, 16, 30, { notes: "8 each side · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "Breathe steadily · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Lower back pressed down · RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
      ],
    },

    {
      title: "Peak",
      days: [
        {
          title: "Lower Heavy",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Romanian Deadlift", 4, 10, 90, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · beat your week 3 reps" }),
            ex("Goblet Squat", 3, 12, 75, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · beat your week 3 reps" }),
            ex("Dumbbell Hip Thrust", 3, 12, 75, { notes: "RPE 8 · hold week 3 reps · stop before your form breaks" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · RPE 8 · hold week 3 reps · quality over load" }),
            ex("Lying Leg Curl", 3, 12, 45, { notes: "Machine · RPE 7 · hold week 3 volume" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 7 · hold week 3 volume · pause at the top" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Upper Maintenance",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 60, { notes: "Light · RPE 6 · hold week 3 load — maintenance, not a test day" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · RPE 6 · hold week 3 load" }),
            ex("Lateral Raise", 2, 15, 45, { notes: "RPE 6 · hold week 3 load · no swinging" }),
            ex("Dumbbell Bicep Curl", 2, 12, 45, { notes: "RPE 6 · hold week 3 load · elbows pinned" }),
            ex("Tricep Kickback", 2, 12, 45, { notes: "Each side · RPE 6 · hold week 3 load" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Glute Volume",
          exercises: [
            ...wu("lower"),
            ex("Glute Bridge", 4, 15, 45, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · beat your week 3 reps" }),
            ex("Sumo Squat", 3, 12, 60, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · beat your week 3 reps" }),
            ex("Reverse Lunge", 3, 12, 60, { notes: "Each side · RPE 8 · hold week 3 reps · quality over load" }),
            ex("Frog Pump", 3, 20, 30, { notes: "RPE 7 · hold week 3 volume · small pulses" }),
            ex("Leg Extension", 3, 15, 45, { notes: "Machine · RPE 7 · hold week 3 volume · pause at full lockout" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Lower Unilateral",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 4, 10, 75, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · beat your week 3 reps" }),
            ex("Walking Lunge", 3, 12, 60, { notes: "Top set RPE 8–9 · back-off sets ~10% lighter · 12 each leg" }),
            ex("Step-Up", 3, 12, 60, { notes: "Each side · RPE 8 · hold week 3 reps · drive through the heel" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side · RPE 8 · hold week 3 reps · sit the hip back" }),
            ex("Single-Leg Glute Bridge", 3, 12, 45, { notes: "Each side · RPE 7 · hold week 3 volume · hips level" }),
            ex("Calf Raise", 3, 15, 45, { notes: "RPE 7 · hold week 3 volume · full stretch" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Glute + Core",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 4, 12, 60, { notes: "Retest week 1 · top set RPE 8–9, then back-off · beat your week 1 reps" }),
            ex("Dumbbell Hip Thrust", 3, 15, 60, { notes: "Retest week 1 · beat 15 reps at the same load" }),
            ex("Russian Twist", 3, 16, 45, { notes: "Retest week 1 · beat 16 reps — 8 each side" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "Retest week 1 · beat 45s with the hips level" }),
            ex("Dead Bug", 3, 10, 45, { notes: "Retest week 1 · beat 10 reps with the lower back down" }),
            ...cd("lower"),
          ],
        },
      ],
    },
  ],
};

export default O1;
