import { describe, it, expect } from "vitest";
import {
  calculateExerciseProgression,
  calculateWorkoutProgressions,
} from "@/server/services/fitness-engine/progressive-overload";
import type {
  ExercisePerformance,
  WorkoutHistoryEntry,
  SetLog,
} from "@/server/services/fitness-engine/types";

function makeSets(reps: number, weight: number, count: number, completed = true): SetLog[] {
  return Array.from({ length: count }, (_, i) => ({
    actualReps: completed ? reps : null,
    actualWeight: completed ? weight : null,
    completed,
    setNumber: i + 1,
  }));
}

function makePerformance(
  exerciseId: string,
  sets: SetLog[],
  daysAgo: number,
): ExercisePerformance {
  const completedAt = new Date();
  completedAt.setDate(completedAt.getDate() - daysAgo);
  return {
    exerciseId,
    exerciseName: "Bench Press",
    muscleGroup: "CHEST",
    sets,
    completedAt,
  };
}

function makeHistory(...performances: ExercisePerformance[]): WorkoutHistoryEntry[] {
  const byDay = new Map<string, ExercisePerformance[]>();
  for (const p of performances) {
    const key = p.completedAt.toISOString().slice(0, 10);
    const existing = byDay.get(key) ?? [];
    existing.push(p);
    byDay.set(key, existing);
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, exercises]) => ({
      completedAt: exercises[0].completedAt,
      dayTitle: "Day 1",
      exercises,
    }));
}

describe("calculateExerciseProgression", () => {
  const prescribed = {
    exerciseId: "ex1",
    exerciseName: "Bench Press",
    sets: 3,
    reps: 10,
  };

  it("returns maintain with low confidence when no history", () => {
    const result = calculateExerciseProgression([], prescribed);
    expect(result.progressionType).toBe("maintain");
    expect(result.confidence).toBe(0.3);
    expect(result.reason).toContain("No previous performance data");
  });

  it("recommends increase when all reps hit target", () => {
    const performances = [
      makePerformance("ex1", makeSets(10, 60, 3), 3),
      makePerformance("ex1", makeSets(10, 60, 3), 2),
      makePerformance("ex1", makeSets(10, 60, 3), 1),
    ];
    const result = calculateExerciseProgression(performances, prescribed);
    expect(result.progressionType).toBe("increase");
    expect(result.suggestedWeight).toBe(62.5);
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("recommends maintain when reps are close to target", () => {
    const performances = [
      makePerformance("ex1", makeSets(8, 60, 3), 3),
      makePerformance("ex1", makeSets(9, 60, 3), 2),
      makePerformance("ex1", makeSets(8, 60, 3), 1),
    ];
    const result = calculateExerciseProgression(performances, prescribed);
    expect(result.progressionType).toBe("maintain");
    expect(result.suggestedWeight).toBe(60);
  });

  it("recommends decrease when completion rate is low", () => {
    const lowSets = makeSets(5, 60, 3, false);
    lowSets[0].completed = true;
    lowSets[0].actualReps = 5;
    lowSets[0].actualWeight = 60;
    const performances = [
      makePerformance("ex1", lowSets, 3),
      makePerformance("ex1", lowSets, 2),
      makePerformance("ex1", lowSets, 1),
    ];
    const result = calculateExerciseProgression(performances, prescribed);
    expect(result.progressionType).toBe("decrease");
    expect(result.suggestedWeight).toBe(57.5);
  });
});

describe("calculateWorkoutProgressions", () => {
  it("returns recommendation for each prescribed exercise", () => {
    const prescribed = [
      { exerciseId: "ex1", exerciseName: "Bench Press", sets: 3, reps: 10 },
      { exerciseId: "ex2", exerciseName: "Squat", sets: 3, reps: 8 },
    ];
    const result = calculateWorkoutProgressions([], prescribed);
    expect(result).toHaveLength(2);
    expect(result[0].exerciseId).toBe("ex1");
    expect(result[1].exerciseId).toBe("ex2");
  });
});
