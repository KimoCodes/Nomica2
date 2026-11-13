import type { ProgramV2 } from "./types";
import { cd, ex, wu } from "./warmup";

/**
 * BP-01 · 21-Day Booty Band Challenge (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 3 weeks × 5 days. Motor-patterning and activation — not a hypertrophy block.
 * Every session: 3 warm-up rows + 4–5 main + 2 cooldown rows.
 */

export const BP01: ProgramV2 = {
  slug: "21-day-booty-band-challenge",
  title: "21-Day Booty Band Challenge",
  weeks: [
    // ── Week 1 · Foundation ────────────────────────────────────────────────
    {
      title: "Foundation — learn the five patterns",
      days: [
        {
          title: "Band Activation",
          exercises: [
            ...wu("glutes"),
            ex("Banded Lateral Walk", 3, 15, 45, { notes: "Tempo 3-1-1 · band above knees · stay in your quarter squat" }),
            ex("Glute Bridge", 3, 15, 45, { notes: "Tempo 3-1-1 · drive through the heels" }),
            ex("Clamshell", 3, 12, 30, { notes: "Each side · hips stacked · feet together" }),
            ex("Donkey Kick", 3, 12, 30, { notes: "Each side · ribs down, heel to the ceiling" }),
            ex("Fire Hydrant", 3, 12, 30, { notes: "Each side · no rotating through the hips" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Band Strength",
          exercises: [
            ...wu("glutes"),
            ex("Sumo Squat", 4, 12, 60, { notes: "Tempo 3-1-1 · knees track over the toes" }),
            ex("Banded Good Morning", 3, 12, 60, { notes: "Hinge, don't squat · flat back throughout" }),
            ex("Glute Bridge March", 3, 12, 45, { notes: "Hips level · small steps only" }),
            ex("Banded Lateral Walk", 3, 12, 30, { notes: "Constant tension on the band" }),
            ex("Banded Kickback", 3, 12, 30, { notes: "Each side · squeeze at full extension" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Glute Burn",
          exercises: [
            ...wu("glutes"),
            ex("Frog Pump", 3, 20, 30, { notes: "Small, controlled pulses · soles together" }),
            ex("Single-Leg Glute Bridge", 3, 10, 45, { notes: "Each side · keep the hips level" }),
            ex("Curtsy Lunge", 3, 10, 45, { notes: "Alternating · hips stay facing forward" }),
            ex("Donkey Kick", 3, 15, 30, { notes: "Each side · slower than week 1 pace" }),
            ex("Fire Hydrant", 3, 15, 30, { notes: "Each side · no rotating through the hips" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Core + Glutes",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 3, 10, 45, { notes: "Lower back pressed down · opposite arm and leg" }),
            ex("Bird Dog", 3, 10, 45, { notes: "Each side · pause at full extension" }),
            ex("Glute Bridge", 3, 15, 30, { notes: "Squeeze hard for one second at the top" }),
            ex("Plank", 3, 40, 30, { seconds: true, notes: "Breathe steadily · hips level" }),
            ex("Side Plank", 3, 30, 30, { seconds: true, notes: "Each side · hips high and stacked" }),
            ...cd("core"),
          ],
        },
        {
          title: "Band Finisher",
          exercises: [
            ...wu("glutes"),
            ex("Banded Lateral Walk", 3, 20, 30, { notes: "Short rest · keep the tension" }),
            ex("Glute Bridge", 3, 20, 30, { notes: "Continuous rhythm · no pausing at the floor" }),
            ex("Frog Pump", 3, 20, 20, { notes: "Burnout set · small range" }),
            ex("Clamshell", 3, 15, 30, { notes: "Each side · controlled both directions" }),
            ...cd("glutes"),
          ],
        },
      ],
    },

    // ── Week 2 · Build ─────────────────────────────────────────────────────
    {
      title: "Build — same patterns, less rest",
      days: [
        {
          title: "Band Activation",
          exercises: [
            ...wu("glutes"),
            ex("Banded Lateral Walk", 3, 17, 35, { notes: "+2 reps vs week 1 · stay in your quarter squat" }),
            ex("Glute Bridge", 3, 17, 35, { notes: "+2 reps vs week 1 · drive through the heels" }),
            ex("Single-Leg Glute Bridge", 3, 8, 45, { notes: "Each side · new this week · hips level" }),
            ex("Clamshell", 3, 12, 30, { notes: "Each side · hips stacked" }),
            ex("Donkey Kick", 3, 12, 30, { notes: "Each side · ribs down" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Band Strength",
          exercises: [
            ...wu("glutes"),
            ex("Sumo Squat", 4, 14, 50, { notes: "+2 reps vs week 1 · knees track over the toes" }),
            ex("Banded Good Morning", 3, 14, 50, { notes: "+2 reps vs week 1 · hinge, don't squat" }),
            ex("Curtsy Lunge", 3, 10, 35, { notes: "Each side · new this week · hips forward" }),
            ex("Banded Lateral Walk", 3, 14, 20, { notes: "Rest cut by 10s · constant tension" }),
            ex("Banded Kickback", 3, 12, 20, { notes: "Each side · rest cut by 10s" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Glute Burn",
          exercises: [
            ...wu("glutes"),
            ex("Frog Pump", 3, 22, 30, { notes: "+2 reps vs week 1 · small pulses" }),
            ex("Single-Leg Glute Bridge", 3, 12, 40, { notes: "Each side · +2 reps vs week 1" }),
            ex("Curtsy Lunge", 3, 12, 40, { notes: "Alternating · +2 reps vs week 1" }),
            ex("Glute Bridge March", 3, 12, 30, { notes: "New this week · hips level" }),
            ex("Fire Hydrant", 3, 15, 20, { notes: "Each side · rest cut by 10s" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Core + Glutes",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 3, 12, 40, { notes: "+2 reps vs week 1 · lower back pressed down" }),
            ex("Bird Dog", 3, 12, 40, { notes: "Each side · +2 reps · pause at extension" }),
            ex("Glute Bridge March", 3, 14, 30, { notes: "New this week · no hip drop" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "+5s vs week 1 · keep breathing" }),
            ex("Side Plank", 3, 35, 30, { seconds: true, notes: "Each side · +5s · hips high" }),
            ...cd("core"),
          ],
        },
        {
          title: "Band Finisher",
          exercises: [
            ...wu("glutes"),
            ex("Banded Lateral Walk", 3, 22, 25, { notes: "+2 reps · rest cut by 5s" }),
            ex("Glute Bridge", 3, 22, 25, { notes: "+2 reps · continuous rhythm" }),
            ex("Frog Pump", 3, 22, 20, { notes: "+2 reps · burnout" }),
            ex("Banded Kickback", 3, 12, 25, { notes: "Each side · new on this day · squeeze at the top" }),
            ...cd("glutes"),
          ],
        },
      ],
    },

    // ── Week 3 · Express ───────────────────────────────────────────────────
    {
      title: "Express — density and independence",
      days: [
        {
          title: "Band Activation",
          exercises: [
            ...wu("glutes"),
            ex("Banded Lateral Walk", 4, 17, 35, { notes: "+1 set vs week 2 · quarter squat stays low" }),
            ex("Glute Bridge", 4, 17, 35, { notes: "+1 set vs week 2 · one-second squeeze" }),
            ex("Lateral Lunge", 3, 10, 40, { notes: "Each side · new this week · sit the hip back" }),
            ex("Single-Leg Glute Bridge", 3, 10, 40, { notes: "Each side · +2 reps vs week 2" }),
            ex("Clamshell", 3, 14, 25, { notes: "Each side · controlled both directions" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Band Strength",
          exercises: [
            ...wu("glutes"),
            ex("Sumo Squat", 4, 14, 50, { notes: "Hold week 2 reps · quality over speed" }),
            ex("Banded Good Morning", 4, 14, 50, { notes: "+1 set vs week 2 · hinge, don't squat" }),
            ex("Curtsy Lunge", 3, 12, 35, { notes: "Each side · rest cut by 5s" }),
            ex("Frog Pump", 3, 22, 20, { notes: "New on this day · burnout pace" }),
            ex("Banded Kickback", 3, 14, 25, { notes: "Each side · +2 reps vs week 2" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Glute Burn",
          exercises: [
            ...wu("glutes"),
            ex("Frog Pump", 4, 22, 25, { notes: "+1 set vs week 2 · keep the range small" }),
            ex("Single-Leg Glute Bridge", 3, 12, 35, { notes: "Each side · +2 reps vs week 2" }),
            ex("Curtsy Lunge", 3, 12, 35, { notes: "Alternating · hips stay forward" }),
            ex("Glute Bridge March", 3, 14, 25, { notes: "Rest cut by 5s · no hip drop" }),
            ex("Fire Hydrant", 3, 17, 20, { notes: "Each side · +2 reps · rest cut by 10s" }),
            ...cd("glutes"),
          ],
        },
        {
          title: "Core + Glutes",
          exercises: [
            ...wu("core"),
            ex("Dead Bug", 3, 12, 40, { notes: "Hold week 2 reps · lower back pressed down" }),
            ex("Bird Dog", 3, 12, 35, { notes: "Each side · three-second pause" }),
            ex("Glute Bridge March", 3, 16, 25, { notes: "+2 reps vs week 2 · hips level" }),
            ex("Plank", 3, 50, 25, { seconds: true, notes: "+5s vs week 2 · breathe steadily" }),
            ex("Side Plank", 3, 40, 25, { seconds: true, notes: "Each side · +5s · hips high" }),
            ...cd("core"),
          ],
        },
        {
          title: "Band Finisher",
          exercises: [
            ...wu("glutes"),
            ex("Glute Bridge", 4, 15, 40, { notes: "Technique focus · three seconds up, one down" }),
            ex("Banded Lateral Walk", 3, 20, 30, { notes: "Controlled, not rushed" }),
            ex("Clamshell", 3, 15, 30, { notes: "Each side · full range both directions" }),
            ex("Frog Pump", 2, 20, 30, { notes: "Easy set · finish fresh, not destroyed" }),
            ...cd("glutes"),
          ],
        },
      ],
    },
  ],
};

export default BP01;
