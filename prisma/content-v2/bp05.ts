import type { ProgramV2 } from "./types";
import { cd, ex, exSec, wu } from "./warmup";

/**
 * BP-05 · 4-Week Resistance Band Full Body Sculpt (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 4 weeks × 5 days · band-only full-body circuit conditioning with a strength
 * emphasis (R1 local-muscular-endurance zone: >15 reps, rest <90s; R6 bands
 * match dumbbells for strength when effort is matched). Every session is
 * full-body and round-based: `sets` = rounds.
 * Progression rule (never two in a week): band resistance → reps → rounds.
 * Intensity is prescribed by effort in `notes`, never by kilograms.
 * Four weeks is too short for a deload, so week 4 consolidates and retests.
 * Band levels are named light / medium / heavy everywhere they appear.
 */

export const BP05: ProgramV2 = {
  slug: "4-week-resistance-band-full-body-sculpt",
  title: "4-Week Resistance Band Full Body Sculpt",
  weeks: [
    // ── Week 1 · Foundation ────────────────────────────────────────────────
    {
      title: "Foundation",
      days: [
        {
          title: "Upper Body Band",
          exercises: [
            ...wu("upper"),
            ex("Seated Band Row", 2, 15, 45, { notes: "Round-based · medium band · squeeze the shoulder blades, no shrugging" }),
            ex("Push-Up", 2, 12, 45, { notes: "Round-based · body in one line · or incline push-up on a bench" }),
            ex("Pike Push-Up", 2, 10, 45, { notes: "Round-based · hips high · elbows out at 45° · or incline push-up" }),
            ex("Band Pull-Apart", 2, 15, 45, { notes: "Round-based · medium band · arms straight · posture, slow" }),
            ex("Band Tricep Extension", 2, 12, 45, { notes: "Round-based · elbows pinned · constant tension, never let it go slack" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Lower Body Band",
          exercises: [
            ...wu("lower"),
            ex("Banded Good Morning", 2, 12, 45, { notes: "Round-based · medium band across the traps, not the neck · hinge, don't squat" }),
            ex("Sumo Squat", 2, 15, 45, { notes: "Round-based · bodyweight · wide stance · knees track over the toes" }),
            ex("Reverse Lunge", 2, 12, 45, { notes: "Each side · round-based · front knee tracks over the toes · torso upright" }),
            ex("Glute Bridge", 2, 15, 45, { notes: "Round-based · band above the knees · drive through the heels" }),
            ex("Banded Lateral Walk", 2, 20, 45, { notes: "Round-based · medium band · stay in your quarter squat · constant tension" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body Band",
          exercises: [
            ...wu("conditioning"),
            ex("Seated Band Row", 2, 15, 45, { notes: "Round-based · medium band · pull to the ribs" }),
            ex("Push-Up", 2, 12, 45, { notes: "Round-based · body in one line · or incline push-up" }),
            ex("Banded Good Morning", 2, 12, 45, { notes: "Round-based · band on the traps · flat back throughout" }),
            ex("Squat to Calf Raise", 2, 15, 45, { notes: "Round-based · squat as deep as you own · finish tall on the toes" }),
            ex("Band Bicep Curl", 2, 15, 45, { notes: "Round-based · medium band · elbows pinned · full range both directions" }),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Core + Carry",
          exercises: [
            ...wu("core"),
            ex("Band Pallof Press", 2, 12, 45, { notes: "Each side · round-based · medium band · resist the twist, ribs down" }),
            ex("Plank", 2, 40, 45, { seconds: true, notes: "Round-based · breathe steadily · hips level, ribs down" }),
            ex("Superman", 2, 12, 45, { notes: "Round-based · squeeze the upper back · lift chest and thighs, no cranking the neck" }),
            ex("Russian Twist", 2, 16, 45, { notes: "8 each side · round-based · rotate from the ribs, not the arms" }),
            exSec("March in Place", 2, 40, 45, "Loaded carry · hold the band at shoulder height with constant tension · stay tall"),
            ...cd("core"),
          ],
        },
        {
          title: "Band Burnout",
          exercises: [
            ...wu("conditioning"),
            ex("Banded Lateral Walk", 2, 20, 30, { notes: "Short rest · medium band · keep the tension the whole time" }),
            ex("Glute Bridge", 2, 20, 30, { notes: "Short rest · band above the knees · continuous rhythm" }),
            ex("Clamshell", 2, 15, 30, { notes: "Each side · short rest · hips stacked · controlled both directions" }),
            ex("Band Pull-Apart", 2, 15, 30, { notes: "Short rest · arms straight · posture" }),
            ex("Band Bicep Curl", 2, 15, 30, { notes: "Short rest · finish the last rep with about 2 in reserve" }),
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
          title: "Upper Body Band",
          exercises: [
            ...wu("upper"),
            ex("Seated Band Row", 3, 15, 35, { notes: "3 rounds (was 2) · medium band · same resistance as week 1" }),
            ex("Push-Up", 3, 12, 35, { notes: "Round-based · rest −10s vs week 1 · body in one line" }),
            ex("Pike Push-Up", 3, 10, 35, { notes: "Round-based · hips high · elbows out at 45°" }),
            ex("Band Pull-Apart", 3, 15, 35, { notes: "Round-based · arms straight · slow and controlled" }),
            ex("Band Tricep Extension", 3, 12, 35, { notes: "Round-based · elbows pinned · constant tension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Lower Body Band",
          exercises: [
            ...wu("lower"),
            ex("Banded Good Morning", 3, 12, 35, { notes: "3 rounds (was 2) · medium band · hinge, don't squat" }),
            ex("Sumo Squat", 3, 15, 35, { notes: "Round-based · rest −10s vs week 1 · knees track over the toes" }),
            ex("Reverse Lunge", 3, 12, 35, { notes: "Each side · round-based · front knee tracks over the toes" }),
            ex("Glute Bridge", 3, 15, 35, { notes: "Round-based · band above the knees · one-second squeeze" }),
            ex("Banded Lateral Walk", 3, 20, 35, { notes: "Round-based · constant tension · quarter squat stays low" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body Band",
          exercises: [
            ...wu("conditioning"),
            ex("Seated Band Row", 3, 15, 35, { notes: "3 rounds (was 2) · medium band · pull to the ribs" }),
            ex("Push-Up", 3, 12, 35, { notes: "Round-based · rest −10s vs week 1 · body in one line" }),
            ex("Banded Good Morning", 3, 12, 35, { notes: "Round-based · flat back · band on the traps" }),
            ex("Squat to Calf Raise", 3, 15, 35, { notes: "Round-based · finish tall on the toes" }),
            ex("Band Bicep Curl", 3, 15, 35, { notes: "Round-based · elbows pinned · no swinging" }),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Core + Carry",
          exercises: [
            ...wu("core"),
            ex("Band Pallof Press", 3, 12, 35, { notes: "Each side · 3 rounds (was 2) · resist the twist" }),
            ex("Plank", 3, 40, 35, { seconds: true, notes: "Round-based · rest −10s vs week 1 · breathe steadily" }),
            ex("Superman", 3, 12, 35, { notes: "Round-based · squeeze the upper back" }),
            ex("Russian Twist", 3, 16, 35, { notes: "8 each side · round-based · rotate from the ribs" }),
            exSec("March in Place", 3, 40, 35, "Loaded carry · band at shoulder height, constant tension · stay tall"),
            ...cd("core"),
          ],
        },
        {
          title: "Band Burnout",
          exercises: [
            ...wu("conditioning"),
            ex("Banded Lateral Walk", 3, 20, 25, { notes: "3 rounds (was 2) · rest −5s vs week 1 · constant tension" }),
            ex("Glute Bridge", 3, 20, 25, { notes: "Round-based · continuous rhythm · no pausing at the floor" }),
            ex("Clamshell", 3, 15, 25, { notes: "Each side · controlled both directions" }),
            ex("Band Pull-Apart", 3, 15, 25, { notes: "Round-based · arms straight · posture" }),
            ex("Band Bicep Curl", 3, 15, 25, { notes: "Round-based · last rep with about 2 in reserve" }),
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
          title: "Upper Body Band",
          exercises: [
            ...wu("upper"),
            ex("Seated Band Row", 3, 17, 35, { notes: "+2 reps vs week 2 · medium band · squeeze the shoulder blades" }),
            ex("Push-Up", 3, 14, 35, { notes: "+2 reps vs week 2 · body in one line · or incline push-up" }),
            ex("Pike Push-Up", 3, 10, 35, { notes: "Hold week 2 reps · hips high · quality over speed" }),
            ex("Band Pull-Apart", 3, 15, 35, { notes: "Hold week 2 reps · arms straight" }),
            ex("Band Tricep Extension", 3, 12, 35, { notes: "Hold week 2 reps · elbows pinned · constant tension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Lower Body Band",
          exercises: [
            ...wu("lower"),
            ex("Banded Good Morning", 3, 14, 35, { notes: "+2 reps vs week 2 · hinge, don't squat" }),
            ex("Sumo Squat", 3, 17, 35, { notes: "+2 reps vs week 2 · knees track over the toes" }),
            ex("Reverse Lunge", 3, 12, 35, { notes: "Each side · hold week 2 reps · front knee tracks over the toes" }),
            ex("Glute Bridge", 3, 15, 35, { notes: "Hold week 2 reps · one-second squeeze" }),
            ex("Banded Lateral Walk", 3, 20, 35, { notes: "Hold week 2 reps · constant tension" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body Band",
          exercises: [
            ...wu("conditioning"),
            ex("Seated Band Row", 4, 15, 35, { notes: "4 rounds (was 3) · medium band · pull to the ribs" }),
            ex("Push-Up", 4, 12, 35, { notes: "4 rounds · body in one line" }),
            ex("Banded Good Morning", 4, 12, 35, { notes: "4 rounds · flat back · band on the traps" }),
            ex("Squat to Calf Raise", 4, 15, 35, { notes: "4 rounds · finish tall on the toes" }),
            ex("Band Bicep Curl", 4, 15, 35, { notes: "4 rounds · elbows pinned · no swinging" }),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Core + Carry",
          exercises: [
            ...wu("core"),
            ex("Band Pallof Press", 3, 14, 35, { notes: "Each side · +2 reps vs week 2 · resist the twist" }),
            ex("Plank", 3, 45, 35, { seconds: true, notes: "+5s vs week 2 · breathe steadily · hips level" }),
            ex("Superman", 3, 14, 35, { notes: "+2 reps vs week 2 · squeeze the upper back" }),
            ex("Russian Twist", 3, 16, 35, { notes: "8 each side · hold week 2 reps · rotate from the ribs" }),
            exSec("March in Place", 3, 45, 35, "Loaded carry · +5s vs week 2 · band at shoulder height, stay tall"),
            ...cd("core"),
          ],
        },
        {
          title: "Band Burnout",
          exercises: [
            ...wu("conditioning"),
            ex("Banded Lateral Walk", 4, 20, 25, { notes: "4 rounds (was 3) · constant tension · quarter squat low" }),
            ex("Glute Bridge", 4, 20, 25, { notes: "4 rounds · continuous rhythm" }),
            ex("Clamshell", 4, 15, 25, { notes: "Each side · hips stacked · controlled both directions" }),
            ex("Band Pull-Apart", 4, 15, 25, { notes: "4 rounds · arms straight · posture" }),
            ex("Band Bicep Curl", 4, 15, 25, { notes: "4 rounds · last rep with about 2 in reserve" }),
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
          title: "Upper Body Band",
          exercises: [
            ...wu("upper"),
            ex("Seated Band Row", 4, 15, 45, { notes: "Retest · week 1's 15 reps at your heaviest band · finish with 1–2 in reserve" }),
            ex("Push-Up", 4, 12, 45, { notes: "Retest · week 1's 12 reps · body in one line" }),
            ex("Pike Push-Up", 4, 10, 45, { notes: "Retest · week 1's 10 reps · hips high" }),
            ex("Band Pull-Apart", 4, 15, 45, { notes: "Retest · week 1's 15 reps · heaviest band you own" }),
            ex("Band Tricep Extension", 4, 12, 45, { notes: "Retest · week 1's 12 reps · elbows pinned, constant tension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Lower Body Band",
          exercises: [
            ...wu("lower"),
            ex("Banded Good Morning", 4, 12, 45, { notes: "Retest · week 1's 12 reps at your heaviest band · hinge, don't squat" }),
            ex("Sumo Squat", 4, 15, 45, { notes: "Retest · week 1's 15 reps · knees track over the toes" }),
            ex("Reverse Lunge", 4, 12, 45, { notes: "Each side · retest · week 1's 12 reps · front knee tracks over the toes" }),
            ex("Glute Bridge", 4, 15, 45, { notes: "Retest · week 1's 15 reps · heaviest band above the knees" }),
            ex("Banded Lateral Walk", 4, 20, 45, { notes: "Retest · week 1's 20 steps · constant tension the whole way" }),
            ...cd("lower"),
          ],
        },
        {
          title: "Full Body Band",
          exercises: [
            ...wu("conditioning"),
            ex("Seated Band Row", 4, 15, 45, { notes: "Retest · week 1's 15 reps at your heaviest band" }),
            ex("Push-Up", 4, 12, 45, { notes: "Retest · week 1's 12 reps · body in one line" }),
            ex("Banded Good Morning", 4, 12, 45, { notes: "Retest · week 1's 12 reps · flat back" }),
            ex("Squat to Calf Raise", 4, 15, 45, { notes: "Retest · week 1's 15 reps · finish tall" }),
            ex("Band Bicep Curl", 4, 15, 45, { notes: "Retest · week 1's 15 reps · heaviest band, no swinging" }),
            ...cd("conditioning"),
          ],
        },
        {
          title: "Core + Carry",
          exercises: [
            ...wu("core"),
            ex("Band Pallof Press", 4, 12, 45, { notes: "Each side · retest · week 1's 12 reps at your heaviest band" }),
            ex("Plank", 4, 40, 45, { seconds: true, notes: "Retest · week 1's 40s · breathe steadily, hips level" }),
            ex("Superman", 4, 12, 45, { notes: "Retest · week 1's 12 reps · squeeze the upper back" }),
            ex("Russian Twist", 4, 16, 45, { notes: "8 each side · retest · week 1's 16 reps · rotate from the ribs" }),
            exSec("March in Place", 4, 40, 45, "Loaded carry · retest · week 1's 40s · heaviest band at your chest, stay tall"),
            ...cd("core"),
          ],
        },
        {
          title: "Band Burnout",
          exercises: [
            ...wu("conditioning"),
            ex("Banded Lateral Walk", 4, 20, 30, { notes: "Retest · week 1's 20 steps · heaviest band · constant tension" }),
            ex("Glute Bridge", 4, 20, 30, { notes: "Retest · week 1's 20 reps · continuous rhythm" }),
            ex("Clamshell", 4, 15, 30, { notes: "Each side · retest · week 1's 15 reps · controlled both directions" }),
            ex("Band Pull-Apart", 4, 15, 30, { notes: "Retest · week 1's 15 reps · arms straight" }),
            ex("Band Bicep Curl", 4, 15, 30, { notes: "Retest · week 1's 15 reps · finish fresh, not destroyed" }),
            ...cd("conditioning"),
          ],
        },
      ],
    },
  ],
};

export default BP05;
