/**
 * Phase 3 — apply the Phase 2 content package to the database.
 *
 * The package (prisma/content-v2/) is the reviewable source of truth; this
 * script is the only writer. It is idempotent and safe to re-run: products and
 * programs are resolved by slug/title, content is rebuilt from scratch, and
 * exercise instructions are only written when they differ.
 *
 * Usage:
 *   npx tsx scripts/phase3-load.ts            # dry-run (reads only, prints the plan)
 *   npx tsx scripts/phase3-load.ts --apply    # write (requires a pre-write backup)
 *
 * Safety net (docs/PHASE1-PROGRAM-BLUEPRINTS.md, decision #5):
 *   --apply refuses to run unless backups/phase3-pre-load-*.dump exists.
 *   Writes run in staged transactions (exercises → per-program → retire);
 *   each stage is idempotent, so an interrupted run resumes on re-run.
 *
 * Decisions honoured here (Part 5):
 *   #1 other coach's programs are never touched
 *   #2 O1/O2 Program rows are created and linked
 *   #3 B7/B8 are retired (only when provably unreferenced)
 *   #4 stripe-payment-test is never touched
 *   #6 product copy carries no video claims
 *   #8 B9/B10 get published standalone Product rows; bundles keep membership
 */
import "dotenv/config";
import { readdirSync } from "node:fs";
import path from "node:path";
import { PrismaClient, ProductKind, ProductStatus } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { EXERCISES, PROGRAMS, PRODUCT_COPY } from "../prisma/content-v2";
import type { ProductCopy } from "../prisma/content-v2";

const TARGET_COACH_EMAIL = "nomitipscoaching@gmail.com";
const BACKUP_DIR = path.join(process.cwd(), "backups");
const BACKUP_RE = /^phase3-pre-load-.*\.dump$/;

/** Retired empty duplicates (B7/B8) — matched by exact title, never by id. */
const RETIRE_TITLES = [
  "8 Weeks Dumbbell Full Body Sculpt",
  "6 Weeks Dumbbells Full Body Sculpt",
];

/** Programs whose historical DB title differs from the v2 title. */
const PROGRAM_TITLE_ALIASES: Record<string, string[]> = {
  "30-day-glute-growth-challenge": ["30 Days Glute Growth Challenge"],
  "nomi-8-week-signature-program": ["NoMi 8 Weeks Signature Program"],
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function fail(msg: string): never {
  console.error(`\n❌ ${msg}`);
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const apply = process.argv.includes("--apply");
  const mode = apply ? "APPLY" : "DRY-RUN";
  console.log(`Phase 3 load — ${mode}\n`);

  // ── Preflight ────────────────────────────────────────────────────────────
  if (!process.env.DATABASE_URL) fail("DATABASE_URL not set");
  if (apply) {
    const backups = readdirSync(BACKUP_DIR).filter((f) => BACKUP_RE.test(f));
    if (backups.length === 0) {
      fail(
        `no pre-write backup in backups/ — decision #5 requires a pg_dump before --apply`,
      );
    }
    console.log(`  backup:          ${backups[backups.length - 1]}`);
  }

  const coach = await prisma.user.findUnique({
    where: { email: TARGET_COACH_EMAIL },
    include: { coachProfile: true },
  });
  const coachId = coach?.coachProfile?.id;
  if (!coachId) fail(`target coach ${TARGET_COACH_EMAIL} not found`);
  console.log(`  coach:           ${TARGET_COACH_EMAIL} (${coachId})`);

  // ── Plan: exercise instructions ──────────────────────────────────────────
  const exIdByNorm = new Map<string, string>();
  let exCreate = 0;
  let exUpdate = 0;
  const exCreates: string[] = [];
  const exUpdates: string[] = [];
  for (const inst of EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: { name: { equals: inst.name, mode: "insensitive" } },
    });
    if (existing) {
      exIdByNorm.set(norm(existing.name), existing.id);
      const differs =
        existing.instructions !== inst.instructions ||
        existing.muscleGroup !== inst.muscleGroup ||
        existing.difficulty !== inst.difficulty;
      if (differs) {
        exUpdate++;
        exUpdates.push(inst.name);
      }
    } else {
      exCreate++;
      exCreates.push(inst.name);
    }
  }

  const libNames = new Set(EXERCISES.map((e) => norm(e.name)));
  const usedNames = new Set(
    PROGRAMS.flatMap((p) =>
      p.weeks.flatMap((w) => w.days.flatMap((d) => d.exercises.map((e) => norm(e.name)))),
    ),
  );
  const unresolved = [...usedNames].filter((n) => !libNames.has(n));
  if (unresolved.length > 0) {
    fail(`program rows reference exercises missing from the library: ${unresolved.join(", ")}`);
  }

  // ── Plan: products + programs ────────────────────────────────────────────
  const copyBySlug = new Map<string, ProductCopy>(PRODUCT_COPY.map((c) => [c.slug, c]));
  type ProgramPlan = {
    prog: (typeof PROGRAMS)[number];
    copy: ProductCopy;
    programId: string | null;
    programCreated: boolean;
    productExists: boolean;
    weeks: number;
    days: number;
    rows: number;
    completions: number;
  };
  const plans: ProgramPlan[] = [];
  let productUpdates = 0;
  let productCreates = 0;
  let programCreates = 0;

  for (const prog of PROGRAMS) {
    const copy = copyBySlug.get(prog.slug);
    if (!copy) fail(`no PRODUCT_COPY entry for ${prog.slug}`);

    const product = await prisma.product.findUnique({ where: { slug: prog.slug } });
    if (product) productUpdates++;
    else productCreates++;

    let programId: string | null = product?.programId ?? null;
    if (!programId) {
      const byTitle = await prisma.program.findFirst({
        where: { title: prog.title, coachId },
        select: { id: true },
      });
      programId = byTitle?.id ?? null;
    }
    if (!programId) {
      for (const alias of PROGRAM_TITLE_ALIASES[prog.slug] ?? []) {
        const byAlias = await prisma.program.findFirst({
          where: { title: alias, coachId },
          select: { id: true },
        });
        if (byAlias) {
          programId = byAlias.id;
          break;
        }
      }
    }
    const programCreated = programId === null;
    if (programCreated) programCreates++;

    const weeks = prog.weeks.length;
    const days = prog.weeks.reduce((n, w) => n + w.days.length, 0);
    const rows = prog.weeks.reduce(
      (n, w) => n + w.days.reduce((m, d) => m + d.exercises.length, 0),
      0,
    );

    let completions = 0;
    if (programId) {
      completions = await prisma.workoutCompletion.count({
        where: { programDay: { week: { programId } } },
      });
    }

    plans.push({ prog, copy, programId, programCreated, productExists: !!product, weeks, days, rows, completions });
  }

  const totals = plans.reduce(
    (t, p) => ({ weeks: t.weeks + p.weeks, days: t.days + p.days, rows: t.rows + p.rows, completions: t.completions + p.completions }),
    { weeks: 0, days: 0, rows: 0, completions: 0 },
  );

  // ── Plan: retire B7/B8 ───────────────────────────────────────────────────
  const claimedIds = new Set(plans.map((p) => p.programId).filter(Boolean) as string[]);
  const coachPrograms = await prisma.program.findMany({
    where: { coachId, title: { in: RETIRE_TITLES } },
    select: { id: true, title: true },
  });
  type RetirePlan = { id: string; title: string; safe: boolean; reason: string };
  const retires: RetirePlan[] = [];
  for (const row of coachPrograms) {
    if (claimedIds.has(row.id)) continue; // never retire a program we just linked
    const [weekCount, assignmentCount, productCount, mediaCount] = await Promise.all([
      prisma.programWeek.count({ where: { programId: row.id } }),
      prisma.clientProgram.count({ where: { programId: row.id } }),
      prisma.product.count({ where: { programId: row.id } }),
      prisma.media.count({ where: { programId: row.id } }),
    ]);
    const refs = [weekCount && `${weekCount} weeks`, assignmentCount && `${assignmentCount} assignments`, productCount && `${productCount} products`, mediaCount && `${mediaCount} media`].filter(Boolean);
    retires.push({
      id: row.id,
      title: row.title,
      safe: refs.length === 0,
      reason: refs.length === 0 ? "unreferenced" : `blocked: ${refs.join(", ")}`,
    });
  }

  // ── Print plan ───────────────────────────────────────────────────────────
  console.log("\nPlan");
  console.log(`  exercises:       ${EXERCISES.length} library — ${exCreate} create, ${exUpdate} update instructions`);
  if (exCreates.length) console.log(`                   + ${exCreates.join(", ")}`);
  console.log(`  products:        ${PRODUCT_COPY.length} — ${productCreates} create (${PRODUCT_COPY.filter((c) => !plans.find((p) => p.prog.slug === c.slug)!.productExists).map((c) => c.slug).join(", ") || "none"}), ${productUpdates} update copy`);
  console.log(`  programs:        ${plans.length} — ${programCreates} create (${plans.filter((p) => p.programCreated).map((p) => p.prog.slug).join(", ") || "none"}), ${plans.length - programCreates} reuse`);
  console.log(`  content:         rebuild ${totals.weeks} weeks / ${totals.days} days / ${totals.rows} rows across ${plans.length} programs`);
  if (totals.completions > 0) {
    console.log(`  cascade loss:    ${totals.completions} workout completion(s) attached to old content (covered by backup)`);
  }
  console.log(`  retire:          ${retires.length} candidate(s)`);
  for (const r of retires) console.log(`                   - ${r.title}: ${r.reason}`);
  console.log(`  bundles:         compareAtCents recomputed from child prices (membership untouched)`);

  if (!apply) {
    console.log("\nDry-run only — no writes performed. Re-run with --apply to execute.");
    return;
  }

  // ── Apply (staged transactions; every stage is idempotent, a re-run resumes) ──
  console.log("\nApplying…");
  const bundleFixes: string[] = [];
  const retired: string[] = [];

  // Stage 1 — exercise instructions
  await prisma.$transaction(
    async (tx) => {
      for (const inst of EXERCISES) {
        const existingId = exIdByNorm.get(norm(inst.name)) ?? null;
        if (existingId) {
          if (exUpdates.includes(inst.name)) {
            await tx.exercise.update({
              where: { id: existingId },
              data: { instructions: inst.instructions, muscleGroup: inst.muscleGroup, difficulty: inst.difficulty },
            });
          }
        } else {
          const created = await tx.exercise.create({
            data: { name: inst.name, muscleGroup: inst.muscleGroup, difficulty: inst.difficulty, instructions: inst.instructions },
          });
          exIdByNorm.set(norm(inst.name), created.id);
        }
      }
    },
    { timeout: 300_000, maxWait: 30_000 },
  );
  console.log(`  ✓ exercises (${exCreate} created, ${exUpdate} updated)`);

  // Stage 2 — one transaction per program: product + program row + content
  for (const plan of plans) {
    const { prog, copy } = plan;
    await prisma.$transaction(
      async (tx) => {
        const productData = {
          name: copy.name,
          kind: copy.kind,
          tagline: copy.tagline,
          description: copy.description,
          priceCents: copy.priceCents,
          durationLabel: copy.durationLabel,
          durationWeeks: copy.durationWeeks ?? null,
          durationDays: copy.durationDays ?? null,
          daysPerWeek: copy.daysPerWeek ?? null,
          focus: copy.focus ?? null,
          features: copy.features,
          equipment: copy.equipment,
          sortOrder: copy.sortOrder,
        };
        let product = await tx.product.findUnique({ where: { slug: prog.slug } });
        if (product) {
          // status is deliberately not touched (all 10 are already PUBLISHED)
          product = await tx.product.update({ where: { id: product.id }, data: productData });
        } else {
          product = await tx.product.create({
            data: { slug: prog.slug, ...productData, status: ProductStatus.PUBLISHED },
          });
        }

        const programData = {
          title: prog.title,
          description: copy.tagline,
          price: copy.priceCents,
          features: copy.features,
          difficulty: copy.difficulty,
          duration: prog.weeks.length,
        };

        let program = product.programId
          ? await tx.program.findUnique({ where: { id: product.programId } })
          : null;
        if (!program) {
          program = await tx.program.findFirst({ where: { title: prog.title, coachId } });
        }
        if (!program) {
          for (const alias of PROGRAM_TITLE_ALIASES[prog.slug] ?? []) {
            program = await tx.program.findFirst({ where: { title: alias, coachId } });
            if (program) break;
          }
        }
        if (!program) {
          program = await tx.program.create({
            data: { ...programData, coachId, isTemplate: true, isSellable: false },
          });
        } else {
          program = await tx.program.update({ where: { id: program.id }, data: programData });
        }

        if (product.programId !== program.id) {
          await tx.product.update({
            where: { id: product.id },
            data: { programId: program.id },
          });
        }

        // Rebuild content: old weeks (and everything under them) cascade away.
        await tx.programWeek.deleteMany({ where: { programId: program.id } });
        for (const [wi, week] of prog.weeks.entries()) {
          await tx.programWeek.create({
            data: {
              programId: program.id,
              weekNumber: wi + 1,
              title: week.title,
              days: {
                create: week.days.map((day, di) => ({
                  dayNumber: di + 1,
                  title: day.title,
                  exercises: {
                    create: day.exercises.map((spec, ei) => {
                      const exerciseId = exIdByNorm.get(norm(spec.name));
                      if (!exerciseId) fail(`exercise not resolved at write time: ${spec.name}`);
                      return {
                        exerciseId,
                        order: ei + 1,
                        sets: spec.sets,
                        reps: spec.reps ?? null,
                        duration: spec.seconds ?? null,
                        restSeconds: spec.rest,
                        notes: spec.notes ?? null,
                      };
                    }),
                  },
                })),
              },
            },
          });
        }
      },
      { timeout: 120_000, maxWait: 30_000 },
    );
    console.log(`  ✓ ${prog.slug} (${plan.weeks} wks / ${plan.days} days / ${plan.rows} rows)`);
  }

  // Stage 3 — retire B7/B8 + bundle compareAtCents
  await prisma.$transaction(
    async (tx) => {
      for (const r of retires) {
        if (!r.safe) continue;
        const [weekCount, assignmentCount, productCount, mediaCount] = await Promise.all([
          tx.programWeek.count({ where: { programId: r.id } }),
          tx.clientProgram.count({ where: { programId: r.id } }),
          tx.product.count({ where: { programId: r.id } }),
          tx.media.count({ where: { programId: r.id } }),
        ]);
        if (weekCount || assignmentCount || productCount || mediaCount) continue;
        await tx.program.delete({ where: { id: r.id } });
        retired.push(r.title);
      }

      // Bundle compareAtCents (children may have changed price; membership never changes)
      const bundles = await tx.product.findMany({ where: { kind: ProductKind.BUNDLE } });
      for (const bundle of bundles) {
        const items = await tx.bundleItem.findMany({
          where: { bundleId: bundle.id },
          include: { item: { select: { priceCents: true } } },
        });
        const sum = items.reduce((n, i) => n + i.item.priceCents, 0);
        if (sum !== bundle.compareAtCents) {
          await tx.product.update({ where: { id: bundle.id }, data: { compareAtCents: sum } });
          bundleFixes.push(`${bundle.slug}: ${bundle.compareAtCents} → ${sum}`);
        }
      }
    },
    { timeout: 60_000, maxWait: 30_000 },
  );
  console.log(`  ✓ retire + bundles`);

  // ── Verify (read-only, after commit) ─────────────────────────────────────
  console.log("\nVerifying…");
  const problems: string[] = [];
  let dbWeeks = 0;
  let dbDays = 0;
  let dbRows = 0;

  for (const plan of plans) {
    const product = await prisma.product.findUnique({ where: { slug: plan.prog.slug } });
    if (!product) {
      problems.push(`${plan.prog.slug}: product missing`);
      continue;
    }
    if (!product.programId) problems.push(`${plan.prog.slug}: product not linked to a program`);
    if (product.status !== ProductStatus.PUBLISHED) problems.push(`${plan.prog.slug}: status ${product.status}`);
    const copyText = [product.tagline, product.description, ...product.features].join(" ");
    if (/video/i.test(copyText)) problems.push(`${plan.prog.slug}: video claim in copy`);
    if (product.programId) {
      const [w, d, r] = await Promise.all([
        prisma.programWeek.count({ where: { programId: product.programId } }),
        prisma.programDay.count({ where: { week: { programId: product.programId } } }),
        prisma.programExercise.count({ where: { day: { week: { programId: product.programId } } } }),
      ]);
      dbWeeks += w;
      dbDays += d;
      dbRows += r;
      if (w !== plan.weeks || d !== plan.days || r !== plan.rows) {
        problems.push(`${plan.prog.slug}: got ${w}/${d}/${r}, expected ${plan.weeks}/${plan.days}/${plan.rows}`);
      }
    }
  }

  const dbExercises = await prisma.exercise.findMany({ select: { name: true } });
  const dbNorms = new Set(dbExercises.map((e) => norm(e.name)));
  const missingEx = EXERCISES.filter((e) => !dbNorms.has(norm(e.name))).map((e) => e.name);
  if (missingEx.length) problems.push(`library exercises missing: ${missingEx.join(", ")}`);

  const stripeLeft = await prisma.product.findUnique({ where: { slug: "stripe-payment-test" } });
  if (!stripeLeft || stripeLeft.status !== ProductStatus.PUBLISHED) problems.push("stripe-payment-test was modified");

  console.log(`  weeks:           ${dbWeeks}`);
  console.log(`  days:            ${dbDays}`);
  console.log(`  exercise rows:   ${dbRows}`);
  console.log(`  library present: ${EXERCISES.length - missingEx.length}/${EXERCISES.length}`);
  if (retired.length) console.log(`  retired:         ${retired.join(", ")}`);
  if (bundleFixes.length) console.log(`  bundle fixes:    ${bundleFixes.join(", ")}`);
  else console.log(`  bundles:         compareAtCents unchanged`);

  if (problems.length) {
    console.error("\n❌ verification problems:");
    for (const p of problems) console.error(`   - ${p}`);
    process.exit(1);
  }
  console.log("\n✅ Phase 3 load complete — all checks passed.");
}

main()
  .catch((err) => {
    console.error("\n❌ phase3-load failed (completed stages are committed; re-run to resume):", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
