import type { WorkoutHistoryEntry, HabitData, ReadinessScore } from "./types";

export type WorkoutRecommendation = {
  type: "strength" | "hypertrophy" | "endurance" | "recovery" | "rest";
  title: string;
  duration: number;
  intensity: "low" | "moderate" | "high";
  muscleGroups: string[];
  reason: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number | null;
    rest: number;
  }[];
};

const MUSCLE_GROUP_ROTATION = [
  "CHEST",
  "BACK",
  "LEGS",
  "SHOULDERS",
  "ARMS",
  "CORE",
];

function getLastWorkoutMuscleGroups(history: WorkoutHistoryEntry[]): Map<string, Date> {
  const lastPerMuscle = new Map<string, Date>();
  for (const entry of history) {
    for (const ex of entry.exercises) {
      const existing = lastPerMuscle.get(ex.muscleGroup);
      if (!existing || entry.completedAt > existing) {
        lastPerMuscle.set(ex.muscleGroup, entry.completedAt);
      }
    }
  }
  return lastPerMuscle;
}

function getDaysSince(date: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function getUndertrainedMuscleGroups(
  history: WorkoutHistoryEntry[],
): { muscleGroup: string; daysSince: number }[] {
  const lastWorkout = getLastWorkoutMuscleGroups(history);
  const undertrained: { muscleGroup: string; daysSince: number }[] = [];

  for (const group of MUSCLE_GROUP_ROTATION) {
    const lastDate = lastWorkout.get(group);
    if (!lastDate) {
      undertrained.push({ muscleGroup: group, daysSince: 999 });
    } else {
      const days = getDaysSince(lastDate);
      if (days >= 3) {
        undertrained.push({ muscleGroup: group, daysSince: days });
      }
    }
  }

  return undertrained.sort((a, b) => b.daysSince - a.daysSince);
}

function getRecentPerformanceTrend(
  history: WorkoutHistoryEntry[],
): "improving" | "stable" | "declining" {
  if (history.length < 4) return "stable";

  const recent4 = history.slice(0, 4);
  const older4 = history.slice(4, 8);

  if (older4.length === 0) return "stable";

  const recentAvg = recent4.reduce((sum, h) => {
    const totalReps = h.exercises.reduce((s, e) =>
      s + e.sets.reduce((ss, set) => ss + (set.completed ? set.actualReps ?? 0 : 0), 0), 0);
    return sum + totalReps;
  }, 0) / recent4.length;

  const olderAvg = older4.reduce((sum, h) => {
    const totalReps = h.exercises.reduce((s, e) =>
      s + e.sets.reduce((ss, set) => ss + (set.completed ? set.actualReps ?? 0 : 0), 0), 0);
    return sum + totalReps;
  }, 0) / older4.length;

  if (recentAvg > olderAvg * 1.1) return "improving";
  if (recentAvg < olderAvg * 0.9) return "declining";
  return "stable";
}

const STRENGTH_TEMPLATE = [
  { name: "Compound Press", sets: 4, reps: 5, weight: null, rest: 180 },
  { name: "Compound Pull", sets: 4, reps: 5, weight: null, rest: 180 },
  { name: "Accessory Push", sets: 3, reps: 8, weight: null, rest: 120 },
  { name: "Accessory Pull", sets: 3, reps: 8, weight: null, rest: 120 },
  { name: "Core", sets: 3, reps: 12, weight: null, rest: 60 },
];

const HYPERTROPHY_TEMPLATE = [
  { name: "Primary Lift", sets: 4, reps: 10, weight: null, rest: 90 },
  { name: "Secondary Lift", sets: 3, reps: 12, weight: null, rest: 75 },
  { name: "Isolation 1", sets: 3, reps: 15, weight: null, rest: 60 },
  { name: "Isolation 2", sets: 3, reps: 15, weight: null, rest: 60 },
  { name: "Core", sets: 3, reps: 15, weight: null, rest: 45 },
];

const RECOVERY_TEMPLATE = [
  { name: "Dynamic Stretch", sets: 1, reps: 10, weight: null, rest: 30 },
  { name: "Mobility Drill", sets: 2, reps: 8, weight: null, rest: 30 },
  { name: "Light Cardio", sets: 1, reps: 1, weight: null, rest: 0 },
  { name: "Static Stretch", sets: 1, reps: 1, weight: null, rest: 0 },
];

export function generateWorkoutRecommendation(params: {
  history: WorkoutHistoryEntry[];
  habits: HabitData[];
  readiness: ReadinessScore;
  goal: string | null;
}): WorkoutRecommendation {
  const { history, readiness, goal } = params;

  if (readiness.score < 30) {
    return {
      type: "rest",
      title: "Rest Day",
      duration: 0,
      intensity: "low",
      muscleGroups: [],
      reason: "Your body needs recovery. Take a full rest day and focus on sleep and hydration.",
      exercises: [],
    };
  }

  if (readiness.score < 50) {
    return {
      type: "recovery",
      title: "Active Recovery",
      duration: 20,
      intensity: "low",
      muscleGroups: ["MOBILITY"],
      reason: "Your readiness is low. A light mobility session will help you recover without adding stress.",
      exercises: RECOVERY_TEMPLATE,
    };
  }

  const undertrained = getUndertrainedMuscleGroups(history);
  const trend = getRecentPerformanceTrend(history);
  const primaryMuscle = undertrained[0]?.muscleGroup ?? "CHEST";

  if (readiness.score >= 75 && trend !== "declining" && (goal === "STRENGTH" || goal === "MUSCLE_GAIN")) {
    return {
      type: "strength",
      title: `${primaryMuscle.toLowerCase()} Strength`,
      duration: 45,
      intensity: "high",
      muscleGroups: [primaryMuscle],
      reason: `Your readiness is high (${readiness.score}/100) and ${primaryMuscle.toLowerCase()} hasn't been trained in ${undertrained[0]?.daysSince ?? 0} days. Time to push heavy.`,
      exercises: STRENGTH_TEMPLATE,
    };
  }

  return {
    type: "hypertrophy",
    title: `${primaryMuscle.toLowerCase()} Hypertrophy`,
    duration: 35,
    intensity: "moderate",
    muscleGroups: [primaryMuscle],
    reason: `${primaryMuscle.toLowerCase()} is your most undertrained muscle group. A moderate session will build volume without overreaching.`,
    exercises: HYPERTROPHY_TEMPLATE,
  };
}

const QUICK_WORKOUT_TEMPLATES: Record<number, { name: string; exercises: { name: string; duration: number; type: string }[] }[]> = {
  15: [
    {
      name: "15-Min Express Full Body",
      exercises: [
        { name: "Jumping Jacks", duration: 2, type: "warmup" },
        { name: "Bodyweight Squats", duration: 3, type: "strength" },
        { name: "Push-ups", duration: 3, type: "strength" },
        { name: "Plank Hold", duration: 2, type: "core" },
        { name: "Lunges", duration: 3, type: "strength" },
        { name: "Stretch", duration: 2, type: "cooldown" },
      ],
    },
  ],
  20: [
    {
      name: "20-Min Burn Circuit",
      exercises: [
        { name: "High Knees", duration: 2, type: "warmup" },
        { name: "Goblet Squats", duration: 3, type: "strength" },
        { name: "Push-up to Shoulder Tap", duration: 3, type: "strength" },
        { name: "Reverse Lunges", duration: 3, type: "strength" },
        { name: "Mountain Climbers", duration: 2, type: "cardio" },
        { name: "Dead Bug", duration: 3, type: "core" },
        { name: "Cooldown Stretch", duration: 4, type: "cooldown" },
      ],
    },
  ],
  30: [
    {
      name: "30-Min Total Body",
      exercises: [
        { name: "Warm-up Flow", duration: 3, type: "warmup" },
        { name: "Romanian Deadlift", duration: 4, type: "strength" },
        { name: "Dumbbell Bench Press", duration: 4, type: "strength" },
        { name: "Bent-over Row", duration: 4, type: "strength" },
        { name: "Bulgarian Split Squat", duration: 4, type: "strength" },
        { name: "Overhead Press", duration: 3, type: "strength" },
        { name: "Plank Variations", duration: 3, type: "core" },
        { name: "Cooldown", duration: 5, type: "cooldown" },
      ],
    },
  ],
};

export function generateQuickWorkout(availableMinutes: number): {
  title: string;
  duration: number;
  exercises: { name: string; duration: number; type: string }[];
} {
  const closestTime = Object.keys(QUICK_WORKOUT_TEMPLATES)
    .map(Number)
    .sort((a, b) => Math.abs(a - availableMinutes) - Math.abs(b - availableMinutes))[0];

  const template = QUICK_WORKOUT_TEMPLATES[closestTime]?.[0] ?? QUICK_WORKOUT_TEMPLATES[20]![0]!;

  const scale = availableMinutes / closestTime;
  return {
    title: template.name,
    duration: availableMinutes,
    exercises: template.exercises.map((e) => ({
      ...e,
      duration: Math.max(1, Math.round(e.duration * scale)),
    })),
  };
}
