import { describe, it, expect } from "vitest";
import {
  calculatePersonalRecords,
  isNewPersonalRecord,
} from "@/server/services/fitness-engine/personal-records";
import type {
  WorkoutHistoryEntry,
  ExercisePerformance,
  SetLog,
} from "@/server/services/fitness-engine/types";

function makeSets(weight: number, reps: number, count: number): SetLog[] {
  return Array.from({ length: count }, (_, i) => ({
    actualReps: reps,
    actualWeight: weight,
    completed: true,
    setNumber: i + 1,
  }));
}

function makePerformance(
  exerciseId: string,
  exerciseName: string,
  sets: SetLog[],
  daysAgo: number,
): ExercisePerformance {
  const completedAt = new Date();
  completedAt.setDate(completedAt.getDate() - daysAgo);
  return { exerciseId, exerciseName, muscleGroup: "CHEST", sets, completedAt };
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
      dayTitle: "Day",
      exercises,
    }));
}

describe("calculatePersonalRecords", () => {
  it("returns empty for empty history", () => {
    const result = calculatePersonalRecords([]);
    expect(result).toEqual([]);
  });

  it("calculates max weight for an exercise", () => {
    const history = makeHistory(
      makePerformance("ex1", "Bench Press", makeSets(60, 10, 3), 5),
      makePerformance("ex1", "Bench Press", makeSets(65, 8, 3), 2),
    );
    const result = calculatePersonalRecords(history);
    expect(result).toHaveLength(1);
    expect(result[0].maxWeight).toBe(65);
  });

  it("calculates max reps for an exercise", () => {
    const history = makeHistory(
      makePerformance("ex1", "Bench Press", makeSets(60, 10, 3), 5),
      makePerformance("ex1", "Bench Press", makeSets(60, 12, 3), 2),
    );
    const result = calculatePersonalRecords(history);
    expect(result[0].maxReps).toBe(12);
  });

  it("calculates max volume for an exercise", () => {
    const history = makeHistory(
      makePerformance("ex1", "Bench Press", makeSets(60, 10, 3), 5),
      makePerformance("ex1", "Bench Press", makeSets(70, 8, 3), 2),
    );
    const result = calculatePersonalRecords(history);
    expect(result[0].maxVolume).toBe(600);
  });

  it("tracks total workouts per exercise", () => {
    const history = makeHistory(
      makePerformance("ex1", "Bench Press", makeSets(60, 10, 3), 10),
      makePerformance("ex1", "Bench Press", makeSets(60, 10, 3), 5),
      makePerformance("ex1", "Bench Press", makeSets(60, 10, 3), 2),
    );
    const result = calculatePersonalRecords(history);
    expect(result[0].totalWorkouts).toBe(3);
  });

  it("records last performed date", () => {
    const history = makeHistory(
      makePerformance("ex1", "Bench Press", makeSets(60, 10, 3), 5),
      makePerformance("ex1", "Bench Press", makeSets(60, 10, 3), 1),
    );
    const result = calculatePersonalRecords(history);
    expect(result[0].lastPerformed).toBeInstanceOf(Date);
  });

  it("handles exercises with no weight data", () => {
    const noWeightSets: SetLog[] = [
      { actualReps: 20, actualWeight: null, completed: true, setNumber: 1 },
    ];
    const history = makeHistory(
      makePerformance("ex1", "Push-ups", noWeightSets, 1),
    );
    const result = calculatePersonalRecords(history);
    expect(result).toHaveLength(1);
    expect(result[0].maxWeight).toBe(0);
    expect(result[0].maxReps).toBe(20);
  });
});

describe("isNewPersonalRecord", () => {
  const previousBest = {
    exerciseId: "ex1",
    exerciseName: "Bench Press",
    maxWeight: 60,
    maxReps: 10,
    maxVolume: 600,
    bestSet: { weight: 60, reps: 10 },
    totalWorkouts: 5,
    lastPerformed: new Date(),
  };

  it("returns null when no previous best", () => {
    const result = isNewPersonalRecord(makeSets(60, 10, 3), null);
    expect(result).toBeNull();
  });

  it("detects new max weight", () => {
    const result = isNewPersonalRecord(makeSets(65, 8, 3), previousBest);
    expect(result).not.toBeNull();
    expect(result!.isPR).toBe(true);
    expect(result!.detail).toContain("65kg");
  });

  it("detects more reps at same weight", () => {
    const result = isNewPersonalRecord(makeSets(60, 12, 3), previousBest);
    expect(result).not.toBeNull();
    expect(result!.isPR).toBe(true);
    expect(result!.detail).toContain("12 reps");
  });

  it("detects new best volume", () => {
    const result = isNewPersonalRecord(makeSets(55, 12, 3), previousBest);
    expect(result).not.toBeNull();
    expect(result!.isPR).toBe(true);
    expect(result!.detail).toContain("volume");
  });

  it("returns null when no PR", () => {
    const result = isNewPersonalRecord(makeSets(55, 8, 3), previousBest);
    expect(result).toBeNull();
  });
});
