import type { WorkoutHistoryEntry } from "./types";

export type ExerciseChartData = {
  exerciseId: string;
  exerciseName: string;
  dataPoints: {
    date: string;
    weight: number;
    reps: number;
    volume: number;
    estimatedMax: number;
  }[];
  trend: {
    weightChange: number;
    repsChange: number;
    volumeChange: number;
    direction: "up" | "down" | "stable";
  };
};

export function generateExerciseChartData(
  history: WorkoutHistoryEntry[],
  exerciseId: string,
): ExerciseChartData | null {
  const dataPoints: ExerciseChartData["dataPoints"] = [];

  for (const entry of history) {
    const exercise = entry.exercises.find((e) => e.exerciseId === exerciseId);
    if (!exercise) continue;

    const completedSets = exercise.sets.filter((s) => s.completed && s.actualWeight !== null);
    if (completedSets.length === 0) continue;

    const totalReps = completedSets.reduce((sum, s) => sum + (s.actualReps ?? 0), 0);
    const maxWeight = Math.max(...completedSets.map((s) => s.actualWeight ?? 0));
    const volume = completedSets.reduce(
      (sum, s) => sum + (s.actualWeight ?? 0) * (s.actualReps ?? 0),
      0,
    );
    const estimatedMax = maxWeight * (1 + totalReps / 30);

    dataPoints.push({
      date: entry.completedAt.toISOString().split("T")[0]!,
      weight: maxWeight,
      reps: totalReps,
      volume,
      estimatedMax: Math.round(estimatedMax * 10) / 10,
    });
  }

  if (dataPoints.length < 2) return null;

  const first = dataPoints[0]!;
  const last = dataPoints[dataPoints.length - 1]!;

  return {
    exerciseId,
    exerciseName: history[0]?.exercises.find((e) => e.exerciseId === exerciseId)?.exerciseName ?? "",
    dataPoints,
    trend: {
      weightChange: last.weight - first.weight,
      repsChange: last.reps - first.reps,
      volumeChange: last.volume - first.volume,
      direction:
        last.weight > first.weight ? "up" : last.weight < first.weight ? "down" : "stable",
    },
  };
}

export type MuscleGroupProgress = {
  muscleGroup: string;
  totalWorkouts: number;
  totalVolume: number;
  avgIntensity: number;
  lastTrained: string | null;
  trend: "up" | "down" | "stable";
};

export function generateMuscleGroupProgress(
  history: WorkoutHistoryEntry[],
): MuscleGroupProgress[] {
  const groupData = new Map<string, {
    workouts: number;
    totalVolume: number;
    intensities: number[];
    lastDate: Date | null;
    firstVolume: number;
    lastVolume: number;
  }>();

  for (const entry of history) {
    for (const exercise of entry.exercises) {
      const group = exercise.muscleGroup;
      const data = groupData.get(group) ?? {
        workouts: 0,
        totalVolume: 0,
        intensities: [],
        lastDate: null,
        firstVolume: 0,
        lastVolume: 0,
      };

      data.workouts += 1;
      const completedSets = exercise.sets.filter((s) => s.completed);
      const volume = completedSets.reduce(
        (sum, s) => sum + (s.actualWeight ?? 0) * (s.actualReps ?? 0),
        0,
      );
      data.totalVolume += volume;
      data.lastVolume = volume;
      if (data.firstVolume === 0) data.firstVolume = volume;

      const maxWeight = Math.max(...completedSets.map((s) => s.actualWeight ?? 0), 0);
      if (maxWeight > 0) data.intensities.push(maxWeight);

      if (!data.lastDate || entry.completedAt > data.lastDate) {
        data.lastDate = entry.completedAt;
      }

      groupData.set(group, data);
    }
  }

  return Array.from(groupData.entries()).map(([muscleGroup, data]) => ({
    muscleGroup,
    totalWorkouts: data.workouts,
    totalVolume: data.totalVolume,
    avgIntensity:
      data.intensities.length > 0
        ? data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length
        : 0,
    lastTrained: data.lastDate?.toISOString().split("T")[0] ?? null,
    trend:
      data.lastVolume > data.firstVolume
        ? ("up" as const)
        : data.lastVolume < data.firstVolume
          ? ("down" as const)
          : ("stable" as const),
  }));
}
