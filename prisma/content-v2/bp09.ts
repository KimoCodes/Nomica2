import type { ProgramV2 } from "./types";
import { cd, ex, exSec, wu } from "./warmup";

/**
 * BP-09 · 30-Day Glute Growth Challenge (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 4 weeks × 5 days · the middle step between a band-only activation challenge
 * (BP-01) and an eight-week barbell hypertrophy block (BP-02): glute
 * development through three loading styles — bodyweight activation, dumbbell
 * compound work, then band-and-circuit density.
 * Progression: bodyweight → band → dumbbell, one step per week; then rounds;
 * week 4 retests week 1's numbers at the heaviest load you control.
 * No shape promises in the copy — strength and muscle endurance only.
 * Every session: `wu(kind)` + 4–5 main rows + `cd(kind)`.
 */

export const BP09: ProgramV2 = {
  slug: "30-day-glute-growth-challenge",
  title: "30-Day Glute Growth Challenge",
  weeks: [
    // ── Week 1 · Foundation ────────────────────────────────────────────────
    {
      title: "Foundation",
      days: [
        {
          title: "Glute Activation",
          exercises: [
            ...wu("glutes"),
            ex("Glute Bridge", 3, 15, 45, { notes: "Bodyweight · drive through the heels · one-second squeeze at the top" }),
            ex("Frog Pump", 3, 20, 45, { notes: "Bodyweight · soles together · small pulses, glutes only" }),
            ex("Banded Lateral Walk", 3, 15, 45, { notes: "Light band above the knees · quarter squat · constant tension" }),
            ex("Clamshell", 3, 12, 45, { notes: "Each side · light band · hips stacked · feet together" }),
            ex("Donkey Kick", 3, 12, 45, { notes: "Each side · ribs down, heel to the ceiling · no arching" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Squat + Hinge",
          exercises: [
            ...wu("lower"),
            ex("Sumo Squat", 3, 12, 60, { notes: "Bodyweight · wide stance, toes turned out · knees track over the toes" }),
            ex("Banded Good Morning", 3, 12, 60, { notes: "Light band across the traps, not the neck · hinge, don't squat" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · front knee tracks over the toes · torso upright" }),
            ex("Step-Up", 3, 10, 60, { notes: "Each side · drive through the top foot · full hip extension" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Unilateral Burn",
          exercises: [
            ...wu("glutes"),
            ex("Curtsy Lunge", 3, 10, 60, { notes: "Each side · hips stay facing forward · control over speed · weaker side first" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side · sit the hip back, trailing leg straight" }),
            ex("Step-Up", 3, 10, 60, { notes: "Each side · drive through the top heel · don't push off the floor" }),
            ex("Single-Leg Glute Bridge", 3, 8, 45, { notes: "Each side · hips level at the top · start with your weaker side" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Core + Carry",
          exercises: [
            ...wu("core"),
            ex("Plank", 3, 40, 45, { seconds: true, notes: "Breathe steadily · hips level, ribs down" }),
            ex("Dead Bug", 3, 10, 45, { notes: "Lower back pressed down · opposite arm and leg" }),
            ex("Side Plank", 3, 30, 45, { seconds: true, notes: "Each side · hips high and stacked · keep breathing" }),
            exSec("March in Place", 3, 40, 45, "Carry practice · no load yet · ribs down, shoulders back, stay tall"),
            ...cd("core"),
          ],
        },
        {
          title: "Metabolic Finish",
          exercises: [
            ...wu("conditioning"),
            ex("Squat to Calf Raise", 3, 15, 45, { notes: "Squat as deep as you own · finish tall on the toes" }),
            ex("Glute Bridge March", 3, 15, 45, { notes: "Hips level · small steps · no rocking" }),
            ex("Frog Pump", 3, 20, 30, { notes: "Small pulses · burnout pace · glutes only" }),
            ex("Wall Sit", 3, 30, 45, { seconds: true, notes: "Thighs parallel · weight in the heels · breathe steadily" }),
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
          title: "Glute Activation",
          exercises: [
            ...wu("glutes"),
            ex("Glute Bridge", 3, 15, 45, { notes: "Hold week 1 reps · bodyweight · one-second squeeze" }),
            ex("Frog Pump", 3, 20, 45, { notes: "Hold week 1 reps · small pulses, glutes only" }),
            ex("Banded Lateral Walk", 3, 15, 45, { notes: "Hold week 1 reps · light band · constant tension" }),
            ex("Single-Leg Glute Bridge", 3, 8, 45, { notes: "New this week · each side · hips level · weaker side first" }),
            ex("Donkey Kick", 3, 12, 45, { notes: "Each side · hold week 1 reps · ribs down" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Squat + Hinge",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 3, 12, 60, { notes: "New load this week · light dumbbell at your chest · knees track over the toes" }),
            ex("Dumbbell Romanian Deadlift", 3, 10, 60, { notes: "New load this week · light dumbbells · hinge, stop at the first hamstring stretch" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · hold week 1 reps · dumbbells at your sides optional" }),
            ex("Step-Up", 3, 10, 60, { notes: "Each side · hold week 1 reps · add a light dumbbell when bodyweight feels easy" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Unilateral Burn",
          exercises: [
            ...wu("glutes"),
            ex("Curtsy Lunge", 3, 10, 60, { notes: "New load this week · light dumbbell at your chest · hips stay forward" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side · light dumbbell optional · sit the hip back" }),
            ex("Step-Up", 3, 10, 60, { notes: "Each side · light dumbbell optional · drive through the top heel" }),
            ex("Single-Leg Glute Bridge", 3, 8, 45, { notes: "Each side · hold week 1 reps · hips level" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Core + Carry",
          exercises: [
            ...wu("core"),
            ex("Plank", 3, 40, 45, { seconds: true, notes: "Hold week 1 time · breathe steadily · hips level" }),
            ex("Dead Bug", 3, 10, 45, { notes: "Hold week 1 reps · lower back pressed down" }),
            ex("Side Plank", 3, 30, 45, { seconds: true, notes: "Each side · hold week 1 time · hips high" }),
            ex("Bird Dog", 3, 10, 45, { notes: "New this week · each side · pause three seconds at full extension" }),
            exSec("March in Place", 3, 40, 45, "Loaded carry this week · light dumbbell at your chest · ribs down, stay tall"),
            ...cd("core"),
          ],
        },
        {
          title: "Metabolic Finish",
          exercises: [
            ...wu("conditioning"),
            ex("Squat to Calf Raise", 3, 15, 35, { notes: "Rest −10s vs week 1 · finish tall on the toes" }),
            ex("Glute Bridge March", 3, 15, 35, { notes: "Rest −10s vs week 1 · hips level · no rocking" }),
            ex("Frog Pump", 3, 20, 20, { notes: "Rest −10s vs week 1 · burnout pace" }),
            ex("Wall Sit", 3, 30, 35, { seconds: true, notes: "Rest −10s vs week 1 · thighs parallel · breathe steadily" }),
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
          title: "Glute Activation",
          exercises: [
            ...wu("glutes"),
            ex("Glute Bridge", 3, 15, 30, { notes: "Circuit · round-based · one-second squeeze at the top" }),
            ex("Frog Pump", 3, 20, 20, { notes: "Circuit · small pulses · glutes only" }),
            ex("Banded Lateral Walk", 3, 15, 30, { notes: "Circuit · medium band this week · constant tension" }),
            ex("Banded Kickback", 3, 12, 30, { notes: "New this week · each side · medium band · squeeze at full extension" }),
            ex("Donkey Kick", 3, 12, 30, { notes: "Each side · round-based · ribs down" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Squat + Hinge",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 3, 12, 35, { notes: "Circuit · hold week 2 load · knees track over the toes" }),
            ex("Dumbbell Romanian Deadlift", 3, 10, 35, { notes: "Circuit · hold week 2 load · hinge, don't squat" }),
            ex("Banded Good Morning", 3, 12, 35, { notes: "New on this day · medium band across the traps · flat back" }),
            ex("Reverse Lunge", 3, 10, 35, { notes: "Each side · circuit · hold week 1 reps · front knee tracks over the toes" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Unilateral Burn",
          exercises: [
            ...wu("glutes"),
            ex("Curtsy Lunge", 3, 10, 35, { notes: "Circuit · hold week 2 load · hips stay forward · weaker side first" }),
            ex("Lateral Lunge", 3, 10, 35, { notes: "Each side · circuit · sit the hip back" }),
            ex("Step-Up", 3, 10, 35, { notes: "Each side · circuit · drive through the top heel" }),
            ex("Single-Leg Glute Bridge", 3, 8, 30, { notes: "Each side · round-based · hips level" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Core + Carry",
          exercises: [
            ...wu("core"),
            ex("Plank", 3, 40, 30, { seconds: true, notes: "Circuit · round-based · breathe steadily, hips level" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Circuit · lower back pressed down" }),
            ex("Side Plank", 3, 30, 30, { seconds: true, notes: "Each side · circuit · hips high and stacked" }),
            ex("Bird Dog", 3, 10, 30, { notes: "Each side · round-based · three-second pause" }),
            exSec("March in Place", 3, 40, 30, "Loaded carry · light dumbbell at your chest · stay tall, ribs down"),
            ...cd("core"),
          ],
        },
        {
          title: "Metabolic Finish",
          exercises: [
            ...wu("conditioning"),
            ex("Squat to Calf Raise", 3, 15, 30, { notes: "Circuit · round-based · finish tall" }),
            ex("Glute Bridge March", 3, 15, 30, { notes: "Circuit · medium band above the knees · hips level" }),
            ex("Frog Pump", 3, 20, 20, { notes: "Circuit · burnout · small pulses" }),
            ex("Wall Sit", 3, 30, 30, { seconds: true, notes: "Circuit · thighs parallel · breathe in short sips" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },

    // ── Week 4 · Peak & Retest ─────────────────────────────────────────────
    {
      title: "Peak & Retest",
      days: [
        {
          title: "Glute Activation",
          exercises: [
            ...wu("glutes"),
            ex("Glute Bridge", 3, 15, 45, { notes: "Retest · week 1's 15 reps · heaviest band above the knees" }),
            ex("Frog Pump", 3, 20, 45, { notes: "Retest · week 1's 20 reps · small pulses, glutes only" }),
            ex("Banded Lateral Walk", 3, 15, 45, { notes: "Retest · week 1's 15 steps · heaviest band · constant tension" }),
            ex("Banded Kickback", 3, 12, 45, { notes: "Each side · heaviest band · squeeze at full extension" }),
            ex("Donkey Kick", 3, 12, 45, { notes: "Each side · retest · week 1's 12 reps · ribs down" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Squat + Hinge",
          exercises: [
            ...wu("lower"),
            ex("Goblet Squat", 3, 12, 60, { notes: "Retest · week 1's 12 bodyweight reps — now with your heaviest controlled dumbbell" }),
            ex("Dumbbell Romanian Deadlift", 3, 10, 60, { notes: "Retest · heaviest dumbbells you control · stop at the first hamstring stretch" }),
            ex("Banded Good Morning", 3, 12, 60, { notes: "Retest · heaviest band across the traps · hinge, don't squat" }),
            ex("Reverse Lunge", 3, 10, 60, { notes: "Each side · retest · week 1's 10 reps · front knee tracks over the toes" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Unilateral Burn",
          exercises: [
            ...wu("glutes"),
            ex("Curtsy Lunge", 3, 10, 60, { notes: "Retest · week 1's 10 reps · heaviest load you control · weaker side first" }),
            ex("Lateral Lunge", 3, 10, 60, { notes: "Each side · retest · week 1's 10 reps · sit the hip back" }),
            ex("Step-Up", 3, 10, 60, { notes: "Each side · retest · week 1's 10 reps · drive through the top heel" }),
            ex("Single-Leg Glute Bridge", 3, 8, 45, { notes: "Each side · retest · week 1's 8 reps · hips level" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Core + Carry",
          exercises: [
            ...wu("core"),
            ex("Plank", 3, 45, 45, { seconds: true, notes: "Retest · beat week 1's 40s · breathe steadily, hips level" }),
            ex("Dead Bug", 3, 10, 45, { notes: "Retest · week 1's 10 reps · lower back pressed down" }),
            ex("Side Plank", 3, 30, 45, { seconds: true, notes: "Retest · week 1's 30s each side · hips high" }),
            ex("Bird Dog", 3, 10, 45, { notes: "Each side · three-second pause · hips stay level" }),
            exSec("March in Place", 3, 40, 45, "Retest · heaviest dumbbell at your chest · ribs down, stay tall"),
            ...cd("core"),
          ],
        },
        {
          title: "Metabolic Finish",
          exercises: [
            ...wu("conditioning"),
            ex("Squat to Calf Raise", 3, 15, 45, { notes: "Retest · week 1's 15 reps · finish tall" }),
            ex("Glute Bridge March", 3, 15, 45, { notes: "Retest · week 1's 15 reps · heaviest band above the knees" }),
            ex("Frog Pump", 3, 20, 30, { notes: "Retest · week 1's 20 reps · finish fresh, not destroyed" }),
            ex("Wall Sit", 3, 30, 45, { seconds: true, notes: "Retest · week 1's 30s · thighs parallel, weight in the heels" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },
  ],
};

export default BP09;
