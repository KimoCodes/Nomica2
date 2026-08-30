import type { WorkoutHistoryEntry, ExercisePerformance, SetLog } from "./types";

export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number | null;
  maxReps: number | null;
  maxVolume: number | null;
  bestSet: { weight: number; reps: number } | null;
  totalWorkouts: number;
  lastPerformed: Date | null;
};

function getCompletedSetsWithLoad(sets: SetLog[]): { weight: number; reps: number }[] {
  return sets
    .filter((s) => s.completed && s.actualReps !== null)
    .map((s) => ({ weight: s.actualWeight ?? 0, reps: s.actualReps! }));
}

function calculateVolume(weight: number, reps: number): number {
  return weight * reps;
}

function aggregateExercise(performances: ExercisePerformance[]): PersonalRecord {
  const exerciseId = performances[0].exerciseId;
  const exerciseName = performances[performances.length - 1].exerciseName;

  let maxWeight: number | null = null;
  let maxReps: number | null = null;
  let maxVolume: number | null = null;
  let bestSet: { weight: number; reps: number } | null = null;
  let bestVolumeForSet = 0;

  const sortedByDate = [...performances].sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
  );

  for (const perf of performances) {
    const setsWithLoad = getCompletedSetsWithLoad(perf.sets);

    for (const set of setsWithLoad) {
      if (maxWeight === null || set.weight > maxWeight) {
        maxWeight = set.weight;
      }
      if (maxReps === null || set.reps > maxReps) {
        maxReps = set.reps;
      }
      const vol = calculateVolume(set.weight, set.reps);
      if (maxVolume === null || vol > maxVolume) {
        maxVolume = vol;
      }
      if (vol > bestVolumeForSet) {
        bestVolumeForSet = vol;
        bestSet = { weight: set.weight, reps: set.reps };
      }
    }
  }

  return {
    exerciseId,
    exerciseName,
    maxWeight,
    maxReps,
    maxVolume,
    bestSet,
    totalWorkouts: performances.length,
    lastPerformed: sortedByDate[0]?.completedAt ?? null,
  };
}

export function calculatePersonalRecords(
  history: WorkoutHistoryEntry[],
): PersonalRecord[] {
  const byExercise = new Map<string, ExercisePerformance[]>();

  for (const day of history) {
    for (const exercise of day.exercises) {
      const existing = byExercise.get(exercise.exerciseId) ?? [];
      existing.push(exercise);
      byExercise.set(exercise.exerciseId, existing);
    }
  }

  return Array.from(byExercise.values())
    .map((performances) => aggregateExercise(performances))
    .filter((pr) => pr.maxWeight !== null || pr.maxReps !== null)
    .sort((a, b) => (b.maxWeight ?? 0) - (a.maxWeight ?? 0));
}

export function isNewPersonalRecord(
  currentSets: SetLog[],
  previousBest: PersonalRecord | null,
): { isPR: boolean; exerciseName: string; detail: string } | null {
  if (!previousBest) return null;

  const setsWithLoad = getCompletedSetsWithLoad(currentSets);
  if (setsWithLoad.length === 0) return null;

  const currentMaxWeight = Math.max(...setsWithLoad.map((s) => s.weight));
  const currentMaxReps = Math.max(...setsWithLoad.map((s) => s.reps));
  const currentMaxVolume = Math.max(...setsWithLoad.map((s) => calculateVolume(s.weight, s.reps)));

  if (
    previousBest.maxWeight !== null &&
    currentMaxWeight > previousBest.maxWeight
  ) {
    return {
      isPR: true,
      exerciseName: previousBest.exerciseName,
      detail: `New max weight: ${currentMaxWeight}kg (was ${previousBest.maxWeight}kg)`,
    };
  }

  if (
    previousBest.maxWeight !== null &&
    previousBest.maxWeight > 0 &&
    previousBest.maxReps !== null &&
    currentMaxWeight === previousBest.maxWeight &&
    currentMaxReps > previousBest.maxReps
  ) {
    return {
      isPR: true,
      exerciseName: previousBest.exerciseName,
      detail: `More reps at ${currentMaxWeight}kg: ${currentMaxReps} reps (was ${previousBest.maxReps})`,
    };
  }

  if (
    previousBest.maxVolume !== null &&
    currentMaxVolume > previousBest.maxVolume
  ) {
    return {
      isPR: true,
      exerciseName: previousBest.exerciseName,
      detail: `New best set: ${currentMaxVolume}kg volume (was ${previousBest.maxVolume}kg)`,
    };
  }

  return null;
}
