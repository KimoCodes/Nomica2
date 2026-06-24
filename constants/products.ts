export type ProductCategory = "PROGRAM" | "CHALLENGE" | "TRACKER";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  category: ProductCategory;
  duration: string;
  commitment: string;
  level: string;
  equipment: string;
  features: string[];
  highlights: { label: string; value: string }[];
  phases: {
    name: string;
    description: string;
    workoutCount: number;
  }[];
  sampleExercises: { name: string; duration: string }[];
};

export const PRODUCTS: Product[] = [
  {
    id: "glute-sculpt-12wk",
    slug: "glute-sculpt-12-week",
    name: "12-Week Glute Sculpt",
    tagline: "Build sculpted, powerful glutes",
    description:
      "The program that started it all. 12 weeks of progressive glute training designed to build strength, shape, and confidence. Video demos for every exercise. Coach support included.",
    price: 47,
    originalPrice: 67,
    category: "PROGRAM",
    duration: "12 weeks",
    commitment: "4 days/week, 50 min",
    level: "Intermediate",
    equipment: "Full Gym",
    features: [
      "48 workout videos",
      "Progressive overload system",
      "Video demos for all exercises",
      "Coach feedback on form",
      "Progress tracking dashboard",
      "Private community access",
    ],
    highlights: [
      { label: "Programs Completed", value: "4,200+" },
      { label: "Avg. Results", value: '+3" hips, -4" waist' },
      { label: "Satisfaction", value: "4.9/5 stars" },
    ],
    phases: [
      {
        name: "Foundation Phase",
        description: "Build a solid base with proper form and activation",
        workoutCount: 16,
      },
      {
        name: "Build Phase",
        description: "Increase intensity and progressive overload",
        workoutCount: 16,
      },
      {
        name: "Peak Phase",
        description: "Push your limits for maximum results",
        workoutCount: 16,
      },
    ],
    sampleExercises: [
      { name: "Hip Thrust", duration: "0:45" },
      { name: "Glute Bridge", duration: "0:32" },
      { name: "Romanian Deadlift", duration: "1:12" },
      { name: "Hip Abduction", duration: "0:28" },
    ],
  },
  {
    id: "beginner-gym-guide",
    slug: "beginner-gym-guide",
    name: "Beginner Gym Guide",
    tagline: "Walk into any gym with confidence",
    description:
      "New to the gym or returning after a break? This guide teaches you every piece of equipment, proper form, and gives you a structured plan to build confidence and results.",
    price: 37,
    originalPrice: 47,
    category: "PROGRAM",
    duration: "8 weeks",
    commitment: "3 days/week, 45 min",
    level: "Beginner",
    equipment: "Full Gym",
    features: [
      "24 workout videos",
      "Gym equipment walkthrough",
      "Form basics for every lift",
      "Starter weight recommendations",
      "Progress tracking",
      "Beginner modifications",
    ],
    highlights: [
      { label: "Beginners Trained", value: "1,800+" },
      { label: "Confidence Gain", value: "97% report" },
      { label: "Satisfaction", value: "4.8/5 stars" },
    ],
    phases: [
      {
        name: "Learn the Ropes",
        description: "Master equipment and basic movements",
        workoutCount: 8,
      },
      {
        name: "Build Consistency",
        description: "Establish your routine and form",
        workoutCount: 8,
      },
      {
        name: "Level Up",
        description: "Progress to intermediate lifts",
        workoutCount: 8,
      },
    ],
    sampleExercises: [
      { name: "Goblet Squat", duration: "0:38" },
      { name: "Dumbbell Press", duration: "0:42" },
      { name: "Cable Row", duration: "0:35" },
      { name: "Leg Press", duration: "0:40" },
    ],
  },
  {
    id: "stairmaster-program",
    slug: "stairmaster-program",
    name: "Stairmaster Program",
    tagline: "The ultimate lower body cardio sculptor",
    description:
      "4 weeks of targeted stairmaster routines designed to burn fat, build glutes, and boost cardiovascular fitness. Heart rate zone training included.",
    price: 27,
    originalPrice: 37,
    category: "PROGRAM",
    duration: "4 weeks",
    commitment: "5 days/week, 30 min",
    level: "All Levels",
    equipment: "Stairmaster",
    features: [
      "16 stairmaster routines",
      "Heart rate zone training",
      "Progressive difficulty levels",
      "Glute activation warm-ups",
      "Calorie burn tracker",
    ],
    highlights: [
      { label: "Completed By", value: "2,100+" },
      { label: "Avg. Calorie Burn", value: "400+ per session" },
      { label: "Satisfaction", value: "4.7/5 stars" },
    ],
    phases: [
      {
        name: "Zone 1-2 Base",
        description: "Build aerobic foundation",
        workoutCount: 4,
      },
      {
        name: "Zone 2-3 Build",
        description: "Increase intensity and fat burn",
        workoutCount: 4,
      },
      {
        name: "Zone 3-4 Peak",
        description: "Maximum calorie burn and conditioning",
        workoutCount: 4,
      },
    ],
    sampleExercises: [
      { name: "Steady State Climb", duration: "0:30" },
      { name: "Interval Sprint", duration: "0:25" },
      { name: "Side Step", duration: "0:28" },
      { name: "Kickback Climb", duration: "0:32" },
    ],
  },
  {
    id: "14-day-booty-challenge",
    slug: "14-day-booty-challenge",
    name: "14-Day Booty Challenge",
    tagline: "14 days to wake up your glutes",
    description:
      "Quick, effective, and beginner-friendly. 14 daily workouts that activate and sculpt your glutes using bodyweight and resistance bands.",
    price: 14,
    originalPrice: 19,
    category: "CHALLENGE",
    duration: "14 days",
    commitment: "5 days/week, 30 min",
    level: "Beginner",
    equipment: "Minimal (bands optional)",
    features: [
      "14 daily workout videos",
      "Bodyweight + band exercises",
      "Daily motivation emails",
      "Community challenge group",
      "Beginner-friendly modifications",
    ],
    highlights: [
      { label: "Challenge Completed", value: "3,500+" },
      { label: "Completion Rate", value: "92%" },
      { label: "Satisfaction", value: "4.9/5 stars" },
    ],
    phases: [
      {
        name: "Wake Up (Days 1-5)",
        description: "Activate dormant glute muscles",
        workoutCount: 5,
      },
      {
        name: "Build (Days 6-10)",
        description: "Increase volume and intensity",
        workoutCount: 5,
      },
      {
        name: "Sculpt (Days 11-14)",
        description: "Peak burn for visible results",
        workoutCount: 4,
      },
    ],
    sampleExercises: [
      { name: "Banded Squat", duration: "0:35" },
      { name: "Glute Bridge Pulse", duration: "0:28" },
      { name: "Fire Hydrant", duration: "0:22" },
      { name: "Clamshell", duration: "0:25" },
    ],
  },
  {
    id: "workout-tracker",
    slug: "nomica-workout-tracker",
    name: "NOMICA Workout Tracker",
    tagline: "Track every rep, see every gain",
    description:
      "Your digital workout journal. Log exercises, track progress, organize photos, and see your monthly progress reports.",
    price: 12,
    originalPrice: 17,
    category: "TRACKER",
    duration: "Lifetime",
    commitment: "N/A",
    level: "All Levels",
    equipment: "Any",
    features: [
      "Digital workout journal",
      "Progress photo organizer",
      "Measurement tracker",
      "1RM calculator",
      "Monthly progress reports",
      "Export your data",
    ],
    highlights: [
      { label: "Active Users", value: "5,000+" },
      { label: "Workouts Logged", value: "150,000+" },
      { label: "Satisfaction", value: "4.8/5 stars" },
    ],
    phases: [],
    sampleExercises: [],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function formatProductPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}
