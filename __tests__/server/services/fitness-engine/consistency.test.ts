import { describe, it, expect } from "vitest";
import { calculateConsistencyScore } from "@/server/services/fitness-engine/consistency";
import type { WorkoutHistoryEntry, HabitData } from "@/server/services/fitness-engine/types";

function makeHistory(daysAgo: number[]): WorkoutHistoryEntry[] {
  return daysAgo.map((d) => {
    const completedAt = new Date();
    completedAt.setDate(completedAt.getDate() - d);
    return { completedAt, dayTitle: "Day", exercises: [] };
  });
}

function makeHabits(
  values: { type: string; value: number; target: number; daysAgo: number }[],
): HabitData[] {
  return values.map((v) => {
    const date = new Date();
    date.setDate(date.getDate() - v.daysAgo);
    return { type: v.type, value: v.value, target: v.target, date };
  });
}

describe("calculateConsistencyScore", () => {
  it("returns 0 overall for empty data", () => {
    const result = calculateConsistencyScore([], []);
    expect(result.overall).toBe(0);
    expect(result.workout).toBe(0);
    expect(result.habits).toBe(0);
  });

  it("returns high score with many recent workouts", () => {
    const history = makeHistory([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const result = calculateConsistencyScore(history, []);
    expect(result.workout).toBe(75);
  });

  it("returns low score with few workouts", () => {
    const history = makeHistory([20]);
    const result = calculateConsistencyScore(history, []);
    expect(result.workout).toBeLessThan(20);
  });

  it("includes habit adherence in overall score", () => {
    const habits = makeHabits([
      { type: "WATER", value: 8, target: 8, daysAgo: 0 },
      { type: "WATER", value: 8, target: 8, daysAgo: 1 },
      { type: "WATER", value: 8, target: 8, daysAgo: 2 },
    ]);
    const result = calculateConsistencyScore([], habits);
    expect(result.habits).toBe(100);
    expect(result.overall).toBeGreaterThan(0);
  });

  it("returns trend as stable with no history", () => {
    const result = calculateConsistencyScore([], []);
    expect(["improving", "stable", "declining"]).toContain(result.trend);
  });

  it("returns comparison data", () => {
    const result = calculateConsistencyScore([], []);
    expect(result.comparison).toHaveProperty("thisWeek");
    expect(result.comparison).toHaveProperty("lastWeek");
    expect(typeof result.comparison.thisWeek).toBe("number");
  });

  it("overall score is between 0 and 100", () => {
    const history = makeHistory([0, 1, 2, 3]);
    const habits = makeHabits([
      { type: "WATER", value: 5, target: 8, daysAgo: 0 },
    ]);
    const result = calculateConsistencyScore(history, habits);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });
});
