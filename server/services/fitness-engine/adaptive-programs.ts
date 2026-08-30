export type ProgramAdjustment = {
  programId: string;
  reason: string;
  changes: ProgramChange[];
  confidence: "high" | "medium" | "low";
  overallImpact: "positive" | "neutral" | "caution";
};

export type ProgramChange = {
  type: "increase_difficulty" | "decrease_difficulty" | "add_volume" | "reduce_volume" | "swap_exercise" | "adjust_rest";
  exerciseName: string;
  currentValue: number;
  newValue: number;
  reason: string;
};

export type PerformanceSnapshot = {
  exerciseName: string;
  avgWeight: number;
  avgReps: number;
  completionRate: number;
  rpe: number | null;
  trend: "improving" | "stable" | "declining";
  sessionsCount: number;
};

export function analyzeProgramPerformance(params: {
  programId: string;
  completions: {
    completedAt: Date;
    exercises: {
      name: string;
      sets: { actualWeight: number; actualReps: number; completed: boolean }[];
    }[];
  }[];
  currentWeek: number;
  totalWeeks: number;
}): { snapshots: PerformanceSnapshot[]; adjustment: ProgramAdjustment } {
  const { programId, completions, currentWeek, totalWeeks } = params;

  const exerciseMap = new Map<string, { weights: number[]; reps: number[]; completions: number; total: number; rpe: number | null }>();

  for (const completion of completions) {
    for (const exercise of completion.exercises) {
      const existing = exerciseMap.get(exercise.name) ?? {
        weights: [],
        reps: [],
        completions: 0,
        total: 0,
        rpe: null,
      };

      for (const set of exercise.sets) {
        existing.total++;
        if (set.completed) {
          existing.completions++;
          existing.weights.push(set.actualWeight);
          existing.reps.push(set.actualReps);
        }
      }

      exerciseMap.set(exercise.name, existing);
    }
  }

  const snapshots: PerformanceSnapshot[] = [];

  for (const [name, data] of exerciseMap) {
    const avgWeight = data.weights.length > 0
      ? data.weights.reduce((a, b) => a + b, 0) / data.weights.length
      : 0;
    const avgReps = data.reps.length > 0
      ? data.reps.reduce((a, b) => a + b, 0) / data.reps.length
      : 0;
    const completionRate = data.total > 0 ? (data.completions / data.total) * 100 : 0;

    const midPoint = Math.floor(completions.length / 2);
    const recentCompletions = completions.slice(0, midPoint);
    const olderCompletions = completions.slice(midPoint);

    const recentAvg = recentCompletions.reduce((sum, c) => {
      const ex = c.exercises.find((e) => e.name === name);
      if (!ex) return sum;
      const completedSets = ex.sets.filter((s) => s.completed);
      return sum + (completedSets.length > 0 ? completedSets.reduce((s, set) => s + set.actualWeight, 0) / completedSets.length : 0);
    }, 0) / Math.max(1, recentCompletions.length);

    const olderAvg = olderCompletions.reduce((sum, c) => {
      const ex = c.exercises.find((e) => e.name === name);
      if (!ex) return sum;
      const completedSets = ex.sets.filter((s) => s.completed);
      return sum + (completedSets.length > 0 ? completedSets.reduce((s, set) => s + set.actualWeight, 0) / completedSets.length : 0);
    }, 0) / Math.max(1, olderCompletions.length);

    let trend: "improving" | "stable" | "declining" = "stable";
    if (recentAvg > olderAvg * 1.05) trend = "improving";
    else if (recentAvg < olderAvg * 0.95) trend = "declining";

    snapshots.push({
      exerciseName: name,
      avgWeight: Math.round(avgWeight * 10) / 10,
      avgReps: Math.round(avgReps * 10) / 10,
      completionRate: Math.round(completionRate),
      rpe: data.rpe,
      trend,
      sessionsCount: completions.length,
    });
  }

  const changes: ProgramChange[] = [];
  let overallImpact: "positive" | "neutral" | "caution" = "neutral";

  for (const snapshot of snapshots) {
    if (snapshot.completionRate >= 90 && snapshot.trend === "improving") {
      changes.push({
        type: "increase_difficulty",
        exerciseName: snapshot.exerciseName,
        currentValue: snapshot.avgWeight,
        newValue: Math.round((snapshot.avgWeight * 1.05) * 10) / 10,
        reason: `High completion rate (${snapshot.completionRate}%) with improving trend. Ready for progression.`,
      });
      overallImpact = "positive";
    } else if (snapshot.completionRate < 60 || snapshot.trend === "declining") {
      changes.push({
        type: "decrease_difficulty",
        exerciseName: snapshot.exerciseName,
        currentValue: snapshot.avgWeight,
        newValue: Math.round((snapshot.avgWeight * 0.9) * 10) / 10,
        reason: `Low completion rate (${snapshot.completionRate}%) or declining trend. Reducing load to prevent overtraining.`,
      });
      overallImpact = "caution";
    }
  }

  const isMidProgram = currentWeek >= totalWeeks * 0.4 && currentWeek <= totalWeeks * 0.7;
  if (isMidProgram && changes.length === 0) {
    for (const snapshot of snapshots) {
      if (snapshot.completionRate >= 80 && snapshot.trend === "stable") {
        changes.push({
          type: "add_volume",
          exerciseName: snapshot.exerciseName,
          currentValue: snapshot.avgReps,
          newValue: snapshot.avgReps + 2,
          reason: "Mid-program plateau. Adding 2 reps to break through.",
        });
      }
    }
  }

  return {
    snapshots,
    adjustment: {
      programId,
      reason: changes.length > 0
        ? `Analysis of ${completions.length} workouts shows ${changes.length} adjustment(s) recommended.`
        : "Current program is well-calibrated. No adjustments needed.",
      changes,
      confidence: completions.length >= 6 ? "high" : completions.length >= 3 ? "medium" : "low",
      overallImpact,
    },
  };
}

export function suggestDeloadWeek(params: {
  recentRPEs: number[];
  weeksSinceDeload: number;
  avgSleep: number;
  consistency: number;
}): { shouldDeload: boolean; reason: string; suggestedActivities: string[] } {
  const { recentRPEs, weeksSinceDeload, avgSleep, consistency } = params;

  const avgRPE = recentRPEs.length > 0
    ? recentRPEs.reduce((a, b) => a + b, 0) / recentRPEs.length
    : 5;

  const highRPECount = recentRPEs.filter((r) => r >= 8).length;
  const lowSleep = avgSleep < 6.5;

  if (weeksSinceDeload >= 4 || highRPECount >= 3 || (lowSleep && avgRPE >= 7) || (consistency < 70 && avgRPE >= 6)) {
    return {
      shouldDeload: true,
      reason: weeksSinceDeload >= 4
        ? `It's been ${weeksSinceDeload} weeks since your last deload. Your body needs a recovery week.`
        : highRPECount >= 3
          ? "Multiple high-RPE sessions detected. A deload will prevent overtraining."
          : lowSleep
            ? "Poor sleep combined with high training stress. Take a lighter week."
            : "Inconsistent training with elevated RPE. A deload week will help you reset.",
      suggestedActivities: [
        "Reduce weights by 40-50%",
        "Keep rep ranges the same",
        "Add extra mobility work",
        "Focus on sleep and nutrition",
        "Consider yoga or light swimming",
      ],
    };
  }

  return {
    shouldDeload: false,
    reason: "Your training load is manageable. No deload needed yet.",
    suggestedActivities: [],
  };
}
