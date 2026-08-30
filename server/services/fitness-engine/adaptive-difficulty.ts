export type RPEValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type RPEFeedback = {
  rpe: RPEValue;
  notes?: string;
};

export type DifficultyAdjustment = {
  shouldProgress: boolean;
  shouldDeload: boolean;
  weightChange: number;
  repChange: number;
  reason: string;
  confidence: "high" | "medium" | "low";
};

const RPE_LABELS: Record<RPEValue, string> = {
  1: "Very Easy",
  2: "Easy",
  3: "Easy",
  4: "Moderate",
  5: "Moderate",
  6: "Somewhat Hard",
  7: "Hard",
  8: "Very Hard",
  9: "Near Max",
  10: "Max Effort",
};

export function getRPELabel(rpe: RPEValue): string {
  return RPE_LABELS[rpe];
}

export function getRPEColor(rpe: RPEValue): string {
  if (rpe <= 3) return "text-green-500";
  if (rpe <= 5) return "text-blue-500";
  if (rpe <= 7) return "text-yellow-500";
  return "text-red-500";
}

export function calculateDifficultyAdjustment(params: {
  recentRPEs: RPEValue[];
  currentWeight: number;
  currentReps: number;
  targetReps: number;
  weeksAtWeight: number;
}): DifficultyAdjustment {
  const { recentRPEs, currentWeight, currentReps, targetReps, weeksAtWeight } = params;

  if (recentRPEs.length === 0) {
    return {
      shouldProgress: false,
      shouldDeload: false,
      weightChange: 0,
      repChange: 0,
      reason: "No RPE data available yet. Keep logging to get personalized adjustments.",
      confidence: "low",
    };
  }

  const avgRPE = recentRPEs.reduce((a, b) => a + b, 0) / recentRPEs.length;
  const latestRPE = recentRPEs[0]!;

  if (latestRPE <= 4) {
    const weightIncrement = currentWeight < 20 ? 2.5 : 5;
    return {
      shouldProgress: true,
      shouldDeload: false,
      weightChange: weightIncrement,
      repChange: 0,
      reason: `RPE ${latestRPE} (${RPE_LABELS[latestRPE]}) — you have plenty of room. Increase weight by ${weightIncrement}kg.`,
      confidence: "high",
    };
  }

  if (latestRPE >= 9 && avgRPE >= 8) {
    return {
      shouldProgress: false,
      shouldDeload: true,
      weightChange: -(currentWeight * 0.1),
      repChange: 0,
      reason: `RPE ${latestRPE} with average ${avgRPE.toFixed(1)} — you're overreaching. Reduce weight by ~10% to recover.`,
      confidence: "high",
    };
  }

  if (currentReps >= targetReps && latestRPE <= 6) {
    return {
      shouldProgress: true,
      shouldDeload: false,
      weightChange: currentWeight < 20 ? 1.25 : 2.5,
      repChange: 0,
      reason: `Hit target reps at RPE ${latestRPE}. Small weight increase recommended.`,
      confidence: "medium",
    };
  }

  if (currentReps < targetReps && weeksAtWeight >= 2) {
    return {
      shouldProgress: false,
      shouldDeload: false,
      weightChange: 0,
      repChange: 1,
      reason: `Below target reps for ${weeksAtWeight} weeks. Add 1 rep per set before increasing weight.`,
      confidence: "medium",
    };
  }

  return {
    shouldProgress: false,
    shouldDeload: false,
    weightChange: 0,
    repChange: 0,
    reason: `RPE ${latestRPE} (${RPE_LABELS[latestRPE]}) — maintain current weight and reps. You're in a good zone.`,
    confidence: "medium",
  };
}

export function calculateWeeklyRPEAverages(
  rpeHistory: { date: Date; rpe: RPEValue }[],
): { week: string; avg: number; count: number }[] {
  const weeks = new Map<string, { total: number; count: number }>();

  for (const entry of rpeHistory) {
    const weekStart = new Date(entry.date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().split("T")[0]!;
    const existing = weeks.get(key) ?? { total: 0, count: 0 };
    existing.total += entry.rpe;
    existing.count += 1;
    weeks.set(key, existing);
  }

  return Array.from(weeks.entries())
    .map(([week, data]) => ({
      week,
      avg: data.total / data.count,
      count: data.count,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}
