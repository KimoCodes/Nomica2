import type { WorkoutHistoryEntry, HabitData } from "./types";

export type ConsistencyScore = {
  overall: number;
  workout: number;
  habits: number;
  trend: "improving" | "stable" | "declining";
  comparison: {
    thisWeek: number;
    lastWeek: number;
  };
};

function countCompletionsInPeriod(
  history: WorkoutHistoryEntry[],
  startDate: Date,
  endDate: Date,
): number {
  return history.filter(
    (h) => h.completedAt >= startDate && h.completedAt <= endDate,
  ).length;
}

function calculateWorkoutAdherence(
  history: WorkoutHistoryEntry[],
  expectedPerWeek: number = 4,
): number {
  if (history.length === 0) return 0;

  const now = new Date();
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentCount = history.filter((h) => h.completedAt >= fourWeeksAgo).length;
  const expectedTotal = expectedPerWeek * 4;
  return Math.min(recentCount / expectedTotal, 1);
}

function calculateHabitAdherence(habits: HabitData[]): number {
  if (habits.length === 0) return 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recent = habits.filter((h) => h.date >= sevenDaysAgo);
  if (recent.length === 0) return 0;

  return (
    recent.reduce((sum, h) => sum + Math.min(h.value / Math.max(h.target, 1), 1), 0) /
    recent.length
  );
}

function calculateTrend(history: WorkoutHistoryEntry[]): ConsistencyScore["trend"] {
  const now = new Date();

  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisWeek = countCompletionsInPeriod(history, thisWeekStart, now);
  const lastWeek = countCompletionsInPeriod(history, lastWeekStart, thisWeekStart);

  if (thisWeek > lastWeek) return "improving";
  if (thisWeek < lastWeek) return "declining";
  return "stable";
}

export function calculateConsistencyScore(
  history: WorkoutHistoryEntry[],
  habits: HabitData[],
): ConsistencyScore {
  const workout = calculateWorkoutAdherence(history);
  const habitsScore = calculateHabitAdherence(habits);

  const overall = workout * 0.6 + habitsScore * 0.4;

  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisWeekCount = countCompletionsInPeriod(history, thisWeekStart, now);
  const lastWeekCount = countCompletionsInPeriod(history, lastWeekStart, thisWeekStart);

  return {
    overall: Math.round(overall * 100),
    workout: Math.round(workout * 100),
    habits: Math.round(habitsScore * 100),
    trend: calculateTrend(history),
    comparison: {
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
    },
  };
}
