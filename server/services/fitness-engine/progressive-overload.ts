import type {
  SetLog,
  ExercisePerformance,
  WorkoutHistoryEntry,
  ExerciseRecommendation,
  ProgressionType,
} from "./types";

type PrescribedExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: number | null;
  reps: number | null;
};

const WEIGHT_INCREMENT_KG = 2.5;
const NEAR_TARGET_RATIO = 0.85;
const LOW_TARGET_RATIO = 0.6;

function getCompletedSets(sets: SetLog[]): SetLog[] {
  return sets.filter((s) => s.completed);
}

function getAvgCompletedReps(sets: SetLog[]): number | null {
  const completed = getCompletedSets(sets).filter((s) => s.actualReps !== null);
  if (completed.length === 0) return null;
  return completed.reduce((sum, s) => sum + s.actualReps!, 0) / completed.length;
}

function getMaxWeight(sets: SetLog[]): number | null {
  const withWeight = getCompletedSets(sets).filter((s) => s.actualWeight !== null);
  if (withWeight.length === 0) return null;
  return Math.max(...withWeight.map((s) => s.actualWeight!));
}

function getLastNPerformances(
  history: WorkoutHistoryEntry[],
  exerciseId: string,
  n: number,
): ExercisePerformance[] {
  const performances: ExercisePerformance[] = [];
  for (let i = history.length - 1; i >= 0 && performances.length < n; i--) {
    const day = history[i];
    for (const ex of day.exercises) {
      if (ex.exerciseId === exerciseId) {
        performances.push(ex);
      }
    }
  }
  return performances.reverse();
}

function determineProgression(
  completionRate: number,
  avgReps: number | null,
  targetReps: number | null,
): ProgressionType {
  if (completionRate >= 0.9 && avgReps !== null && targetReps !== null) {
    if (avgReps >= targetReps) return "increase";
    if (avgReps >= targetReps * NEAR_TARGET_RATIO) return "maintain";
  }
  if (completionRate < LOW_TARGET_RATIO) return "decrease";
  return "maintain";
}

function calculateConfidence(
  performanceCount: number,
  completionRate: number,
): number {
  let confidence = 0.5;
  if (performanceCount >= 3) confidence += 0.2;
  if (performanceCount >= 5) confidence += 0.1;
  if (completionRate >= 0.8) confidence += 0.1;
  if (completionRate >= 0.95) confidence += 0.1;
  return Math.min(confidence, 1);
}

function buildReason(
  progression: ProgressionType,
  completionRate: number,
  avgReps: number | null,
  targetReps: number | null,
  performanceCount: number,
): string {
  const completedPct = Math.round(completionRate * 100);

  if (progression === "increase") {
    if (avgReps !== null && targetReps !== null && avgReps >= targetReps) {
      return `You completed all prescribed reps (avg ${Math.round(avgReps)}/${targetReps}) across ${performanceCount} recent sessions. Ready to progress.`;
    }
    return `Strong performance across ${performanceCount} sessions (${completedPct}% completion). Ready to increase load.`;
  }

  if (progression === "decrease") {
    return `Completion rate is ${completedPct}% across recent sessions. Consider reducing load to build consistency.`;
  }

  if (avgReps !== null && targetReps !== null && avgReps < targetReps * NEAR_TARGET_RATIO) {
    return `Averaging ${Math.round(avgReps)} reps vs ${targetReps} target. Maintain current load and focus on hitting all reps.`;
  }

  return `Consistent performance at ${completedPct}% completion. Maintain current load.`;
}

export function calculateExerciseProgression(
  recentPerformances: ExercisePerformance[],
  prescribed: PrescribedExercise,
): ExerciseRecommendation {
  if (recentPerformances.length === 0) {
    return {
      exerciseId: prescribed.exerciseId,
      exerciseName: prescribed.exerciseName,
      suggestedWeight: null,
      suggestedReps: prescribed.reps ?? 10,
      suggestedSets: prescribed.sets ?? 3,
      progressionType: "maintain",
      confidence: 0.3,
      reason: "No previous performance data. Start with the prescribed weight and reps.",
    };
  }

  const latest = recentPerformances[recentPerformances.length - 1];
  const completionRate =
    recentPerformances.reduce(
      (sum, p) => sum + getCompletedSets(p.sets).length / Math.max(p.sets.length, 1),
      0,
    ) / recentPerformances.length;

  const avgReps = getAvgCompletedReps(latest.sets);
  const maxWeight = getMaxWeight(latest.sets);
  const targetReps = prescribed.reps ?? 10;
  const targetSets = prescribed.sets ?? 3;

  const progression = determineProgression(completionRate, avgReps, targetReps);
  const confidence = calculateConfidence(recentPerformances.length, completionRate);

  let suggestedWeight = maxWeight;
  if (progression === "increase" && maxWeight !== null) {
    suggestedWeight = maxWeight + WEIGHT_INCREMENT_KG;
  } else if (progression === "decrease" && maxWeight !== null) {
    suggestedWeight = Math.max(maxWeight - WEIGHT_INCREMENT_KG, 0);
  }

  return {
    exerciseId: prescribed.exerciseId,
    exerciseName: prescribed.exerciseName,
    suggestedWeight,
    suggestedReps: targetReps,
    suggestedSets: targetSets,
    progressionType: progression,
    confidence,
    reason: buildReason(progression, completionRate, avgReps, targetReps, recentPerformances.length),
  };
}

export function calculateWorkoutProgressions(
  history: WorkoutHistoryEntry[],
  prescribedExercises: PrescribedExercise[],
): ExerciseRecommendation[] {
  return prescribedExercises.map((prescribed) => {
    const performances = getLastNPerformances(history, prescribed.exerciseId, 5);
    return calculateExerciseProgression(performances, prescribed);
  });
}
