export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  type: "info" | "question" | "selection" | "confirmation";
  options?: { value: string; label: string; description?: string }[];
  required?: boolean;
};

export type OnboardingData = {
  fitnessGoal?: string;
  experienceLevel?: string;
  equipment?: string;
  availableMinutes?: number;
  workoutDays?: number;
  injuries?: string[];
  preferences?: string[];
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to NomiTips",
    description: "Let's set up your personalized fitness journey. This will only take a minute.",
    type: "info",
  },
  {
    id: "goal",
    title: "What's your main goal?",
    description: "Choose the goal that matters most to you right now.",
    type: "selection",
    required: true,
    options: [
      { value: "LOSE_FAT", label: "Lose Fat", description: "Burn fat and get leaner" },
      { value: "MUSCLE_GAIN", label: "Build Muscle", description: "Gain strength and size" },
      { value: "STRENGTH", label: "Get Stronger", description: "Increase your lifting numbers" },
      { value: "GENERAL_FITNESS", label: "Stay Fit", description: "Overall health and wellness" },
    ],
  },
  {
    id: "experience",
    title: "How experienced are you?",
    description: "Be honest — there's no wrong answer.",
    type: "selection",
    required: true,
    options: [
      { value: "BEGINNER", label: "Beginner", description: "New to consistent training" },
      { value: "INTERMEDIATE", label: "Intermediate", description: "6+ months of regular training" },
      { value: "ADVANCED", label: "Advanced", description: "2+ years of serious training" },
    ],
  },
  {
    id: "equipment",
    title: "What equipment do you have?",
    description: "We'll tailor exercises to your setup.",
    type: "selection",
    required: true,
    options: [
      { value: "NONE", label: "None (Bodyweight)", description: "Just my body" },
      { value: "DUMBBELLS", label: "Dumbbells", description: "Basic dumbbell set" },
      { value: "HOME_GYM", label: "Home Gym", description: "Barbell, rack, bench" },
      { value: "COMMERCIAL_GYM", label: "Commercial Gym", description: "Full gym access" },
    ],
  },
  {
    id: "time",
    title: "How much time can you work out?",
    description: "We'll design workouts that fit your schedule.",
    type: "selection",
    required: true,
    options: [
      { value: "15", label: "15 minutes", description: "Quick and effective" },
      { value: "30", label: "30 minutes", description: "Balanced sessions" },
      { value: "45", label: "45 minutes", description: "Thorough workouts" },
      { value: "60", label: "60+ minutes", description: "Full training sessions" },
    ],
  },
  {
    id: "days",
    title: "How many days per week?",
    description: "Consistency beats intensity. Pick what's realistic.",
    type: "selection",
    required: true,
    options: [
      { value: "3", label: "3 days", description: "Minimum effective dose" },
      { value: "4", label: "4 days", description: "Great balance" },
      { value: "5", label: "5 days", description: "Serious commitment" },
      { value: "6", label: "6 days", description: "Maximum progress" },
    ],
  },
  {
    id: "injuries",
    title: "Any injuries or limitations?",
    description: "Select all that apply. We'll avoid problematic exercises.",
    type: "selection",
    options: [
      { value: "lower_back", label: "Lower Back", description: "" },
      { value: "knee", label: "Knees", description: "" },
      { value: "shoulder", label: "Shoulders", description: "" },
      { value: "wrist", label: "Wrists", description: "" },
      { value: "none", label: "None", description: "I'm good to go!" },
    ],
  },
  {
    id: "complete",
    title: "You're all set!",
    description: "Your personalized program is ready. Let's start your journey.",
    type: "confirmation",
  },
];

export function getStepIndex(stepId: string): number {
  return ONBOARDING_STEPS.findIndex((s) => s.id === stepId);
}

export function getNextStep(currentStepId: string): OnboardingStep | null {
  const currentIndex = getStepIndex(currentStepId);
  if (currentIndex === -1 || currentIndex >= ONBOARDING_STEPS.length - 1) return null;
  return ONBOARDING_STEPS[currentIndex + 1]!;
}

export function getPrevStep(currentStepId: string): OnboardingStep | null {
  const currentIndex = getStepIndex(currentStepId);
  if (currentIndex <= 0) return null;
  return ONBOARDING_STEPS[currentIndex - 1]!;
}

export function validateOnboardingData(data: OnboardingData): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  if (!data.fitnessGoal) missingFields.push("fitnessGoal");
  if (!data.experienceLevel) missingFields.push("experienceLevel");
  if (!data.equipment) missingFields.push("equipment");
  if (!data.availableMinutes) missingFields.push("availableMinutes");
  if (!data.workoutDays) missingFields.push("workoutDays");

  return { valid: missingFields.length === 0, missingFields };
}

export function getBeginnerWorkoutStructure(params: {
  equipment: string;
  minutes: number;
  daysPerWeek: number;
}): { dayName: string; focus: string; exercises: string[] }[] {
  const { equipment, daysPerWeek } = params;
  const isBodyweight = equipment === "NONE";

  const structures: Record<number, { dayName: string; focus: string; exercises: string[] }[]> = {
    3: [
      { dayName: "Day 1", focus: "Full Body A", exercises: isBodyweight ? ["Push-ups", "Bodyweight Squats", "Plank", "Lunges", "Glute Bridges"] : ["Goblet Squat", "Push-ups", "Dumbbell Row", "Plank", "Glute Bridges"] },
      { dayName: "Day 2", focus: "Full Body B", exercises: isBodyweight ? ["Diamond Push-ups", "Bulgarian Split Squats", "Superman", "Side Plank", "Step-ups"] : ["Dumbbell Press", "Romanian Deadlift", "Lateral Raise", "Ab Wheel", "Calf Raises"] },
      { dayName: "Day 3", focus: "Full Body C", exercises: isBodyweight ? ["Pike Push-ups", "Jump Squats", "Inverted Row", "Dead Bug", "Fire Hydrants"] : ["Dumbbell Curl", "Tricep Extension", "Goblet Squat", "Plank Variations", "Lunges"] },
    ],
    4: [
      { dayName: "Day 1", focus: "Upper Body", exercises: isBodyweight ? ["Push-ups", "Pike Push-ups", "Inverted Row", "Dips", "Plank"] : ["Dumbbell Press", "Dumbbell Row", "Lateral Raise", "Bicep Curl", "Tricep Extension"] },
      { dayName: "Day 2", focus: "Lower Body", exercises: isBodyweight ? ["Squats", "Lunges", "Glute Bridges", "Calf Raises", "Wall Sit"] : ["Goblet Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Calf Raises", "Leg Curl"] },
      { dayName: "Day 3", focus: "Upper Body", exercises: isBodyweight ? ["Wide Push-ups", "Chin-ups", "Pike Push-ups", "Diamond Push-ups", "Superman"] : ["Dumbbell Press", "Lat Pulldown", "Shoulder Press", "Hammer Curl", "Skull Crushers"] },
      { dayName: "Day 4", focus: "Lower Body", exercises: isBodyweight ? ["Jump Squats", "Walking Lunges", "Single Leg Bridge", "Side Lunges", "Calf Raises"] : ["Leg Press", "Romanian Deadlift", "Leg Extension", "Leg Curl", "Calf Raises"] },
    ],
    5: [
      { dayName: "Day 1", focus: "Chest & Triceps", exercises: isBodyweight ? ["Push-ups", "Diamond Push-ups", "Dips", "Incline Push-ups", "Tricep Extension"] : ["Bench Press", "Incline Dumbbell Press", "Cable Fly", "Tricep Pushdown", "Overhead Extension"] },
      { dayName: "Day 2", focus: "Back & Biceps", exercises: isBodyweight ? ["Inverted Row", "Chin-ups", "Superman", "Pull-ups", "Bicep Curl"] : ["Lat Pulldown", "Cable Row", "Face Pull", "Barbell Curl", "Hammer Curl"] },
      { dayName: "Day 3", focus: "Legs", exercises: isBodyweight ? ["Squats", "Lunges", "Glute Bridges", "Calf Raises", "Wall Sit"] : ["Squat", "Leg Press", "Romanian Deadlift", "Leg Extension", "Leg Curl"] },
      { dayName: "Day 4", focus: "Shoulders & Core", exercises: isBodyweight ? ["Pike Push-ups", "Side Plank", "Plank", "Mountain Climbers", "Russian Twist"] : ["Overhead Press", "Lateral Raise", "Face Pull", "Plank", "Ab Wheel"] },
      { dayName: "Day 5", focus: "Full Body", exercises: isBodyweight ? ["Burpees", "Jump Squats", "Push-ups", "Lunges", "Plank"] : ["Clean and Press", "Dumbbell Squat", "Bent-over Row", "Lateral Raise", "Plank"] },
    ],
  };

  return structures[daysPerWeek] ?? structures[3]!;
}
