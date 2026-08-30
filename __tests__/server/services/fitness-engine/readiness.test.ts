import { describe, it, expect } from "vitest";
import { calculateReadinessScore } from "@/server/services/fitness-engine/readiness";
import type {
  WorkoutHistoryEntry,
  HabitData,
  CheckInData,
} from "@/server/services/fitness-engine/types";

function makeHistory(daysAgo: number): WorkoutHistoryEntry[] {
  const completedAt = new Date();
  completedAt.setDate(completedAt.getDate() - daysAgo);
  return [
    {
      completedAt,
      dayTitle: "Day 1",
      exercises: [],
    },
  ];
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

describe("calculateReadinessScore", () => {
  it("returns a score between 0 and 100", () => {
    const result = calculateReadinessScore([], [], null);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("returns higher score with good sleep and energy", () => {
    const checkIn: CheckInData = {
      sleepQuality: 9,
      energyLevel: 9,
      workoutsCompleted: 5,
      submittedAt: new Date(),
      weekStart: new Date(),
    };
    const result = calculateReadinessScore([], [], checkIn);
    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it("returns lower score with poor sleep and energy", () => {
    const checkIn: CheckInData = {
      sleepQuality: 2,
      energyLevel: 2,
      workoutsCompleted: 1,
      submittedAt: new Date(),
      weekStart: new Date(),
    };
    const result = calculateReadinessScore([], [], checkIn);
    expect(result.score).toBeLessThanOrEqual(50);
  });

  it("returns high_intensity recommendation for high scores", () => {
    const checkIn: CheckInData = {
      sleepQuality: 10,
      energyLevel: 10,
      workoutsCompleted: 5,
      submittedAt: new Date(),
      weekStart: new Date(),
    };
    const habits = makeHabits([
      { type: "WATER", value: 8, target: 8, daysAgo: 0 },
      { type: "WATER", value: 8, target: 8, daysAgo: 1 },
      { type: "WATER", value: 8, target: 8, daysAgo: 2 },
    ]);
    const history = makeHistory(2);
    const result = calculateReadinessScore(history, habits, checkIn);
    expect(result.recommendation).toBe("high_intensity");
  });

  it("returns rest recommendation for very low scores", () => {
    const checkIn: CheckInData = {
      sleepQuality: 1,
      energyLevel: 1,
      workoutsCompleted: 0,
      submittedAt: new Date(),
      weekStart: new Date(),
    };
    const result = calculateReadinessScore([], [], checkIn);
    expect(["rest", "recovery", "light"]).toContain(result.recommendation);
  });

  it("includes all factor categories", () => {
    const result = calculateReadinessScore([], [], null);
    expect(result.factors).toHaveProperty("sleep");
    expect(result.factors).toHaveProperty("energy");
    expect(result.factors).toHaveProperty("habits");
    expect(result.factors).toHaveProperty("recovery");
    expect(result.factors).toHaveProperty("consistency");
  });

  it("provides an explanation string", () => {
    const result = calculateReadinessScore([], [], null);
    expect(typeof result.explanation).toBe("string");
    expect(result.explanation.length).toBeGreaterThan(0);
  });
});
