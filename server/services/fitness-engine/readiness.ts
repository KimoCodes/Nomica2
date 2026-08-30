import type { WorkoutHistoryEntry, HabitData, CheckInData, ReadinessScore } from "./types";

const WEIGHTS = {
  sleep: 0.25,
  energy: 0.15,
  habits: 0.20,
  recovery: 0.25,
  consistency: 0.15,
} as const;

function scoreSleep(checkIn: CheckInData | null): number {
  if (!checkIn?.sleepQuality) return 5;
  return Math.min(Math.max(checkIn.sleepQuality, 0), 10);
}

function scoreEnergy(checkIn: CheckInData | null): number {
  if (!checkIn?.energyLevel) return 5;
  return Math.min(Math.max(checkIn.energyLevel, 0), 10);
}

function scoreHabits(habits: HabitData[]): number {
  if (habits.length === 0) return 5;
  const now = new Date();
  const recent = habits.filter((h) => {
    const diff = now.getTime() - h.date.getTime();
    return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  });
  if (recent.length === 0) return 5;
  const adherenceRate =
    recent.reduce((sum, h) => sum + Math.min(h.value / Math.max(h.target, 1), 1), 0) /
    recent.length;
  return adherenceRate * 10;
}

function scoreRecovery(history: WorkoutHistoryEntry[], checkIn: CheckInData | null): number {
  const daysSinceLastWorkout = getDaysSinceLastWorkout(history);
  const restScore = daysSinceLastWorkout >= 2 ? 8 : daysSinceLastWorkout >= 1 ? 6 : 4;

  const sleepBonus = checkIn?.sleepQuality ? (checkIn.sleepQuality - 5) * 0.4 : 0;
  return Math.min(Math.max(restScore + sleepBonus, 0), 10);
}

function scoreConsistency(history: WorkoutHistoryEntry[]): number {
  if (history.length === 0) return 5;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = history.filter((h) => h.completedAt >= thirtyDaysAgo).length;
  const expectedSessions = 12;
  const ratio = Math.min(recentCount / expectedSessions, 1);
  return ratio * 10;
}

function getDaysSinceLastWorkout(history: WorkoutHistoryEntry[]): number {
  if (history.length === 0) return 7;
  const sorted = [...history].sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
  );
  const last = sorted[0].completedAt;
  const now = new Date();
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

function getRecommendation(
  score: number,
): ReadinessScore["recommendation"] {
  if (score >= 80) return "high_intensity";
  if (score >= 60) return "moderate";
  if (score >= 40) return "light";
  if (score >= 20) return "recovery";
  return "rest";
}

function buildExplanation(
  score: number,
  factors: ReadinessScore["factors"],
): string {
  const parts: string[] = [];

  if (factors.sleep >= 7) {
    parts.push("sleep quality is good");
  } else if (factors.sleep <= 4) {
    parts.push("sleep has been poor");
  }

  if (factors.energy >= 7) {
    parts.push("energy levels are high");
  } else if (factors.energy <= 4) {
    parts.push("energy is low");
  }

  if (factors.recovery >= 7) {
    parts.push("you appear well-recovered");
  } else if (factors.recovery <= 4) {
    parts.push("your body may need more recovery time");
  }

  if (factors.consistency >= 7) {
    parts.push("training consistency is strong");
  } else if (factors.consistency <= 4) {
    parts.push("recent training frequency has been inconsistent");
  }

  if (parts.length === 0) {
    return `Your readiness score is ${Math.round(score)}/100.`;
  }

  return `Readiness ${Math.round(score)}/100 — ${parts.join(", ")}.`;
}

export function calculateReadinessScore(
  history: WorkoutHistoryEntry[],
  habits: HabitData[],
  checkIn: CheckInData | null,
): ReadinessScore {
  const factors = {
    sleep: scoreSleep(checkIn),
    energy: scoreEnergy(checkIn),
    habits: scoreHabits(habits),
    recovery: scoreRecovery(history, checkIn),
    consistency: scoreConsistency(history),
  };

  const rawScore =
    factors.sleep * WEIGHTS.sleep +
    factors.energy * WEIGHTS.energy +
    factors.habits * WEIGHTS.habits +
    factors.recovery * WEIGHTS.recovery +
    factors.consistency * WEIGHTS.consistency;

  const score = Math.round(Math.min(Math.max(rawScore * 10, 0), 100));

  return {
    score,
    recommendation: getRecommendation(score),
    factors,
    explanation: buildExplanation(score, factors),
  };
}
