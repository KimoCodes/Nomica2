import type { WorkoutHistoryEntry } from "./types";

export type RecoveryOption = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number | null;
  priority: "recommended" | "alternative" | "skip";
};

function getDaysSinceLastWorkout(history: WorkoutHistoryEntry[]): number {
  if (history.length === 0) return 7;
  const sorted = [...history].sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
  );
  return Math.floor(
    (Date.now() - sorted[0].completedAt.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getRecentWorkoutCount(history: WorkoutHistoryEntry[], days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return history.filter((h) => h.completedAt >= cutoff).length;
}

export function getMissedWorkoutOptions(
  history: WorkoutHistoryEntry[],
  missedDayTitle: string,
): RecoveryOption[] {
  const daysSince = getDaysSinceLastWorkout(history);
  const last7Count = getRecentWorkoutCount(history, 7);
  const options: RecoveryOption[] = [];

  if (daysSince >= 3) {
    options.push({
      id: "ease-in",
      title: "Start with a lighter session",
      description: `It's been ${daysSince} days. A shorter, lower-intensity session will help you get back into rhythm without overloading your body.`,
      estimatedMinutes: 20,
      priority: "recommended",
    });
  }

  if (last7Count >= 4) {
    options.push({
      id: "rest",
      title: "Take a rest day",
      description: `You've completed ${last7Count} workouts this week. A rest day can help with recovery and prevent overtraining.`,
      estimatedMinutes: null,
      priority: "recommended",
    });
  }

  options.push({
    id: "continue",
    title: "Continue as planned",
    description: `Pick up where you left off with "${missedDayTitle}". Your body can handle the schedule.`,
    estimatedMinutes: null,
    priority: "alternative",
  });

  if (daysSince <= 2 && last7Count < 4) {
    options.push({
      id: "combine",
      title: "Combine with tomorrow's session",
      description: "Merge today's exercises with tomorrow's for a longer session that covers both days.",
      estimatedMinutes: null,
      priority: "alternative",
    });
  }

  return options;
}
