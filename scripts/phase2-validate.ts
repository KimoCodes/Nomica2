/**
 * Phase 2 validator — read-only consistency checks on prisma/content-v2.
 *
 * Run: npx tsx scripts/phase2-validate.ts
 *
 * Checks the reviewable content package against the blueprint
 * (docs/PHASE1-PROGRAM-BLUEPRINTS.md) before anything reaches Phase 3:
 *   1. slug uniqueness and 1:1 program ↔ product mapping
 *   2. week/day counts per blueprint
 *   3. session skeleton: warm-up rows first, cooldown rows last
 *   4. row shape: sets ≥ 1, reps XOR seconds, rest > 0
 *   5. every referenced exercise name exists in the instruction set
 *   6. every instruction block carries the fixed labelled structure
 *   7. product copy: no "video" claims, features present, price sane
 *
 * Exits non-zero (throws) if any check fails.
 */

import {
  EXERCISES,
  PROGRAMS,
  PRODUCT_COPY,
} from "../prisma/content-v2";

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

/** Expected structure per blueprint (slug → [weeks, daysPerWeek]). */
const EXPECTED: Record<string, [number, number]> = {
  "21-day-booty-band-challenge": [3, 5],
  "8-week-glute-growth-blueprint": [8, 5],
  "21-day-strong-abs-and-core-challenge": [3, 5],
  "6-week-full-body-dumbbell-sculpt": [6, 5],
  "4-week-resistance-band-full-body-sculpt": [4, 5],
  "4-week-upper-body-dumbbell-sculpt": [4, 4],
  "30-day-glute-growth-challenge": [4, 5],
  "nomi-8-week-signature-program": [8, 5],
  "6-week-dumbbell-glute-growth": [6, 5],
  "6-week-glutes-and-quads-builder": [6, 5],
};

// ── 1. Slug uniqueness and program ↔ product mapping ───────────────────────
const programSlugs = PROGRAMS.map((p) => p.slug);
const productSlugs = PRODUCT_COPY.map((p) => p.slug);

for (const group of [
  ["program", programSlugs],
  ["product", productSlugs],
] as const) {
  const [label, slugs] = group;
  const seen = new Set<string>();
  for (const s of slugs) {
    if (seen.has(s)) fail(`duplicate ${label} slug: ${s}`);
    seen.add(s);
  }
}

const programSet = new Set(programSlugs);
const productSet = new Set(productSlugs);
for (const s of programSlugs) {
  if (!productSet.has(s)) fail(`program "${s}" has no ProductCopy entry`);
}
for (const s of productSlugs) {
  if (!programSet.has(s)) fail(`ProductCopy "${s}" has no program draft`);
}
for (const s of Object.keys(EXPECTED)) {
  if (!programSet.has(s)) fail(`expected blueprint slug missing: ${s}`);
}

// ── 5 (early). Instruction index ───────────────────────────────────────────
const instructionByName = new Map<string, (typeof EXERCISES)[number]>();
for (const ex of EXERCISES) {
  if (instructionByName.has(ex.name)) fail(`duplicate instruction entry: ${ex.name}`);
  instructionByName.set(ex.name, ex);
}

const usedNames = new Set<string>();

// ── 2, 3, 4, 5. Program structure ──────────────────────────────────────────
for (const program of PROGRAMS) {
  const expected = EXPECTED[program.slug];
  if (!expected) {
    fail(`program "${program.slug}" not in EXPECTED table`);
    continue;
  }
  const [weeks, days] = expected;
  if (program.weeks.length !== weeks) {
    fail(`${program.slug}: expected ${weeks} weeks, got ${program.weeks.length}`);
  }
  program.weeks.forEach((week, wi) => {
    if (week.days.length !== days) {
      fail(`${program.slug} week ${wi + 1}: expected ${days} days, got ${week.days.length}`);
    }
    if (!week.title?.trim()) fail(`${program.slug} week ${wi + 1}: empty title`);
    week.days.forEach((day, di) => {
      const where = `${program.slug} w${wi + 1}d${di + 1} (${day.title || "untitled"})`;
      if (!day.title?.trim()) fail(`${where}: empty day title`);
      const rows = day.exercises;
      if (rows.length < 6) fail(`${where}: only ${rows.length} rows (expect ≥6 with warm-up/cooldown)`);

      // Warm-up rows first, cooldown rows last (§2.1).
      const warmups = rows.filter((r) => r.notes?.startsWith("Warm-up ·"));
      const cooldowns = rows.filter((r) => r.notes?.startsWith("Cooldown ·"));
      if (warmups.length !== 3) fail(`${where}: ${warmups.length} warm-up rows (expect 3)`);
      if (cooldowns.length !== 2) fail(`${where}: ${cooldowns.length} cooldown rows (expect 2)`);
      if (!rows[0]?.notes?.startsWith("Warm-up ·")) fail(`${where}: first row is not a warm-up`);
      if (!rows[rows.length - 1]?.notes?.startsWith("Cooldown ·")) fail(`${where}: last row is not a cooldown`);

      rows.forEach((row, ri) => {
        const at = `${where} row ${ri + 1} (${row.name})`;
        if (!instructionByName.has(row.name)) fail(`${at}: no instruction entry for this exercise`);
        usedNames.add(row.name);
        if (!(row.sets >= 1)) fail(`${at}: sets must be ≥1`);
        if (row.rest <= 0) fail(`${at}: rest must be >0`);
        const hasReps = row.reps !== undefined;
        const hasSeconds = row.seconds !== undefined;
        if (hasReps === hasSeconds) fail(`${at}: needs exactly one of reps/seconds`);
        if (hasReps && (row.reps as number) < 1) fail(`${at}: reps must be ≥1`);
        if (hasSeconds && (row.seconds as number) < 1) fail(`${at}: seconds must be ≥1`);
      });
    });
  });
}

// ── 6. Instruction block structure ─────────────────────────────────────────
const REQUIRED_LABELS = ["Set-up:", "Execution:", "Breathing:", "Watch for:"];
for (const ex of EXERCISES) {
  for (const label of REQUIRED_LABELS) {
    if (!ex.instructions.includes(label)) {
      fail(`instruction "${ex.name}" missing label ${label}`);
    }
  }
}

// ── 7. Product copy ────────────────────────────────────────────────────────
for (const p of PRODUCT_COPY) {
  if (!p.tagline.trim()) fail(`product ${p.slug}: empty tagline`);
  if (p.description.trim().length < 200) {
    fail(`product ${p.slug}: description too short (${p.description.trim().length} chars, expect ≥200)`);
  }
  if (p.features.length < 4 || p.features.length > 5) {
    fail(`product ${p.slug}: ${p.features.length} features (expect 4–5)`);
  }
  if (p.features.some((f) => /video/i.test(f))) {
    fail(`product ${p.slug}: feature claims video demonstrations (none exist)`);
  }
  if (/video/i.test(p.description)) {
    fail(`product ${p.slug}: description claims video demonstrations`);
  }
  if (p.priceCents <= 0) fail(`product ${p.slug}: price must be >0`);
  if (!p.durationLabel.trim()) fail(`product ${p.slug}: empty durationLabel`);
  const expectedDays = EXPECTED[p.slug]?.[1];
  if (expectedDays !== undefined && p.daysPerWeek !== expectedDays) {
    fail(`product ${p.slug}: daysPerWeek ${p.daysPerWeek} ≠ blueprint ${expectedDays}`);
  }
  // Scope line: flag affirmative nutrition/weight-loss promises. Sentences
  // that negate the claim ("You do not get a meal plan…") are disclaimers.
  const scopeKeywords = /meal plan|diet plan|calorie|weight loss|lose weight|supplement protocol|body transformation/i;
  const sentences = `${p.tagline} ${p.description}`.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    if (scopeKeywords.test(s) && !/\b(not|no|never|n't)\b/i.test(s)) {
      fail(`product ${p.slug}: copy crosses the nutrition/weight-loss scope line: "${s.trim()}"`);
    }
  }
}

// ── Summary ────────────────────────────────────────────────────────────────
const totalWeeks = PROGRAMS.reduce((n, p) => n + p.weeks.length, 0);
const totalDays = PROGRAMS.reduce(
  (n, p) => n + p.weeks.reduce((m, w) => m + w.days.length, 0),
  0,
);
const totalRows = PROGRAMS.reduce(
  (n, p) =>
    n +
    p.weeks.reduce(
      (m, w) => m + w.days.reduce((k, d) => k + d.exercises.length, 0),
      0,
    ),
  0,
);

console.log("Phase 2 content package");
console.log(`  programs:  ${PROGRAMS.length}`);
console.log(`  products:  ${PRODUCT_COPY.length}`);
console.log(`  weeks:     ${totalWeeks}`);
console.log(`  days:      ${totalDays}`);
console.log(`  rows:      ${totalRows}`);
console.log(`  exercises with instructions: ${EXERCISES.length}`);
console.log(`  distinct exercises used:     ${usedNames.size}`);

if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\n✓ all checks passed");
