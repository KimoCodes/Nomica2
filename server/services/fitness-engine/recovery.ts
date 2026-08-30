import type {
  WorkoutHistoryEntry,
  HabitData,
  CheckInData,
  RecoveryInsight,
} from "./types";

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

function analyzeSleep(checkIn: CheckInData | null): RecoveryInsight | null {
  if (!checkIn?.sleepQuality) return null;
  if (checkIn.sleepQuality <= 3) {
    return {
      category: "sleep",
      severity: "warning",
      message: "Your sleep quality has been low. Consider prioritizing 7-9 hours tonight and reducing screen time before bed.",
      actionable: true,
    };
  }
  if (checkIn.sleepQuality >= 8) {
    return {
      category: "sleep",
      severity: "positive",
      message: "Great sleep quality this week. This supports recovery and performance.",
      actionable: false,
    };
  }
  return null;
}

function analyzeTrainingLoad(history: WorkoutHistoryEntry[]): RecoveryInsight[] {
  const insights: RecoveryInsight[] = [];
  const last7 = getRecentWorkoutCount(history, 7);
  const last14 = getRecentWorkoutCount(history, 14);

  if (last7 >= 6) {
    insights.push({
      category: "training",
      severity: "warning",
      message: `You've completed ${last7} workouts in the last 7 days. Consider adding a rest day to prevent overtraining.`,
      actionable: true,
    });
  }

  if (last7 === 0) {
    const daysSince = getDaysSinceLastWorkout(history);
    if (daysSince >= 5) {
      insights.push({
        category: "training",
        severity: "warning",
        message: `It's been ${daysSince} days since your last workout. Start with a lighter session to ease back in.`,
        actionable: true,
      });
    } else if (daysSince >= 3) {
      insights.push({
        category: "training",
        severity: "info",
        message: `You haven't trained in ${daysSince} days. A moderate session today would help maintain consistency.`,
        actionable: true,
      });
    }
  }

  if (last7 >= 3 && last7 <= 5 && last14 >= 6) {
    insights.push({
      category: "training",
      severity: "positive",
      message: "Good training frequency this week. Keep up the consistent effort.",
      actionable: false,
    });
  }

  return insights;
}

function analyzeHabits(habits: HabitData[]): RecoveryInsight | null {
  if (habits.length === 0) return null;
  const now = new Date();
  const recent = habits.filter((h) => {
    const diff = now.getTime() - h.date.getTime();
    return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  });
  if (recent.length === 0) return null;

  const adherence =
    recent.reduce((sum, h) => sum + Math.min(h.value / Math.max(h.target, 1), 1), 0) /
    recent.length;

  if (adherence < 0.5) {
    return {
      category: "habits",
      severity: "warning",
      message: "Your habit adherence has dropped below 50% this week. Small improvements in hydration and sleep can boost recovery.",
      actionable: true,
    };
  }
  if (adherence >= 0.8) {
    return {
      category: "habits",
      severity: "positive",
      message: "Strong habit consistency. Your daily routines are supporting your fitness goals.",
      actionable: false,
    };
  }
  return null;
}

function analyzeEnergy(checkIn: CheckInData | null): RecoveryInsight | null {
  if (!checkIn?.energyLevel) return null;
  if (checkIn.energyLevel <= 3) {
    return {
      category: "general",
      severity: "warning",
      message: "Your reported energy is low. Consider a lighter workout today and check if nutrition, hydration, or sleep need attention.",
      actionable: true,
    };
  }
  if (checkIn.energyLevel >= 8) {
    return {
      category: "general",
      severity: "positive",
      message: "High energy levels reported. A good day for a challenging session.",
      actionable: false,
    };
  }
  return null;
}

export function generateRecoveryInsights(
  history: WorkoutHistoryEntry[],
  habits: HabitData[],
  checkIn: CheckInData | null,
): RecoveryInsight[] {
  const insights: RecoveryInsight[] = [];

  const sleepInsight = analyzeSleep(checkIn);
  if (sleepInsight) insights.push(sleepInsight);

  insights.push(...analyzeTrainingLoad(history));

  const habitInsight = analyzeHabits(habits);
  if (habitInsight) insights.push(habitInsight);

  const energyInsight = analyzeEnergy(checkIn);
  if (energyInsight) insights.push(energyInsight);

  return insights;
}
