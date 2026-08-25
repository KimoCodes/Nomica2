import "dotenv/config";
import {
  Difficulty,
  PrismaClient,
  ProductFocus,
  ProductKind,
  Role,
} from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashSync } from "bcrypt";

/**
 * Seed data source of truth: NOMICA_Fitness_Catalog.pdf
 * - 6 signature programs (one-time purchase)
 * - 5 focused challenges
 * - 3 bundles
 * Program workout content (weeks/days/exercises) is generated from
 * per-program day templates so every product is browsable and trainable
 * end-to-end in development.
 */

const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Catalog definition (NOMICA_Fitness_Catalog.pdf)
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
  sortOrder: number;
};

const SIGNATURE_FEATURES = [
  "Workout plans with video demonstrations",
  "Progressive overload built into every week",
  "Modifications for every fitness level",
  "Mobile-friendly workout player",
  "Lifetime access — one-time purchase",
];

const CHALLENGE_FEATURES = [
  "Short daily sessions that stack into results",
  "Progress tracking and streaks",
  "Works alongside any signature program",
  "Lifetime access — one-time purchase",
];

const PROGRAMS: ProgramProduct[] = [
  {
    slug: "glute-builder",
    kind: ProductKind.PROGRAM,
    name: "Glute Builder",
    tagline: "Progressive glute training for strength, shape, and lower-body confidence.",
    priceCents: 3499,
    durationLabel: "8 weeks",
    durationWeeks: 8,
    daysPerWeek: 5,
    difficulty: Difficulty.INTERMEDIATE,
    features: SIGNATURE_FEATURES,
    sortOrder: 1,
  },
  {
    slug: "hourglass-sculpt",
    kind: ProductKind.PROGRAM,
    name: "Hourglass Sculpt",
    tagline: "A balanced plan emphasizing glutes, shoulders, back, and core strength.",
    priceCents: 3499,
    durationLabel: "8 weeks",
    durationWeeks: 8,
    daysPerWeek: 5,
    difficulty: Difficulty.INTERMEDIATE,
    features: SIGNATURE_FEATURES,
    sortOrder: 2,
  },
  {
    slug: "toned-legs",
    kind: ProductKind.PROGRAM,
    name: "Toned Legs",
    tagline: "Focused work for quads, hamstrings, calves, and inner thighs.",
    priceCents: 2499,
    durationLabel: "6 weeks",
    durationWeeks: 6,
    daysPerWeek: 5,
    difficulty: Difficulty.BEGINNER,
    features: SIGNATURE_FEATURES,
    sortOrder: 3,
  },
  {
    slug: "full-body-sculpt",
    kind: ProductKind.PROGRAM,
    name: "Full-Body Sculpt",
    tagline: "Total-body strength and conditioning for a strong, athletic feel.",
    priceCents: 3499,
    durationLabel: "8 weeks",
    durationWeeks: 8,
    daysPerWeek: 5,
    difficulty: Difficulty.INTERMEDIATE,
    features: SIGNATURE_FEATURES,
    sortOrder: 4,
  },
  {
    slug: "beginner-gym-confidence",
    kind: ProductKind.PROGRAM,
    name: "Beginner Gym Confidence",
    tagline: "Simple, guided sessions that build consistency and comfort in the gym.",
    priceCents: 2499,
    durationLabel: "6 weeks",
    durationWeeks: 6,
    daysPerWeek: 5,
    difficulty: Difficulty.BEGINNER,
    features: [
      "Step-by-step guidance for every machine and movement",
      ...SIGNATURE_FEATURES.slice(1),
    ],
    sortOrder: 5,
  },
  {
    slug: "strong-and-toned",
    kind: ProductKind.PROGRAM,
    name: "Strong & Toned",
    tagline: "A progressive full-body program combining strength, sculpting, and conditioning.",
    priceCents: 3999,
    durationLabel: "8 weeks",
    durationWeeks: 8,
    daysPerWeek: 5,
    difficulty: Difficulty.ADVANCED,
    features: SIGNATURE_FEATURES,
    sortOrder: 6,
  },
  // Focused Series
  {
    slug: "cardio-burn-challenge",
    kind: ProductKind.CHALLENGE,
    name: "Cardio Burn Challenge",
    tagline: "Conditioning sessions with approachable intensity options.",
    priceCents: 1299,
    durationLabel: "21 days",
    durationDays: 21,
    focus: ProductFocus.SWEAT,
    difficulty: Difficulty.BEGINNER,
    features: CHALLENGE_FEATURES,
    sortOrder: 10,
  },
  {
    slug: "core-abs-challenge",
    kind: ProductKind.CHALLENGE,
    name: "Core & Abs Challenge",
    tagline: "Core strength, stability, and controlled ab training.",
    priceCents: 1299,
    durationLabel: "21 days",
    durationDays: 21,
    focus: ProductFocus.SCULPT,
    difficulty: Difficulty.BEGINNER,
    features: CHALLENGE_FEATURES,
    sortOrder: 11,
  },
  {
    slug: "glute-growth-challenge",
    kind: ProductKind.CHALLENGE,
    name: "Glute Growth Challenge",
    tagline: "Activation, strength, and progressive glute-focused sessions.",
    priceCents: 1299,
    durationLabel: "21 days",
    durationDays: 21,
    focus: ProductFocus.SCULPT,
    difficulty: Difficulty.INTERMEDIATE,
    features: CHALLENGE_FEATURES,
    sortOrder: 12,
  },
  {
    slug: "quad-sculpt-challenge",
    kind: ProductKind.CHALLENGE,
    name: "Quad Sculpt Challenge",
    tagline: "Quad-focused lower-body sessions with progressive volume.",
    priceCents: 1299,
    durationLabel: "21 days",
    durationDays: 21,
    focus: ProductFocus.SCULPT,
    difficulty: Difficulty.INTERMEDIATE,
    features: CHALLENGE_FEATURES,
    sortOrder: 13,
  },
  {
    slug: "stairmaster-challenge",
    kind: ProductKind.CHALLENGE,
    name: "StairMaster Challenge",
    tagline: "A structured climb progression for stamina and lower-body conditioning.",
    priceCents: 1499,
    durationLabel: "30 days",
    durationDays: 30,
    focus: ProductFocus.CLIMB,
    difficulty: Difficulty.BEGINNER,
    features: CHALLENGE_FEATURES,
    sortOrder: 14,
  },
];

const BUNDLES = [
  {
    slug: "lower-body-bundle",
    name: "Lower-Body Bundle",
    tagline: "Glute Builder + Toned Legs + Glute Growth and Quad Sculpt challenges",
    priceCents: 5499,
    items: ["glute-builder", "toned-legs", "glute-growth-challenge", "quad-sculpt-challenge"],
    sortOrder: 20,
  },
  {
    slug: "sculpt-and-sweat-bundle",
    name: "Sculpt & Sweat Bundle",
    tagline: "Hourglass Sculpt + Full-Body Sculpt + Cardio Burn and Core & Abs challenges",
    priceCents: 5999,
    items: ["hourglass-sculpt", "full-body-sculpt", "cardio-burn-challenge", "core-abs-challenge"],
    sortOrder: 21,
  },
  {
    slug: "complete-nomica-bundle",
    name: "Complete NOMICA Bundle",
    tagline: "All 6 signature programs + all 5 focused challenges",
    priceCents: 11999,
    items: PROGRAMS.map((p) => p.slug),
    sortOrder: 22,
  },
];

// ---------------------------------------------------------------------------

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  // 1. NOMICA head-coach account that owns catalog programs
  const nomicaCoach = await prisma.user.upsert({
    where: { email: "coach@nomica.fit" },
    update: {},
    create: {
      email: "coach@nomica.fit",
      name: "NOMICA Coaching",
      password: hashSync("ChangeMe123!", BCRYPT_ROUNDS),
      role: Role.COACH,
      emailVerified: new Date(),
      coachProfile: {
        create: {
          bio: "The official NOMICA coaching team. Programs designed around the goals women ask for most.",
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
    nomicaCoach.coachProfile?.id ??
    (await prisma.coachProfile.findUniqueOrThrow({ where: { userId: nomicaCoach.id } })).id;
  console.log("✓ NOMICA head coach");

  // 2. Programs + Products
  for (const def of PROGRAMS) {
    const existingProduct = await prisma.product.findUnique({ where: { slug: def.slug } });
    if (existingProduct) continue;

    const totalWeeks = def.durationWeeks ?? Math.ceil((def.durationDays ?? 21) / 7);
    const program = await prisma.program.create({
      data: {
        title: def.name,
        description: def.tagline,
        coachId: coachProfileId,
        isTemplate: true,
        isSellable: true,
        price: def.priceCents,
        features: def.features,
        difficulty: def.difficulty,
        duration: totalWeeks,
      },
    });

    await prisma.product.create({
      data: {
        slug: def.slug,
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
        sortOrder: def.sortOrder,
        programId: program.id,
      },
    });
    console.log(`✓ ${def.kind.toLowerCase()}: ${def.name}`);
  }

  // 3. Bundles
  for (const def of BUNDLES) {
    const existing = await prisma.product.findUnique({ where: { slug: def.slug } });
    if (existing) continue;

    const items = await prisma.product.findMany({
      where: { slug: { in: def.items } },
      select: { id: true, priceCents: true },
    });
    if (items.length !== def.items.length) {
      throw new Error(`Bundle ${def.slug}: missing child products`);
    }
    const compareAt = items.reduce((sum, p) => sum + p.priceCents, 0);

    await prisma.product.create({
      data: {
        slug: def.slug,
        kind: ProductKind.BUNDLE,
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
        sortOrder: def.sortOrder,
        bundleItems: {
          create: items.map((item) => ({ itemId: item.id })),
        },
      },
    });
    console.log(`✓ bundle: ${def.name}`);
  }

  const counts = {
    products: await prisma.product.count(),
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
