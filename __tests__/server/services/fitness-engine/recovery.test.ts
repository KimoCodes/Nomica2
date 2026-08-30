import { describe, it, expect } from "vitest";
import { generateRecoveryInsights } from "@/server/services/fitness-engine/recovery";
import type {
  WorkoutHistoryEntry,
  HabitData,
  CheckInData,
} from "@/server/services/fitness-engine/types";

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

describe("generateRecoveryInsights", () => {
  it("generates training insight when no history", () => {
    const result = generateRecoveryInsights([], [], null);
    const trainingInsight = result.find((i) => i.category === "training");
    expect(trainingInsight).toBeDefined();
    expect(trainingInsight!.message).toContain("7 days");
  });

  it("warns about poor sleep", () => {
    const checkIn: CheckInData = {
      sleepQuality: 2,
      energyLevel: 5,
      workoutsCompleted: 3,
      submittedAt: new Date(),
      weekStart: new Date(),
    };
    const result = generateRecoveryInsights([], [], checkIn);
    const sleepWarning = result.find((i) => i.category === "sleep");
    expect(sleepWarning).toBeDefined();
    expect(sleepWarning!.severity).toBe("warning");
    expect(sleepWarning!.actionable).toBe(true);
  });

  it("praises good sleep", () => {
    const checkIn: CheckInData = {
      sleepQuality: 9,
      energyLevel: 5,
      workoutsCompleted: 3,
      submittedAt: new Date(),
      weekStart: new Date(),
    };
    const result = generateRecoveryInsights([], [], checkIn);
    const sleepPositive = result.find(
      (i) => i.category === "sleep" && i.severity === "positive",
    );
    expect(sleepPositive).toBeDefined();
  });

  it("warns about too many workouts in a week", () => {
    const history = makeHistory([0, 1, 2, 3, 4, 5, 6]);
    const result = generateRecoveryInsights(history, [], null);
    const trainingWarning = result.find(
      (i) => i.category === "training" && i.severity === "warning",
    );
    expect(trainingWarning).toBeDefined();
    expect(trainingWarning!.message).toContain("7");
  });

  it("warns about inactivity", () => {
    const history = makeHistory([10, 12]);
    const result = generateRecoveryInsights(history, [], null);
    const inactivityWarning = result.find(
      (i) => i.category === "training" && i.severity === "warning",
    );
    expect(inactivityWarning).toBeDefined();
  });

  it("warns about low habit adherence", () => {
    const habits = makeHabits([
      { type: "WATER", value: 1, target: 8, daysAgo: 0 },
      { type: "WATER", value: 1, target: 8, daysAgo: 1 },
      { type: "WATER", value: 1, target: 8, daysAgo: 2 },
    ]);
    const result = generateRecoveryInsights([], habits, null);
    const habitWarning = result.find((i) => i.category === "habits");
    expect(habitWarning).toBeDefined();
    expect(habitWarning!.severity).toBe("warning");
  });

  it("warns about low energy", () => {
    const checkIn: CheckInData = {
      sleepQuality: 5,
      energyLevel: 2,
      workoutsCompleted: 3,
      submittedAt: new Date(),
      weekStart: new Date(),
    };
    const result = generateRecoveryInsights([], [], checkIn);
    const energyWarning = result.find(
      (i) => i.category === "general" && i.severity === "warning",
    );
    expect(energyWarning).toBeDefined();
    expect(energyWarning!.message).toContain("energy");
  });

  it("praises high energy", () => {
    const checkIn: CheckInData = {
      sleepQuality: 5,
      energyLevel: 9,
      workoutsCompleted: 3,
      submittedAt: new Date(),
      weekStart: new Date(),
    };
    const result = generateRecoveryInsights([], [], checkIn);
    const energyPositive = result.find(
      (i) => i.category === "general" && i.severity === "positive",
    );
    expect(energyPositive).toBeDefined();
  });
});
