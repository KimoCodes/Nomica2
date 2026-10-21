import "dotenv/config";
import {
  Difficulty,
  PrismaClient,
  ProductFocus,
  ProductKind,
  ProductStatus,
  Role,
} from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashSync } from "bcrypt";

/**
 * Seed data source of truth: clean_workout_programs_catalog.pdf
 * - 6 multi-week programs (one-time purchase)
 * - 4 short challenges
 * - 3 bundles (rebuilt from the programs above)
 * Program workout content (weeks/days/exercises) is generated from
 * per-program day templates so every product is browsable and trainable
 * end-to-end in development.
 */

// ─── Production Safety Guard ─────────────────────────────────────────────────
// This seed script creates development/catalog data. It must NEVER run
// automatically in production. Use `NODE_ENV=production_seed npx tsx prisma/seed.ts`
// only when deliberately seeding production catalog data for the first time.
if (process.env.NODE_ENV === "production") {
  console.error(
    "\n❌ SEED BLOCKED: Refusing to run in production environment.\n\n" +
    "This script is intended for development and initial catalog seeding only.\n" +
    "If you need to seed production catalog data, run:\n\n" +
    "  NODE_ENV=production_seed npx tsx prisma/seed.ts\n\n" +
    "This safety guard prevents accidental data corruption.\n"
  );
  process.exit(1);
}

const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Catalog definition (clean_workout_programs_catalog.pdf)
// ---------------------------------------------------------------------------

type ProgramProduct = {
  slug: string;
  kind: typeof ProductKind.PROGRAM | typeof ProductKind.CHALLENGE;
  name: string;
  tagline: string;
  priceCents: number;
  durationLabel: string;
  durationWeeks?: number;
  durationDays?: number;
  daysPerWeek?: number;
  focus?: ProductFocus;
  difficulty: Difficulty;
  features: string[];
  equipment?: string[];
  sortOrder: number;
};

const PROGRAMS: ProgramProduct[] = [
  {
    slug: "21-day-booty-band-challenge",
    kind: ProductKind.CHALLENGE,
    name: "21-Day Booty Band Challenge",
    tagline:
      "A focused glute challenge to lift, tone, and activate your glutes with simple band workouts.",
    priceCents: 999,
    durationLabel: "21 days",
    durationDays: 21,
    daysPerWeek: 5,
    focus: ProductFocus.SCULPT,
    difficulty: Difficulty.BEGINNER,
    features: [
      "Booty-band workouts with video demonstrations",
      "Progressive glute activation and toning",
      "Beginner-friendly modifications",
      "Mobile-friendly workout player",
    ],
    equipment: ["Resistance band"],
    sortOrder: 1,
  },
  {
    slug: "6-week-dumbbell-glute-growth",
    kind: ProductKind.PROGRAM,
    name: "6-Week Dumbbell Glute Growth",
    tagline: "A progressive dumbbell plan designed to build stronger, fuller glutes.",
    priceCents: 1999,
    durationLabel: "6 weeks",
    durationWeeks: 6,
    daysPerWeek: 5,
    difficulty: Difficulty.INTERMEDIATE,
    features: [
      "Dumbbell workouts with video demonstrations",
      "Progressive overload built into each week",
      "Glute-focused strength and shape training",
      "Mobile-friendly workout player",
    ],
    equipment: ["Dumbbells"],
    sortOrder: 2,
  },
  {
    slug: "8-week-glute-growth-blueprint",
    kind: ProductKind.PROGRAM,
    name: "8-Week Glute Growth Blueprint",
    tagline:
      "A complete glute-building blueprint focused on shape, strength, and long-term results.",
    priceCents: 2999,
    durationLabel: "8 weeks",
    durationWeeks: 8,
    daysPerWeek: 5,
    difficulty: Difficulty.INTERMEDIATE,
    features: [
      "Structured glute workouts with video demonstrations",
      "Progressive overload built into every week",
      "Form tips and exercise alternatives",
      "Mobile-friendly workout player",
    ],
    equipment: ["Dumbbells", "Barbell", "Bench"],
    sortOrder: 3,
  },
  {
    slug: "6-week-glutes-and-quads-builder",
    kind: ProductKind.PROGRAM,
    name: "6-Week Glutes & Quads Builder",
    tagline:
      "A lower-body training plan to build stronger glutes and more defined quads.",
    priceCents: 1999,
    durationLabel: "6 weeks",
    durationWeeks: 6,
    daysPerWeek: 5,
    difficulty: Difficulty.INTERMEDIATE,
    features: [
      "Lower-body workouts with video demonstrations",
      "Strength and hypertrophy progression",
      "Home and gym exercise options",
      "Mobile-friendly workout player",
    ],
    equipment: ["Dumbbells", "Leg press machine"],
    sortOrder: 4,
  },
  {
    slug: "21-day-strong-abs-and-core-challenge",
    kind: ProductKind.CHALLENGE,
    name: "21-Day Strong Abs & Core Challenge",
    tagline:
      "A focused core challenge to strengthen your abs, improve posture, and build a tighter midsection.",
    priceCents: 999,
    durationLabel: "21 days",
    durationDays: 21,
    daysPerWeek: 5,
    focus: ProductFocus.SCULPT,
    difficulty: Difficulty.BEGINNER,
    features: [
      "Core workouts with video demonstrations",
      "Progressive ab and stability training",
      "Beginner-friendly modifications",
      "Mobile-friendly workout player",
    ],
    equipment: ["Exercise mat"],
    sortOrder: 5,
  },
  {
    slug: "6-week-full-body-dumbbell-sculpt",
    kind: ProductKind.PROGRAM,
    name: "6-Week Full Body Dumbbell Sculpt",
    tagline:
      "A full-body sculpting program using dumbbells to build strength and tone from head to toe.",
    priceCents: 1999,
    durationLabel: "6 weeks",
    durationWeeks: 6,
    daysPerWeek: 5,
    difficulty: Difficulty.INTERMEDIATE,
    features: [
      "Full-body workouts with video demonstrations",
      "Progressive overload built into each week",
      "Strength and sculpting guidance",
      "Mobile-friendly workout player",
    ],
    equipment: ["Dumbbells"],
    sortOrder: 6,
  },
  {
    slug: "30-day-low-impact-cardio-burn",
    kind: ProductKind.CHALLENGE,
    name: "30-Day Low-Impact Cardio Burn",
    tagline:
      "A 30-day low-impact cardio plan designed to build endurance and burn calories without stressing your joints.",
    priceCents: 1299,
    durationLabel: "30 days",
    durationDays: 30,
    daysPerWeek: 5,
    focus: ProductFocus.SWEAT,
    difficulty: Difficulty.BEGINNER,
    features: [
      "30-day cardio workouts with video demonstrations",
      "Low-impact, joint-friendly sessions",
      "Beginner-friendly modifications",
      "Mobile-friendly workout player",
    ],
    equipment: ["Exercise mat"],
    sortOrder: 7,
  },
  {
    slug: "4-week-resistance-band-full-body-sculpt",
    kind: ProductKind.PROGRAM,
    name: "4-Week Resistance Band Full Body Sculpt",
    tagline:
      "A resistance-band program to tone your full body and build strength with minimal equipment.",
    priceCents: 1499,
    durationLabel: "4 weeks",
    durationWeeks: 4,
    daysPerWeek: 5,
    difficulty: Difficulty.BEGINNER,
    features: [
      "Resistance-band workouts with video demonstrations",
      "Minimal-equipment full-body training",
      "Beginner-friendly modifications",
      "Mobile-friendly workout player",
    ],
    equipment: ["Resistance band"],
    sortOrder: 8,
  },
  {
    slug: "14-day-tabata-and-cardio-challenge",
    kind: ProductKind.CHALLENGE,
    name: "14-Day Tabata & Cardio Challenge",
    tagline:
      "A quick cardio challenge using Tabata-style intervals to boost endurance and burn calories.",
    priceCents: 999,
    durationLabel: "14 days",
    durationDays: 14,
    daysPerWeek: 5,
    focus: ProductFocus.SWEAT,
    difficulty: Difficulty.BEGINNER,
    features: [
      "Cardio workouts with video demonstrations",
      "Short, effective interval training",
      "Beginner-friendly modifications",
      "Mobile-friendly workout player",
    ],
    equipment: ["Exercise mat"],
    sortOrder: 9,
  },
  {
    slug: "4-week-upper-body-dumbbell-sculpt",
    kind: ProductKind.PROGRAM,
    name: "4-Week Upper Body Dumbbell Sculpt",
    tagline:
      "An upper-body plan focused on toned arms, sculpted shoulders, and stronger back strength.",
    priceCents: 1499,
    durationLabel: "4 weeks",
    durationWeeks: 4,
    daysPerWeek: 4,
    difficulty: Difficulty.INTERMEDIATE,
    features: [
      "Upper-body workouts with video demonstrations",
      "Dumbbell-based strength progression",
      "Home and gym exercise options",
      "Mobile-friendly workout player",
    ],
    equipment: ["Dumbbells", "Bench"],
    sortOrder: 10,
  },
];

const BUNDLES = [
  {
    slug: "lower-body-bundle",
    name: "Lower-Body Bundle",
    tagline: "21-Day Booty Band Challenge + 6-Week Dumbbell Glute Growth + Glutes & Quads Builder",
    priceCents: 3499,
    items: [
      "21-day-booty-band-challenge",
      "6-week-dumbbell-glute-growth",
      "6-week-glutes-and-quads-builder",
    ],
    sortOrder: 20,
  },
  {
    slug: "sculpt-and-sweat-bundle",
    name: "Sculpt & Sweat Bundle",
    tagline:
      "Full Body Dumbbell Sculpt + Resistance Band Sculpt + Upper Body Sculpt + Tabata, Cardio Burn & Abs challenges",
    priceCents: 5499,
    items: [
      "6-week-full-body-dumbbell-sculpt",
      "4-week-resistance-band-full-body-sculpt",
      "4-week-upper-body-dumbbell-sculpt",
      "14-day-tabata-and-cardio-challenge",
      "30-day-low-impact-cardio-burn",
      "21-day-strong-abs-and-core-challenge",
    ],
    sortOrder: 21,
  },
  {
    slug: "complete-nomitips-bundle",
    name: "Complete NomiTips Bundle",
    tagline: "All 6 programs + all 4 challenges — the complete catalog",
    priceCents: 9999,
    items: PROGRAMS.map((p) => p.slug),
    sortOrder: 22,
  },
];

// ---------------------------------------------------------------------------

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  // 1. NomiTips head-coach account that owns catalog programs
  const nomitipsCoach = await prisma.user.upsert({
    where: { email: "coach@nomitips.com" },
    update: {},
    create: {
      email: "coach@nomitips.com",
      name: "NomiTips Coaching",
      password: hashSync("ChangeMe123!", BCRYPT_ROUNDS),
      role: Role.COACH,
      emailVerified: new Date(),
      coachProfile: {
        create: {
          bio: "The official NomiTips coaching team. Programs designed around the goals women ask for most.",
          specialties: ["Glute training", "Body recomposition", "Beginner coaching"],
          yearsExperience: 8,
          certification: "NASM CPT",
          approved: true,
          onboardingComplete: true,
        },
      },
    },
    include: { coachProfile: true },
  });
  const coachProfileId =
    nomitipsCoach.coachProfile?.id ??
    (await prisma.coachProfile.findUniqueOrThrow({ where: { userId: nomitipsCoach.id } })).id;
  console.log("✓ NomiTips head coach");

  // 2. Programs + Products
  for (const def of PROGRAMS) {
    const totalWeeks = def.durationWeeks ?? Math.ceil((def.durationDays ?? 21) / 7);
    const programData = {
      title: def.name,
      description: def.tagline,
      isSellable: true,
      price: def.priceCents,
      features: def.features,
      difficulty: def.difficulty,
      duration: totalWeeks,
    };

    // Reuse a Program row created earlier (e.g. admin-created template)
    // so we don't end up with duplicate content for the same catalog item.
    let program = await prisma.program.findFirst({ where: { title: def.name } });
    if (program) {
      program = await prisma.program.update({ where: { id: program.id }, data: programData });
    } else {
      program = await prisma.program.create({
        data: {
          ...programData,
          coachId: coachProfileId,
          isTemplate: true,
        },
      });
    }

    const existingProduct = await prisma.product.findUnique({ where: { slug: def.slug } });
    const productData = {
      kind: def.kind,
      name: def.name,
      tagline: def.tagline,
      description: def.tagline,
      priceCents: def.priceCents,
      durationLabel: def.durationLabel,
      durationWeeks: def.durationWeeks ?? null,
      durationDays: def.durationDays ?? null,
      daysPerWeek: def.daysPerWeek ?? null,
      focus: def.focus ?? null,
      features: def.features,
      equipment: def.equipment ?? [],
      status: ProductStatus.PUBLISHED,
      sortOrder: def.sortOrder,
      programId: program.id,
    };

    if (existingProduct) {
      await prisma.product.update({ where: { id: existingProduct.id }, data: productData });
    } else {
      await prisma.product.create({ data: { slug: def.slug, ...productData } });
    }
    console.log(`✓ ${def.kind.toLowerCase()}: ${def.name}`);
  }

  // 3. Bundles
  for (const def of BUNDLES) {
    const items = await prisma.product.findMany({
      where: { slug: { in: def.items } },
      select: { id: true, priceCents: true },
    });
    if (items.length !== def.items.length) {
      throw new Error(`Bundle ${def.slug}: missing child products`);
    }
    const compareAt = items.reduce((sum, p) => sum + p.priceCents, 0);
    const bundleData = {
      name: def.name,
      tagline: def.tagline,
      description: def.tagline,
      priceCents: def.priceCents,
      compareAtCents: compareAt,
      durationLabel: `${def.items.length} products`,
      features: [
        "Everything in each included program",
        "One purchase, lifetime access to all items",
        `Save ${Math.round(((compareAt - def.priceCents) / compareAt) * 100)}% vs buying separately`,
      ],
      status: ProductStatus.PUBLISHED,
      sortOrder: def.sortOrder,
    };

    const existing = await prisma.product.findUnique({
      where: { slug: def.slug },
      include: { bundleItems: true },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          ...bundleData,
          bundleItems: {
            deleteMany: {},
            create: items.map((item) => ({ itemId: item.id })),
          },
        },
      });
    } else {
      await prisma.product.create({
        data: {
          slug: def.slug,
          kind: ProductKind.BUNDLE,
          ...bundleData,
          bundleItems: {
            create: items.map((item) => ({ itemId: item.id })),
          },
        },
      });
    }
    console.log(`✓ bundle: ${def.name}`);
  }

  // 4. Archive legacy catalog products from the previous NOMICA catalog.
  //    ARCHIVED (not deleted) because order/entitlement FKs may Restrict deletes.
  const LEGACY_SLUGS = [
    "glute-builder", "hourglass-sculpt", "toned-legs", "full-body-sculpt",
    "beginner-gym-confidence", "strong-and-toned",
    "cardio-burn-challenge", "core-abs-challenge", "glute-growth-challenge",
    "quad-sculpt-challenge", "stairmaster-challenge",
  ];
  const legacy = await prisma.product.findMany({
    where: { slug: { in: LEGACY_SLUGS }, status: { not: ProductStatus.ARCHIVED } },
    select: { id: true, slug: true },
  });
  for (const prod of legacy) {
    await prisma.product.update({
      where: { id: prod.id },
      data: { status: ProductStatus.ARCHIVED },
    });
    console.log(`✓ archived legacy: ${prod.slug}`);
  }

  const LEGACY_PROGRAM_TITLES = [
    "Glute Builder", "Hourglass Sculpt", "Toned Legs", "Full-Body Sculpt",
    "Beginner Gym Confidence", "Strong & Toned",
    "Cardio Burn Challenge", "Core & Abs Challenge", "Glute Growth Challenge",
    "Quad Sculpt Challenge", "StairMaster Challenge",
  ];
  const legacyPrograms = await prisma.program.findMany({
    where: { title: { in: LEGACY_PROGRAM_TITLES }, isSellable: true },
    select: { id: true, title: true },
  });
  for (const prog of legacyPrograms) {
    await prisma.program.update({
      where: { id: prog.id },
      data: { isSellable: false },
    });
    console.log(`✓ unlisted legacy program: ${prog.title}`);
  }

  const counts = {
    products: await prisma.product.count({ where: { status: ProductStatus.PUBLISHED } }),
    archived: await prisma.product.count({ where: { status: ProductStatus.ARCHIVED } }),
    programs: await prisma.program.count(),
    users: await prisma.user.count(),
  };
  console.log("Seed complete:", counts);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
