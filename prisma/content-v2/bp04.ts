import type { ProgramV2 } from "./types";
import { cd, ex, wu } from "./warmup";

/**
 * BP-04 · 6-Week Full Body Dumbbell Sculpt (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 6 weeks × 5 days · full-body alternating-emphasis strength-endurance.
 * All six movement patterns appear twice a week: days 1–2 are pattern-paired
 * strength (multi-joint first), day 3 is 8–12 rep strength accumulation, day 4
 * is 12–15 rep endurance accumulation, day 5 is low-load conditioning that
 * progresses by shorter rest — never by heavier load.
 * Every session: `wu(kind)` + 5–6 main rows + `cd(kind)`.
 */

export const BP04: ProgramV2 = {
  slug: "6-week-full-body-dumbbell-sculpt",
  title: "6-Week Full Body Dumbbell Sculpt",
  weeks: [
    {
      title: "Foundation",
      days: [
        {
          title: "Push + Legs",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bench Press", 3, 10, 75, { notes: "RPE 6–7 · ~3 reps in reserve · shoulder blades pinned, ribs down" }),
            ex("Goblet Squat", 3, 12, 60, { notes: "RPE 6–7 · elbows inside the knees · knees track over the toes" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "RPE 6–7 · no arching the lower back · weights finish over the shoulders" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · front knee tracks over the toes · torso upright" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 6–7 · breathe steadily · hips level, ribs down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Pull + Posterior",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bent-Over Row", 3, 10, 75, { notes: "RPE 6–7 · flat back · pull the elbows past the ribs" }),
            ex("Dumbbell Romanian Deadlift", 3, 10, 75, { notes: "RPE 6–7 · hinge, don't squat · stop at the first hamstring stretch" }),
            ex("Lateral Raise", 3, 15, 45, { notes: "RPE 6–7 · light load · lead with the elbows, no swinging" }),
            ex("Step-Up", 3, 12, 60, { notes: "Each side · drive through the top foot · full hip extension" }),
            ex("Dead Bug", 3, 10, 45, { notes: "RPE 6–7 · lower back pressed down · opposite arm and leg" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body A",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 3, 12, 60, { notes: "RPE 6–7 · knees track over the toes · upright torso" }),
            ex("Chest-Supported Dumbbell Row", 3, 10, 75, { notes: "RPE 6–7 · chest on the bench · drive the elbows back" }),
            ex("Incline Dumbbell Press", 3, 12, 60, { notes: "RPE 6–7 · or floor press if you have no incline bench" }),
            ex("Hammer Curl", 3, 12, 45, { notes: "RPE 6–7 · elbows pinned to the sides · neutral grip" }),
            ex("Russian Twist", 3, 16, 45, { notes: "8 each side · rotate from the ribs, not the arms" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body B",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 3, 12, 75, { notes: "Each side · rear foot on a chair · RPE 6–7 · front knee tracks over the toes" }),
            ex("Dumbbell Hip Thrust", 3, 15, 60, { notes: "RPE 6–7 · chin tucked · pause and squeeze at the top" }),
            ex("Single-Arm Dumbbell Row", 3, 12, 60, { notes: "Each side · brace on a chair · pull the elbow past the ribs" }),
            ex("Arnold Press", 3, 15, 60, { notes: "RPE 6–7 · smooth rotation · no arching the lower back" }),
            ex("Lying Leg Raise", 3, 15, 45, { notes: "Lower back pressed down · slow on the way down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning + Core",
          exercises: [
            ...wu("conditioning"),
            ex("Step Jack", 3, 45, 45, { seconds: true, notes: "Low-impact · step wide, arms to shoulder height · steady breathing" }),
            ex("Low-Impact Skater", 3, 45, 45, { seconds: true, notes: "Sit the hip back · no jumping · chest up" }),
            ex("Mountain Climber", 3, 30, 35, { seconds: true, notes: "Hips level · fast knees, quiet landings" }),
            ex("Squat to Calf Raise", 3, 15, 45, { notes: "Squat as deep as you own · finish tall on the toes" }),
            ex("Hollow Body Hold", 3, 25, 35, { seconds: true, notes: "Lower back pressed down · breathe in short sips" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },
    {
      title: "Build",
      days: [
        {
          title: "Push + Legs",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bench Press", 4, 10, 75, { notes: "+1 set vs week 1 · RPE 7 · ~2 reps in reserve" }),
            ex("Goblet Squat", 4, 12, 60, { notes: "+1 set vs week 1 · RPE 7 · knees track over the toes" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "Hold week 1 reps · RPE 7 · stop two reps short of failure" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · hold week 1 reps · torso upright" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "Hold week 1 time · breathe steadily · hips level" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Pull + Posterior",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bent-Over Row", 4, 10, 75, { notes: "+1 set vs week 1 · RPE 7 · flat back" }),
            ex("Dumbbell Romanian Deadlift", 4, 10, 75, { notes: "+1 set vs week 1 · RPE 7 · hinge, don't squat" }),
            ex("Lateral Raise", 3, 15, 45, { notes: "Hold week 1 reps · light load · lead with the elbows" }),
            ex("Step-Up", 3, 12, 60, { notes: "Each side · hold week 1 reps · full hip extension" }),
            ex("Dead Bug", 3, 10, 45, { notes: "Hold week 1 reps · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body A",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 3, 12, 60, { notes: "Hold week 1 reps · RPE 7 · own every rep before you add load" }),
            ex("Chest-Supported Dumbbell Row", 3, 10, 75, { notes: "Hold week 1 reps · chest on the bench" }),
            ex("Incline Dumbbell Press", 3, 12, 60, { notes: "Hold week 1 reps · or floor press if you have no incline bench" }),
            ex("Hammer Curl", 3, 12, 45, { notes: "Hold week 1 reps · elbows pinned to the sides" }),
            ex("Russian Twist", 3, 16, 45, { notes: "8 each side · rotate from the ribs, not the arms" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body B",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 3, 12, 75, { notes: "Each side · hold week 1's 12 reps · front knee tracks over the toes" }),
            ex("Dumbbell Hip Thrust", 3, 15, 60, { notes: "Hold week 1's 15 reps · pause and squeeze at the top" }),
            ex("Single-Arm Dumbbell Row", 3, 12, 60, { notes: "Each side · hold week 1 reps · pull the elbow past the ribs" }),
            ex("Arnold Press", 3, 15, 60, { notes: "Hold week 1's 15 reps · smooth rotation" }),
            ex("Lying Leg Raise", 3, 15, 45, { notes: "Hold week 1's 15 reps · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning + Core",
          exercises: [
            ...wu("conditioning"),
            ex("Step Jack", 3, 45, 40, { seconds: true, notes: "Rest −5s vs week 1 · step wide, arms to shoulder height" }),
            ex("Low-Impact Skater", 3, 45, 40, { seconds: true, notes: "Rest −5s vs week 1 · sit the hip back, no jumping" }),
            ex("Mountain Climber", 3, 30, 30, { seconds: true, notes: "Rest −5s vs week 1 · hips level, fast knees" }),
            ex("Squat to Calf Raise", 3, 15, 40, { notes: "Rest −5s vs week 1 · finish tall on the toes" }),
            ex("Hollow Body Hold", 3, 25, 30, { seconds: true, notes: "Rest −5s vs week 1 · lower back pressed down" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },
    {
      title: "Volume",
      days: [
        {
          title: "Push + Legs",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bench Press", 4, 10, 75, { notes: "Hold week 2 volume · RPE 7 · shoulder blades pinned" }),
            ex("Goblet Squat", 4, 12, 60, { notes: "Hold week 2 volume · RPE 7 · knees track over the toes" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "Rest −15s vs week 2 · RPE 7 · no arching the lower back" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · rest −15s vs week 2 · front knee tracks over the toes" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "Rest held at 30s · breathe steadily · hips level" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Pull + Posterior",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bent-Over Row", 4, 10, 75, { notes: "Hold week 2 volume · RPE 7 · pull the elbows past the ribs" }),
            ex("Dumbbell Romanian Deadlift", 4, 10, 75, { notes: "Hold week 2 volume · RPE 7 · stop at the first hamstring stretch" }),
            ex("Lateral Raise", 3, 15, 30, { notes: "Rest −15s vs week 2 · light load · lead with the elbows" }),
            ex("Step-Up", 3, 12, 45, { notes: "Each side · rest −15s vs week 2 · full hip extension" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Rest −15s vs week 2 · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body A",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 4, 12, 60, { notes: "+1 set vs week 2 · RPE 7 · upright torso" }),
            ex("Chest-Supported Dumbbell Row", 4, 10, 75, { notes: "+1 set vs week 2 · RPE 7 · drive the elbows back" }),
            ex("Incline Dumbbell Press", 4, 12, 45, { notes: "+1 set, rest −15s vs week 2 · or floor press if you have no incline bench" }),
            ex("Hammer Curl", 4, 12, 30, { notes: "+1 set, rest −15s vs week 2 · elbows pinned to the sides" }),
            ex("Russian Twist", 4, 16, 30, { notes: "+1 set, rest −15s vs week 2 · 8 each side" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body B",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 4, 12, 75, { notes: "Each side · +1 set vs week 2 · front knee tracks over the toes" }),
            ex("Dumbbell Hip Thrust", 4, 15, 60, { notes: "+1 set vs week 2 · pause and squeeze at the top" }),
            ex("Single-Arm Dumbbell Row", 4, 12, 45, { notes: "Each side · +1 set, rest −15s vs week 2 · elbow past the ribs" }),
            ex("Arnold Press", 4, 15, 45, { notes: "+1 set, rest −15s vs week 2 · smooth rotation" }),
            ex("Lying Leg Raise", 4, 15, 30, { notes: "+1 set, rest −15s vs week 2 · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning + Core",
          exercises: [
            ...wu("conditioning"),
            ex("Step Jack", 3, 45, 35, { seconds: true, notes: "Rest −5s vs week 2 · steady breathing" }),
            ex("Low-Impact Skater", 3, 45, 35, { seconds: true, notes: "Rest −5s vs week 2 · sit the hip back, no jumping" }),
            ex("Mountain Climber", 3, 30, 25, { seconds: true, notes: "Rest −5s vs week 2 · hips level, fast knees" }),
            ex("Squat to Calf Raise", 3, 15, 35, { notes: "Rest −5s vs week 2 · finish tall on the toes" }),
            ex("Hollow Body Hold", 3, 25, 25, { seconds: true, notes: "Rest −5s vs week 2 · lower back pressed down" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },
    {
      title: "Deload",
      days: [
        {
          title: "Push + Legs",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bench Press", 2, 10, 105, { notes: "Deload · RPE 5 · ~40% less volume · smooth reps, no grind" }),
            ex("Goblet Squat", 2, 12, 90, { notes: "Deload · RPE 5 · ~40% less volume · crisp technique" }),
            ex("Dumbbell Shoulder Press", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · rest +30s" }),
            ex("Reverse Lunge", 2, 10, 75, { notes: "Each side · Deload · RPE 5 · ~40% less volume" }),
            ex("Plank", 2, 45, 60, { seconds: true, notes: "Deload · RPE 5 · ~40% less volume · breathe steadily" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Pull + Posterior",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bent-Over Row", 2, 10, 105, { notes: "Deload · RPE 5 · ~40% less volume · flat back" }),
            ex("Dumbbell Romanian Deadlift", 2, 10, 105, { notes: "Deload · RPE 5 · ~40% less volume · hinge, don't squat" }),
            ex("Lateral Raise", 2, 15, 60, { notes: "Deload · RPE 5 · ~40% less volume · light load" }),
            ex("Step-Up", 2, 12, 75, { notes: "Each side · Deload · RPE 5 · ~40% less volume" }),
            ex("Dead Bug", 2, 10, 60, { notes: "Deload · RPE 5 · ~40% less volume · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body A",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 2, 12, 90, { notes: "Deload · RPE 5 · ~40% less volume · knees track over the toes" }),
            ex("Chest-Supported Dumbbell Row", 2, 10, 105, { notes: "Deload · RPE 5 · ~40% less volume · chest on the bench" }),
            ex("Incline Dumbbell Press", 2, 12, 75, { notes: "Deload · RPE 5 · ~40% less volume · or floor press" }),
            ex("Hammer Curl", 2, 12, 60, { notes: "Deload · RPE 5 · ~40% less volume · elbows pinned" }),
            ex("Russian Twist", 2, 16, 60, { notes: "Deload · RPE 5 · ~40% less volume · 8 each side" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body B",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 2, 12, 105, { notes: "Each side · Deload · RPE 5 · ~40% less volume" }),
            ex("Dumbbell Hip Thrust", 2, 15, 90, { notes: "Deload · RPE 5 · ~40% less volume · squeeze at the top" }),
            ex("Single-Arm Dumbbell Row", 2, 12, 75, { notes: "Each side · Deload · RPE 5 · ~40% less volume" }),
            ex("Arnold Press", 2, 15, 75, { notes: "Deload · RPE 5 · ~40% less volume · smooth rotation" }),
            ex("Lying Leg Raise", 2, 15, 60, { notes: "Deload · RPE 5 · ~40% less volume · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning + Core",
          exercises: [
            ...wu("conditioning"),
            ex("Step Jack", 2, 45, 65, { seconds: true, notes: "Deload · RPE 5 · ~40% less volume · rest +30s" }),
            ex("Low-Impact Skater", 2, 45, 65, { seconds: true, notes: "Deload · RPE 5 · ~40% less volume · easy pace" }),
            ex("Mountain Climber", 2, 30, 55, { seconds: true, notes: "Deload · RPE 5 · ~40% less volume · hips level" }),
            ex("Squat to Calf Raise", 2, 15, 65, { notes: "Deload · RPE 5 · ~40% less volume · finish tall" }),
            ex("Hollow Body Hold", 2, 25, 55, { seconds: true, notes: "Deload · RPE 5 · ~40% less volume · breathe in short sips" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },
    {
      title: "Intensify",
      days: [
        {
          title: "Push + Legs",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bench Press", 4, 10, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Goblet Squat", 4, 12, 60, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Pull + Posterior",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bent-Over Row", 4, 10, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Romanian Deadlift", 4, 10, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lateral Raise", 3, 15, 30, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Step-Up", 3, 12, 45, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dead Bug", 3, 10, 30, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body A",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 4, 12, 60, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Chest-Supported Dumbbell Row", 4, 10, 75, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Incline Dumbbell Press", 4, 12, 45, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps · or floor press" }),
            ex("Hammer Curl", 4, 12, 30, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Russian Twist", 4, 16, 30, { notes: "8 each side · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body B",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 4, 12, 75, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Dumbbell Hip Thrust", 4, 15, 60, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Single-Arm Dumbbell Row", 4, 12, 45, { notes: "Each side · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Arnold Press", 4, 15, 45, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Lying Leg Raise", 4, 15, 30, { notes: "RPE 7 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning + Core",
          exercises: [
            ...wu("conditioning"),
            ex("Step Jack", 3, 45, 35, { seconds: true, notes: "Rest back to week 3 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Low-Impact Skater", 3, 45, 35, { seconds: true, notes: "Rest back to week 3 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Mountain Climber", 3, 30, 25, { seconds: true, notes: "Rest back to week 3 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Squat to Calf Raise", 3, 15, 35, { notes: "Rest back to week 3 · add 2–10% when you beat the target by 1–2 reps" }),
            ex("Hollow Body Hold", 3, 25, 25, { seconds: true, notes: "Rest back to week 3 · add 2–10% when you beat the target by 1–2 reps" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },
    {
      title: "Peak & Test",
      days: [
        {
          title: "Push + Legs",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bench Press", 1, 6, 90, { notes: "Top set · RPE 8–9 · heavier than week 5 · own the rep first" }),
            ex("Dumbbell Bench Press", 3, 10, 75, { notes: "Back-off · RPE 7 · retest week 1's 10 reps at week 5 load" }),
            ex("Goblet Squat", 4, 12, 60, { notes: "Peak · top set on set 1, then back-off ~10% · beat week 1's 12 reps" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "Peak · top set on set 1, then back-off · beat week 1's 12 reps" }),
            ex("Reverse Lunge", 3, 10, 45, { notes: "Each side · top set then back-off · retest week 1's 10 reps" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "Peak · hold week 5 time · breathe steadily, hips level" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Pull + Posterior",
          exercises: [
            ...wu("lower"),
            ex("Dumbbell Bent-Over Row", 1, 6, 90, { notes: "Top set · RPE 8–9 · heavier than week 5 · flat back" }),
            ex("Dumbbell Bent-Over Row", 3, 10, 75, { notes: "Back-off · RPE 7 · retest week 1's 10 reps at week 5 load" }),
            ex("Dumbbell Romanian Deadlift", 4, 10, 75, { notes: "Peak · top set on set 1, then back-off ~10% · beat week 1's 10 reps" }),
            ex("Lateral Raise", 3, 15, 30, { notes: "Peak · hold week 5 load · lead with the elbows" }),
            ex("Step-Up", 3, 12, 45, { notes: "Each side · peak · beat week 1's 12 reps at week 5 load" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Peak · hold week 5 reps · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body A",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 1, 8, 75, { notes: "Top set · RPE 8–9 · heavier than week 5 · upright torso" }),
            ex("Sumo Squat", 3, 12, 60, { notes: "Back-off · RPE 7 · retest week 1's 12 reps at week 5 load" }),
            ex("Chest-Supported Dumbbell Row", 4, 10, 75, { notes: "Peak · top set on set 1, then back-off ~10% · beat week 1's 10 reps" }),
            ex("Incline Dumbbell Press", 4, 12, 45, { notes: "Peak · top set then back-off · or floor press if you have no incline bench" }),
            ex("Hammer Curl", 4, 12, 30, { notes: "Peak · top set then back-off · elbows pinned to the sides" }),
            ex("Russian Twist", 4, 16, 30, { notes: "8 each side · peak · rotate from the ribs, not the arms" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body B",
          exercises: [
            ...wu("lower"),
            ex("Bulgarian Split Squat", 1, 8, 90, { notes: "Each side · top set · RPE 8–9 · heavier than week 5" }),
            ex("Bulgarian Split Squat", 3, 12, 75, { notes: "Back-off · RPE 7 · retest week 1's 12 reps at week 5 load" }),
            ex("Dumbbell Hip Thrust", 4, 15, 60, { notes: "Peak · top set on set 1, then back-off ~10% · squeeze at the top" }),
            ex("Single-Arm Dumbbell Row", 4, 12, 45, { notes: "Each side · peak · beat week 1's 12 reps at week 5 load" }),
            ex("Arnold Press", 4, 15, 45, { notes: "Peak · top set then back-off · smooth rotation" }),
            ex("Lying Leg Raise", 4, 15, 30, { notes: "Peak · hold week 5 reps · lower back pressed down" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Conditioning + Core",
          exercises: [
            ...wu("conditioning"),
            ex("Step Jack", 3, 45, 30, { seconds: true, notes: "Final test · retest week 1's work at the shortest rest of the program" }),
            ex("Low-Impact Skater", 3, 45, 30, { seconds: true, notes: "Rest −5s vs week 3 · sit the hip back, no jumping" }),
            ex("Mountain Climber", 3, 30, 20, { seconds: true, notes: "Rest −5s vs week 3 · hips level, fast knees" }),
            ex("Squat to Calf Raise", 3, 15, 30, { notes: "Rest −5s vs week 3 · finish tall on the toes" }),
            ex("Hollow Body Hold", 3, 25, 20, { seconds: true, notes: "Rest −5s vs week 3 · lower back pressed down" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },
  ],
};

export default BP04;
