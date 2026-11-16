import { Difficulty, ProductFocus, ProductKind } from "@prisma/client";
import type { ProductCopy } from "./types";

/**
 * Final storefront copy for every NomiTips-owned product (Phase 2).
 *
 * - `tagline` and `features` are pre-purchase copy (public product page).
 * - `description` is the full program introduction (owned-program page).
 * - No "video demonstrations" claims: every program ships written form cues.
 *
 * Products owned by coach@nomitips.com (30-Day Low-Impact Cardio Burn,
 * 14-Day Tabata) and stripe-payment-test are intentionally NOT listed here.
 */

export const PRODUCT_COPY: ProductCopy[] = [
  // ── BP-01 ────────────────────────────────────────────────────────────────
  {
    slug: "21-day-booty-band-challenge",
    name: "21-Day Booty Band Challenge",
    kind: ProductKind.CHALLENGE,
    tagline:
      "Three weeks of short band sessions that wake up your glutes and master five foundational patterns.",
    description: `What this is: a 3-week, 5-day activation challenge that teaches your glutes to fire and rehearses five patterns — lateral walk, bridge, hinge, abduction and lunge.

Who it's for: beginners and anyone returning after a break who wants a technique base before loading. No gym needed.

What you need: one loop resistance band (a long band with handles works too) and space to lie down.

How it runs: sessions take about 22 minutes. Week 1 learns the patterns, week 2 adds reps and shortens rest, week 3 adds density and new movements. Every session opens with a warm-up and closes with a stretch — do both.

What you'll learn: the five patterns, how to feel your glutes work, and how to pace a circuit.

Safety: this is general fitness education, not rehabilitation. Sharp or pinching pain is a stop signal — if you have hip, knee or back pain, see a qualified professional first.`,
    features: [
      "Short band sessions — about 22 minutes each",
      "Week-by-week progression: technique, reps, then density",
      "Warm-up and cooldown built into every session",
      "Written form cues for every exercise",
    ],
    equipment: ["Resistance band"],
    priceCents: 999,
    durationLabel: "21 days",
    durationDays: 21,
    durationWeeks: null,
    daysPerWeek: 5,
    focus: ProductFocus.SCULPT,
    difficulty: Difficulty.BEGINNER,
    sortOrder: 1,
  },

  // ── BP-O1 (orphan product, Program row to be created) ───────────────────
  {
    slug: "6-week-dumbbell-glute-growth",
    name: "6-Week Dumbbell Glute Growth",
    kind: ProductKind.PROGRAM,
    tagline:
      "Six weeks of dumbbell-only glute training you can do at home — no barbell, no rack.",
    description: `What this is: six weeks of dumbbell-only lower-body hypertrophy — four glute-focused sessions and one upper-body maintenance session each week.

Who it's for: beginners to intermediate lifters training at home or in the gym who want stronger glutes without a barbell.

What you need: a pair of dumbbells (adjustables are ideal) and a bench or sturdy sofa edge for hip thrusts — optional.

How it runs: week 1 Foundation, week 2 Build, week 3 Volume, week 4 Deload (same exercises, about 40% fewer sets so you absorb the work), week 5 Intensify, week 6 Peak and retest. Sessions take about 42 minutes.

Progression: one variable advances per week — reps, then sets, then load. Add 2–10% when you beat the target by 1–2 reps.

Safety: hinge with a neutral spine, keep the dumbbells close to your legs, and don't train to failure on split squats when you're training alone.`,
    features: [
      "Dumbbell-only glute training — no barbell or rack needed",
      "Four glute sessions plus one upper-body day each week",
      "Planned deload in week 4, test in week 6",
      "Written form cues for every exercise",
    ],
    equipment: ["Dumbbells"],
    priceCents: 1999,
    durationLabel: "6 weeks",
    durationWeeks: 6,
    durationDays: null,
    daysPerWeek: 5,
    focus: null,
    difficulty: Difficulty.INTERMEDIATE,
    sortOrder: 2,
  },

  // ── BP-02 ────────────────────────────────────────────────────────────────
  {
    slug: "8-week-glutes-and-quads-growth-blueprint",
    name: "8 Weeks Glutes & Quads Growth Blueprint",
    kind: ProductKind.PROGRAM,
    tagline:
      "Eight weeks of lower-body hypertrophy: heavy days, volume days and a planned deload, built around the glutes.",
    description: `What this is: an 8-week lower-body hypertrophy block with upper-body maintenance. Glutes are trained directly four days out of five; the upper session keeps the rest of you balanced.

Who it's for: intermediate lifters with squat, hinge and thrust technique already in place.

What you need: a barbell and rack, dumbbells, and a bench. Dumbbell substitutions are listed for every barbell movement, so a home setup works too.

How it runs: five distinct session roles — heavy strength, hypertrophy volume, upper maintenance, posterior chain, and a high-rep glute finisher. Week 4 is a planned deload (same exercises, ~40% fewer sets), week 8 is a consolidation rather than a peak, so you finish capable, not destroyed.

Progression: one variable per week — reps, sets, then load. Add 2–10% when you beat the target by 1–2 reps.

Safety: hips, not your lower back, do the work on thrusts and RDLs; stop each hinge at the first hamstring stretch. Sharp pain is a stop signal — this is not a rehab program.`,
    features: [
      "Five distinct session roles: strength, volume, upper, posterior, peak",
      "Planned deload week 4 and consolidation week 8",
      "Barbell, dumbbell and bench exercises with home substitutions",
      "Written form cues for every exercise",
    ],
    equipment: ["Dumbbells", "Barbell", "Bench"],
    priceCents: 2999,
    durationLabel: "8 weeks",
    durationWeeks: 8,
    durationDays: null,
    daysPerWeek: 5,
    focus: null,
    difficulty: Difficulty.INTERMEDIATE,
    sortOrder: 3,
  },

  // ── BP-O2 (orphan product, Program row to be created) ───────────────────
  {
    slug: "6-week-glutes-and-quads-builder",
    name: "6-Week Glutes & Quads Builder",
    kind: ProductKind.PROGRAM,
    tagline:
      "Six weeks of balanced lower-body training that builds the glutes and quads together.",
    description: `What this is: six weeks of balanced lower-body hypertrophy with quad-emphasis and glute-emphasis days alternating all week, plus an upper-maintenance session and a carry/conditioning day.

Who it's for: beginners to intermediate lifters who want balanced legs — not glutes alone.

What you need: dumbbells. A leg press is a bonus, not a requirement: every machine movement has a dumbbell substitute listed in the workout.

How it runs: week 1 Foundation, week 2 Build, week 3 Volume, week 4 Deload, week 5 Intensify, week 6 Peak. Sessions take about 42 minutes.

Progression: one variable per week — reps, then sets, then load. Add 2–10% when you beat the target by 1–2 reps. Unilateral work always starts with your weaker side.

Safety: set the leg press seat so your knees reach about 90° and never lock out hard at the top; hinge with a neutral spine on every RDL.`,
    features: [
      "Balanced quad- and glute-emphasis days, alternating all week",
      "Leg press optional — dumbbell substitutes included",
      "Planned deload week 4, test week 6",
      "Written form cues for every exercise",
    ],
    equipment: ["Dumbbells", "Leg press machine (optional)"],
    priceCents: 1999,
    durationLabel: "6 weeks",
    durationWeeks: 6,
    durationDays: null,
    daysPerWeek: 5,
    focus: null,
    difficulty: Difficulty.INTERMEDIATE,
    sortOrder: 4,
  },

  // ── BP-03 ────────────────────────────────────────────────────────────────
  {
    slug: "21-day-strong-abs-and-core-challenge",
    name: "21-Day Strong Abs & Core Challenge",
    kind: ProductKind.CHALLENGE,
    tagline:
      "Three weeks of short core sessions that teach you to brace, resist and control — not just crunch.",
    description: `What this is: a 3-week, 5-day trunk training challenge built on four movement categories — anti-extension (hold a plank against sag), anti-rotation (resist a twist), lateral control, and dynamic flexion. Each session takes one category as primary and one as secondary, and a compound movement keeps your trunk working under real load.

Who it's for: beginners who want control and posture, not a six-week ab transformation.

What you need: an exercise mat (carpet works). Week 3 adds an optional light dumbbell and band.

How it runs: sessions take 15–20 minutes. Week 1 learns to brace with isometrics, week 2 adds motion, week 3 integrates everything into circuits and carries.

Safety: hands behind the head stay light — curl from the sternum, never yank the neck. Exhale on effort. This is not treatment for back pain, hernia or diastasis recti: those need a clinician.`,
    features: [
      "Short core sessions — about 18 minutes each",
      "Four core categories trained in rotation: brace, resist, side, move",
      "Compound pairings so your trunk works under load",
      "Written form cues for every exercise",
    ],
    equipment: ["Exercise mat"],
    priceCents: 999,
    durationLabel: "21 days",
    durationDays: 21,
    durationWeeks: null,
    daysPerWeek: 5,
    focus: ProductFocus.SCULPT,
    difficulty: Difficulty.BEGINNER,
    sortOrder: 5,
  },

  // ── BP-04 ────────────────────────────────────────────────────────────────
  {
    slug: "6-week-full-body-dumbbell-sculpt",
    name: "6-Week Full Body Dumbbell Sculpt",
    kind: ProductKind.PROGRAM,
    tagline:
      "Six weeks, five sessions a week, one pair of dumbbells — strength and sculpting for the whole body.",
    description: `What this is: full-body strength-endurance with dumbbells. All six movement patterns — squat, hinge, push, pull, lunge and carry — appear twice each week across five sessions with different densities.

Who it's for: intermediate lifters who want to train the whole body without a split routine.

What you need: one pair of dumbbells (adjustables are ideal). A bench is optional.

How it runs: days 1–2 are pattern-paired strength days, days 3–4 are full-body accumulation days in different rep zones, and day 5 is low-load conditioning so your week always ends with a session that doesn't need fresh legs. Week 4 is a planned deload; week 6 ends with a strength test.

Progression: one variable per week — reps, then sets, then load. The conditioning day progresses by shorter rest, never by heavier load.

Safety: hinge with a neutral spine, pin your shoulder blades when pressing, and control every eccentric — dumbbells are never dropped from the top.`,
    features: [
      "All six movement patterns trained twice each week",
      "One pair of dumbbells covers every session",
      "Planned deload week 4, strength test in week 6",
      "Written form cues for every exercise",
    ],
    equipment: ["Dumbbells"],
    priceCents: 1999,
    durationLabel: "6 weeks",
    durationWeeks: 6,
    durationDays: null,
    daysPerWeek: 5,
    focus: null,
    difficulty: Difficulty.INTERMEDIATE,
    sortOrder: 6,
  },

  // ── BP-05 ────────────────────────────────────────────────────────────────
  {
    slug: "4-week-resistance-band-full-body-sculpt",
    name: "4-Week Resistance Band Full Body Sculpt",
    kind: ProductKind.PROGRAM,
    tagline:
      "Four weeks of full-body circuits with a single resistance band — strength and conditioning anywhere.",
    description: `What this is: band-only full-body circuit training. Every session trains the whole body, rest is short, and sessions are built from rounds rather than straight sets — local-muscular-endurance work in the truest sense.

Who it's for: beginners who want to get stronger with one piece of equipment, at home or travelling.

What you need: one loop band; a long band with handles is better. Everything else is bodyweight.

How it runs: week 1 learns every anchor and position with 2-round circuits, week 2 goes to 3 rounds with shorter rest, week 3 adds reps, week 4 runs the strongest band for 4 rounds and retests your week-1 numbers.

Progression — and the rule we never break: band resistance, then reps, then rounds. Never two at once. Intensity is judged by effort — finish your last rep with about 2 in reserve.

Safety: inspect the band for nicks before every session, test every anchor with a light pull, and never let a loaded band snap back through your face.`,
    features: [
      "Full-body circuits with a single resistance band",
      "Round-based progression: band, reps, then rounds",
      "No gym, no weights — train anywhere",
      "Written form cues for every exercise",
    ],
    equipment: ["Resistance band"],
    priceCents: 1499,
    durationLabel: "4 weeks",
    durationWeeks: 4,
    durationDays: null,
    daysPerWeek: 5,
    focus: null,
    difficulty: Difficulty.BEGINNER,
    sortOrder: 8,
  },

  // ── BP-06 ────────────────────────────────────────────────────────────────
  {
    slug: "4-week-upper-body-dumbbell-sculpt",
    name: "4-Week Upper Body Dumbbell Sculpt",
    kind: ProductKind.PROGRAM,
    tagline:
      "Four days a week of upper-body work: push, pull, shoulders and arms with dumbbells and a bench.",
    description: `What this is: a four-day upper-body hypertrophy split — the only program here that never trains legs, so every session gets fresh arms, back and shoulders instead of sharing them with lower-body work.

Who it's for: intermediate lifters who want arms, shoulders, back and chest developed in four focused sessions.

What you need: dumbbells and a bench (a sturdy chair edge works for dips and rows).

How it runs: Push Day, Pull Day, Shoulders + Arms, Upper + Core. Week 1 builds scapular control, week 2 adds work to push and pull, week 3 accumulates volume, week 4 keeps compound intensity while trimming accessories so you finish stronger.

Progression: one variable per week — reps, then sets, then load. Add 2–10% when you beat the target by 1–2 reps.

Safety: shoulder blades pinned during every press, rows driven by the elbows, and no behind-neck pressing — ever.`,
    features: [
      "Four-day upper split: push, pull, shoulders and arms, upper + core",
      "Dumbbell and bench exercises with home substitutions",
      "Mini-taper in week 4 so you finish stronger",
      "Written form cues for every exercise",
    ],
    equipment: ["Dumbbells", "Bench"],
    priceCents: 1499,
    durationLabel: "4 weeks",
    durationWeeks: 4,
    durationDays: null,
    daysPerWeek: 4,
    focus: null,
    difficulty: Difficulty.INTERMEDIATE,
    sortOrder: 10,
  },

  // ── BP-09 (empty program, Product row to be created) ────────────────────
  {
    slug: "30-day-glute-growth-challenge",
    name: "30-Day Glute Growth Challenge",
    kind: ProductKind.CHALLENGE,
    tagline:
      "Thirty days of progressive glute training with bodyweight, a band and an optional dumbbell.",
    description: `What this is: a 4-week, 5-day glute challenge that progresses through three loading styles — bodyweight activation, dumbbell compound work, then band-and-circuit density. This is the middle step between a band-only activation challenge and an eight-week barbell hypertrophy block.

Who it's for: beginners who have finished a 21-day activation challenge (or already know the basic patterns) and want to start building muscle.

What you need: an exercise mat. A loop band and one dumbbell make weeks 2–3 harder — both are optional, and every exercise lists a no-equipment version.

How it runs: week 1 Foundation (activation and patterns), week 2 Build (dumbbell added), week 3 Volume (band added, 3-round circuits), week 4 Peak and retest. Unilateral work always starts with your weaker side.

Safety: DOMS for 24–72 hours is normal; joint pain is not. This program promises strength and muscle endurance — not a shape change.`,
    features: [
      "30 days of progressive glute training across four weeks",
      "Bodyweight, band and optional dumbbell — start with what you have",
      "Unilateral work to fix side-to-side imbalances",
      "Written form cues for every exercise",
    ],
    equipment: ["Exercise mat", "Resistance band", "Dumbbells"],
    priceCents: 1499,
    durationLabel: "30 days",
    durationDays: 30,
    durationWeeks: null,
    daysPerWeek: 5,
    focus: ProductFocus.SCULPT,
    difficulty: Difficulty.BEGINNER,
    sortOrder: 11,
  },

  // ── BP-10 (empty program, Product row to be created) ────────────────────
  {
    slug: "nomi-8-week-signature-program",
    name: "NoMi 8-Week Signature Program",
    kind: ProductKind.PROGRAM,
    tagline:
      "Eight weeks of concurrent training — strength, conditioning and mobility — plus practical balanced-eating guidance.",
    description: `What this is: the complete NomiTips flagship — eight weeks of concurrent training with three strength sessions and two conditioning sessions each week, mobility folded into every warm-up and cooldown, and general guidance on eating well alongside your training.

Who it's for: beginners to intermediate lifters who want one program that covers everything: get stronger, get fitter, move better.

What you need: dumbbells, a loop band and a mat. Every exercise has a bodyweight substitute, so the program is deliverable with a mat alone.

How it runs: week 1 Foundation, week 2 Build, week 3 Volume, week 4 Deload, week 5 Intensify, week 6 Peak, week 7 Overreach, week 8 Consolidate and retest.

Nutrition scope: you get general education — hydration, balanced plates, protein at each meal, and how to eat around training. You do not get a meal plan, calorie targets or supplements. If you have a medical condition, a specific dietary need, or a difficult relationship with food, work with a doctor or registered dietitian.

Safety: standard movement rules apply — neutral spine on hinges, controlled eccentrics, and pain is always a stop signal.`,
    features: [
      "Three strength days plus two conditioning days each week",
      "Mobility folded into every warm-up and cooldown",
      "General balanced-eating guidance — no restrictive plans",
      "Planned deload week 4 and consolidation week 8",
    ],
    equipment: ["Dumbbells", "Resistance band", "Exercise mat"],
    priceCents: 2999,
    durationLabel: "8 weeks",
    durationWeeks: 8,
    durationDays: null,
    daysPerWeek: 5,
    focus: null,
    difficulty: Difficulty.INTERMEDIATE,
    sortOrder: 12,
  },
];
