import "dotenv/config";
import {
  Difficulty,
  MuscleGroup,
  PrismaClient,
  ProductFocus,
  ProductKind,
  Role,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
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
// Exercise library (system exercises, coachId: null)
// ---------------------------------------------------------------------------

type ExerciseSeed = {
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  instructions: string;
};

const EXERCISES: ExerciseSeed[] = [
  // Glutes
  { name: "Barbell hip thrust", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Upper back on bench, bar over hips, drive through heels until hips lock out, squeeze glutes at the top." },
  { name: "Romanian deadlift", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Soft knees, hinge at hips pushing them back, keep bar close to legs, feel stretch in hamstrings, return to standing." },
  { name: "Cable kickback", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "Ankle cuff on low pulley, hinge slightly forward, kick leg back and up with control, squeeze glute at end range." },
  { name: "Bulgarian split squat", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Rear foot elevated on bench, drop back knee toward floor, keep front shin vertical, drive through front heel." },
  { name: "Glute bridge", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "Lie on back, knees bent, drive hips to ceiling squeezing glutes, pause, lower with control." },
  { name: "Sumo deadlift", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Wide stance, toes out, grip inside knees, brace and stand by driving hips forward." },
  { name: "Frog pump", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "Soles of feet together, knees out, pump hips up squeezing glutes at the top of each rep." },
  { name: "Hip abduction machine", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "Sit tall, push knees apart against the pads, pause at full spread, return slowly." },
  // Legs
  { name: "Barbell back squat", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.INTERMEDIATE, instructions: "Bar on upper back, feet shoulder-width, sit hips back and down keeping chest up, drive through mid-foot to stand." },
  { name: "Leg press", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Feet shoulder-width on platform, lower until knees near 90 degrees, press without locking knees hard." },
  { name: "Walking lunge", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Step forward into a lunge, back knee drops toward floor, push through front heel to the next step." },
  { name: "Leg extension", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Pad on shins, extend knees fully, squeeze quads at the top, lower under control." },
  { name: "Seated leg curl", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Pad above heels, curl legs under seat, pause, resist on the way back." },
  { name: "Goblet squat", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Hold dumbbell at chest, squat between knees keeping torso tall, drive up through heels." },
  { name: "Standing calf raise", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Balls of feet on ledge, rise as high as possible, pause, lower heels below the ledge for a stretch." },
  { name: "Adductor machine", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Sit tall, squeeze knees together against the pads, pause, return slowly." },
  { name: "Step-up", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Whole foot on box, drive through the top leg to stand tall, lower slowly without pushing off the floor." },
  // Back
  { name: "Lat pulldown", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.BEGINNER, instructions: "Grip bar slightly wider than shoulders, pull elbows down to ribs, squeeze shoulder blades, control the return." },
  { name: "Seated cable row", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.BEGINNER, instructions: "Sit tall, pull handle to lower ribs, squeeze shoulder blades together, extend arms with control." },
  { name: "Single-arm dumbbell row", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.BEGINNER, instructions: "Hand and knee on bench, pull dumbbell to hip, keep torso square, lower with control." },
  { name: "Assisted pull-up", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.INTERMEDIATE, instructions: "Knees on assist pad, pull chin over bar leading with chest, lower slowly to full hang." },
  { name: "Straight-arm pulldown", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.BEGINNER, instructions: "Arms straight, sweep bar from shoulder height to thighs, feel lats work, return with control." },
  // Shoulders
  { name: "Dumbbell shoulder press", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.BEGINNER, instructions: "Dumbbells at shoulder height, press overhead without arching lower back, lower with control." },
  { name: "Lateral raise", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.BEGINNER, instructions: "Slight bend in elbows, raise dumbbells to shoulder height leading with elbows, lower slowly." },
  { name: "Face pull", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.BEGINNER, instructions: "Rope at face height, pull toward forehead spreading the rope, squeeze rear delts." },
  { name: "Rear delt fly", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.BEGINNER, instructions: "Hinge forward, raise dumbbells out to the sides with soft elbows, squeeze rear delts at the top." },
  // Chest & arms
  { name: "Push-up", muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.BEGINNER, instructions: "Hands shoulder-width apart, body in a straight line, lower chest to floor and press back up." },
  { name: "Incline dumbbell press", muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.INTERMEDIATE, instructions: "Bench at 30-45 degrees, press dumbbells up over chest, lower until elbows are just below shoulder line." },
  { name: "Cable chest fly", muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.BEGINNER, instructions: "Cables at chest height, bring hands together in a hugging arc, control the stretch on the return." },
  { name: "Biceps curl", muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.BEGINNER, instructions: "Elbows pinned to sides, curl dumbbells up without swinging, lower slowly." },
  { name: "Triceps rope pushdown", muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.BEGINNER, instructions: "Elbows tucked, push rope down and apart until arms are straight, control the return." },
  // Core
  { name: "Plank", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Forearms on floor, body straight from head to heels, brace core and glutes, breathe steadily." },
  { name: "Dead bug", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "On back, arms up, knees at 90, lower opposite arm and leg keeping lower back pressed down." },
  { name: "Hanging knee raise", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.INTERMEDIATE, instructions: "Hang from bar, curl knees to chest without swinging, lower slowly." },
  { name: "Cable crunch", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Kneel below rope, crunch ribs toward hips keeping hips still, return with control." },
  { name: "Russian twist", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Seated, lean back slightly, rotate torso side to side with control, keep chest tall." },
  { name: "Side plank", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Forearm under shoulder, hips stacked and lifted, hold a straight line, breathe steadily." },
  // Cardio / conditioning
  { name: "Treadmill run", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Maintain upright posture, land softly under hips, use a sustainable pace for the prescribed duration." },
  { name: "Incline treadmill walk", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Set incline 10-15%, walk briskly without holding the rails, keep tall posture." },
  { name: "StairMaster climb", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Steady step rhythm, light fingertip support only, full foot on each step, maintain the prescribed pace." },
  { name: "Rowing machine", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Drive with legs, then lean back, then pull handle to ribs; reverse the sequence on the return." },
  { name: "Assault bike", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.INTERMEDIATE, instructions: "Push and pull the handles while pedaling, keep intervals at the prescribed effort." },
  { name: "Jump rope", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Small hops on the balls of feet, wrists turn the rope, keep elbows close to ribs." },
  { name: "Burpee", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.INTERMEDIATE, instructions: "Squat, kick feet back to plank, chest to floor, jump feet in and leap up with arms overhead." },
  // Mobility
  { name: "World's greatest stretch", muscleGroup: MuscleGroup.MOBILITY, difficulty: Difficulty.BEGINNER, instructions: "Deep lunge, hand inside front foot, rotate chest to ceiling reaching up, switch sides." },
  { name: "90/90 hip switch", muscleGroup: MuscleGroup.MOBILITY, difficulty: Difficulty.BEGINNER, instructions: "Sit with both knees at 90 degrees, rotate knees side to side keeping chest tall." },
];

// ---------------------------------------------------------------------------
// Day templates: named exercise blocks used to generate program content
// ---------------------------------------------------------------------------

type DayTemplate = {
  title: string;
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: number;
    duration?: number; // seconds, for timed work
    restSeconds?: number;
    notes?: string;
  }>;
};

const DAY_TEMPLATES: Record<string, DayTemplate> = {
  gluteStrength: {
    title: "Glute Strength",
    exercises: [
      { name: "Barbell hip thrust", sets: 4, reps: 8, restSeconds: 120, notes: "2s pause at lockout" },
      { name: "Romanian deadlift", sets: 3, reps: 10, restSeconds: 90 },
      { name: "Bulgarian split squat", sets: 3, reps: 10, restSeconds: 90, notes: "Per leg" },
      { name: "Hip abduction machine", sets: 3, reps: 15, restSeconds: 60 },
      { name: "Frog pump", sets: 2, reps: 20, restSeconds: 45, notes: "Burnout" },
    ],
  },
  glutePump: {
    title: "Glute Pump & Isolation",
    exercises: [
      { name: "Glute bridge", sets: 3, reps: 15, restSeconds: 60 },
      { name: "Cable kickback", sets: 3, reps: 12, restSeconds: 60, notes: "Per leg" },
      { name: "Sumo deadlift", sets: 3, reps: 8, restSeconds: 120 },
      { name: "Hip abduction machine", sets: 3, reps: 20, restSeconds: 45 },
      { name: "Incline treadmill walk", duration: 600, notes: "Finisher: 10 min steady" },
    ],
  },
  quadFocus: {
    title: "Quad Focus",
    exercises: [
      { name: "Barbell back squat", sets: 4, reps: 8, restSeconds: 120 },
      { name: "Leg press", sets: 3, reps: 12, restSeconds: 90, notes: "Feet low and narrow" },
      { name: "Walking lunge", sets: 3, reps: 12, restSeconds: 90, notes: "Per leg" },
      { name: "Leg extension", sets: 3, reps: 15, restSeconds: 60, notes: "Slow negatives" },
      { name: "Standing calf raise", sets: 3, reps: 15, restSeconds: 45 },
    ],
  },
  hamstringsInnerThigh: {
    title: "Hamstrings & Inner Thigh",
    exercises: [
      { name: "Romanian deadlift", sets: 4, reps: 10, restSeconds: 120 },
      { name: "Seated leg curl", sets: 3, reps: 12, restSeconds: 90 },
      { name: "Adductor machine", sets: 3, reps: 15, restSeconds: 60 },
      { name: "Step-up", sets: 3, reps: 10, restSeconds: 90, notes: "Per leg" },
      { name: "Standing calf raise", sets: 3, reps: 20, restSeconds: 45 },
    ],
  },
  upperPush: {
    title: "Shoulders & Upper Body Push",
    exercises: [
      { name: "Dumbbell shoulder press", sets: 4, reps: 10, restSeconds: 90 },
      { name: "Incline dumbbell press", sets: 3, reps: 10, restSeconds: 90 },
      { name: "Lateral raise", sets: 3, reps: 15, restSeconds: 60 },
      { name: "Triceps rope pushdown", sets: 3, reps: 12, restSeconds: 60 },
      { name: "Push-up", sets: 2, reps: 12, restSeconds: 60, notes: "To technical failure" },
    ],
  },
  upperPull: {
    title: "Back & Upper Body Pull",
    exercises: [
      { name: "Lat pulldown", sets: 4, reps: 10, restSeconds: 90 },
      { name: "Seated cable row", sets: 3, reps: 10, restSeconds: 90 },
      { name: "Face pull", sets: 3, reps: 15, restSeconds: 60 },
      { name: "Rear delt fly", sets: 3, reps: 15, restSeconds: 60 },
      { name: "Biceps curl", sets: 3, reps: 12, restSeconds: 60 },
    ],
  },
  fullBody: {
    title: "Full-Body Strength",
    exercises: [
      { name: "Goblet squat", sets: 4, reps: 10, restSeconds: 90 },
      { name: "Single-arm dumbbell row", sets: 3, reps: 10, restSeconds: 90, notes: "Per arm" },
      { name: "Romanian deadlift", sets: 3, reps: 10, restSeconds: 90 },
      { name: "Dumbbell shoulder press", sets: 3, reps: 10, restSeconds: 90 },
      { name: "Plank", sets: 3, duration: 45, restSeconds: 45 },
    ],
  },
  fullBodyConditioning: {
    title: "Strength & Conditioning Circuit",
    exercises: [
      { name: "Walking lunge", sets: 3, reps: 12, restSeconds: 60, notes: "Per leg" },
      { name: "Push-up", sets: 3, reps: 10, restSeconds: 60 },
      { name: "Seated cable row", sets: 3, reps: 12, restSeconds: 60 },
      { name: "Burpee", sets: 3, reps: 10, restSeconds: 60 },
      { name: "Rowing machine", duration: 600, notes: "Finisher: 10 min moderate" },
    ],
  },
  beginnerFoundations: {
    title: "Foundations Session",
    exercises: [
      { name: "Goblet squat", sets: 3, reps: 10, restSeconds: 90, notes: "Focus on depth and control" },
      { name: "Lat pulldown", sets: 3, reps: 10, restSeconds: 90 },
      { name: "Glute bridge", sets: 3, reps: 12, restSeconds: 60 },
      { name: "Dead bug", sets: 3, reps: 10, restSeconds: 45, notes: "Per side" },
      { name: "Incline treadmill walk", duration: 600, notes: "Cool-down: 10 min easy" },
    ],
  },
  beginnerMachines: {
    title: "Machine Confidence",
    exercises: [
      { name: "Leg press", sets: 3, reps: 12, restSeconds: 90 },
      { name: "Seated cable row", sets: 3, reps: 12, restSeconds: 90 },
      { name: "Leg extension", sets: 2, reps: 15, restSeconds: 60 },
      { name: "Seated leg curl", sets: 2, reps: 15, restSeconds: 60 },
      { name: "Plank", sets: 3, duration: 30, restSeconds: 45 },
    ],
  },
  cardioIntervals: {
    title: "Cardio Intervals",
    exercises: [
      { name: "Treadmill run", duration: 1200, notes: "1 min brisk / 1 min easy x 10" },
      { name: "Jump rope", sets: 4, duration: 60, restSeconds: 60 },
      { name: "Assault bike", sets: 5, duration: 30, restSeconds: 90, notes: "Hard effort sprints" },
    ],
  },
  cardioSteady: {
    title: "Steady-State Conditioning",
    exercises: [
      { name: "Incline treadmill walk", duration: 1800, notes: "30 min steady, incline 10-12%" },
      { name: "Russian twist", sets: 3, reps: 20, restSeconds: 45 },
      { name: "World's greatest stretch", sets: 2, reps: 6, restSeconds: 30, notes: "Per side" },
    ],
  },
  coreCircuit: {
    title: "Core Circuit",
    exercises: [
      { name: "Plank", sets: 3, duration: 45, restSeconds: 45 },
      { name: "Dead bug", sets: 3, reps: 10, restSeconds: 45, notes: "Per side" },
      { name: "Cable crunch", sets: 3, reps: 15, restSeconds: 60 },
      { name: "Russian twist", sets: 3, reps: 20, restSeconds: 45 },
      { name: "Side plank", sets: 2, duration: 30, restSeconds: 45, notes: "Per side" },
    ],
  },
  coreProgression: {
    title: "Core Strength Progression",
    exercises: [
      { name: "Hanging knee raise", sets: 3, reps: 10, restSeconds: 90 },
      { name: "Cable crunch", sets: 3, reps: 12, restSeconds: 60 },
      { name: "Side plank", sets: 3, duration: 40, restSeconds: 45, notes: "Per side" },
      { name: "Dead bug", sets: 3, reps: 12, restSeconds: 45, notes: "Per side" },
    ],
  },
  stairmasterClimb: {
    title: "Climb Session",
    exercises: [
      { name: "StairMaster climb", duration: 1500, notes: "25 min at the prescribed pace for this week" },
      { name: "Standing calf raise", sets: 3, reps: 15, restSeconds: 45 },
      { name: "90/90 hip switch", sets: 2, reps: 8, restSeconds: 30, notes: "Per side" },
    ],
  },
  activeRecovery: {
    title: "Active Recovery & Mobility",
    exercises: [
      { name: "Incline treadmill walk", duration: 1200, notes: "20 min easy pace" },
      { name: "World's greatest stretch", sets: 2, reps: 6, restSeconds: 30, notes: "Per side" },
      { name: "90/90 hip switch", sets: 2, reps: 8, restSeconds: 30, notes: "Per side" },
    ],
  },
};

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
  /** Weekly rotation of day templates (weekly programs) */
  weekPattern?: string[];
  /** Total days + rotation (day-based challenges) */
  dayPattern?: string[];
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
    weekPattern: ["gluteStrength", "quadFocus", "glutePump", "upperPull", "hamstringsInnerThigh"],
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
    weekPattern: ["gluteStrength", "upperPush", "glutePump", "upperPull", "coreCircuit"],
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
    weekPattern: ["quadFocus", "hamstringsInnerThigh", "cardioSteady", "quadFocus", "glutePump"],
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
    weekPattern: ["fullBody", "upperPush", "gluteStrength", "fullBodyConditioning", "upperPull"],
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
    weekPattern: ["beginnerFoundations", "beginnerMachines", "activeRecovery", "beginnerFoundations", "beginnerMachines"],
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
    weekPattern: ["fullBody", "gluteStrength", "cardioIntervals", "upperPush", "fullBodyConditioning"],
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
    dayPattern: ["cardioIntervals", "cardioSteady", "activeRecovery"],
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
    dayPattern: ["coreCircuit", "coreProgression", "activeRecovery"],
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
    dayPattern: ["glutePump", "gluteStrength", "activeRecovery"],
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
    dayPattern: ["quadFocus", "cardioSteady", "activeRecovery"],
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
    dayPattern: ["stairmasterClimb", "stairmasterClimb", "activeRecovery"],
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
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // 1. System exercises
  const exerciseIdByName = new Map<string, string>();
  for (const exercise of EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name, coachId: null },
    });
    const row =
      existing ??
      (await prisma.exercise.create({ data: { ...exercise, coachId: null } }));
    exerciseIdByName.set(row.name, row.id);
  }
  console.log(`✓ ${EXERCISES.length} system exercises`);

  // 2. NOMICA head-coach account that owns catalog programs
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

  // 3. Programs + Products
  for (const def of PROGRAMS) {
    const existingProduct = await prisma.product.findUnique({ where: { slug: def.slug } });
    if (existingProduct) continue;

    // Build week/day plan
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

    for (let w = 1; w <= totalWeeks; w++) {
      const week = await prisma.programWeek.create({
        data: { programId: program.id, weekNumber: w, title: `Week ${w}` },
      });

      const dayTemplates: string[] = [];
      if (def.weekPattern) {
        dayTemplates.push(...def.weekPattern);
      } else if (def.dayPattern) {
        // Day-based challenge: 7 slots/week until durationDays reached, rotating pattern
        const total = def.durationDays ?? 21;
        const start = (w - 1) * 7;
        for (let d = 0; d < 7 && start + d < total; d++) {
          dayTemplates.push(def.dayPattern[(start + d) % def.dayPattern.length]);
        }
      }

      for (let d = 0; d < dayTemplates.length; d++) {
        const template = DAY_TEMPLATES[dayTemplates[d]];
        const day = await prisma.programDay.create({
          data: { weekId: week.id, dayNumber: d + 1, title: template.title },
        });
        await prisma.programExercise.createMany({
          data: template.exercises.map((ex, i) => {
            const exerciseId = exerciseIdByName.get(ex.name);
            if (!exerciseId) throw new Error(`Unknown exercise in template: ${ex.name}`);
            return {
              dayId: day.id,
              exerciseId,
              order: i + 1,
              sets: ex.sets ?? null,
              reps: ex.reps ?? null,
              duration: ex.duration ?? null,
              restSeconds: ex.restSeconds ?? null,
              notes: ex.notes ?? null,
            };
          }),
        });
      }
    }

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

  // 4. Bundles
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
    exercises: await prisma.exercise.count(),
    users: await prisma.user.count(),
  };
  console.log("Seed complete:", counts);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
