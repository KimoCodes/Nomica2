import { describe, it, expect } from "vitest";
import {
  calculateDifficultyAdjustment,
  getRPELabel,
  getRPEColor,
  calculateWeeklyRPEAverages,
} from "@/server/services/fitness-engine/adaptive-difficulty";

describe("getRPELabel", () => {
  it("returns correct labels", () => {
    expect(getRPELabel(1)).toBe("Very Easy");
    expect(getRPELabel(5)).toBe("Moderate");
    expect(getRPELabel(10)).toBe("Max Effort");
  });
});

describe("getRPEColor", () => {
  it("returns green for low RPE", () => {
    expect(getRPEColor(2)).toContain("green");
  });

  it("returns red for high RPE", () => {
    expect(getRPEColor(9)).toContain("red");
  });
});

describe("calculateDifficultyAdjustment", () => {
  it("progresses when RPE is very low", () => {
    const result = calculateDifficultyAdjustment({
      recentRPEs: [3, 3, 4],
      currentWeight: 30,
      currentReps: 10,
      targetReps: 10,
      weeksAtWeight: 1,
    });
    expect(result.shouldProgress).toBe(true);
    expect(result.weightChange).toBeGreaterThan(0);
  });

  it("deloads when RPE is consistently high", () => {
    const result = calculateDifficultyAdjustment({
      recentRPEs: [9, 9, 10],
      currentWeight: 80,
      currentReps: 5,
      targetReps: 5,
      weeksAtWeight: 3,
    });
    expect(result.shouldDeload).toBe(true);
    expect(result.weightChange).toBeLessThan(0);
  });

  it("maintains when RPE is moderate and below target reps", () => {
    const result = calculateDifficultyAdjustment({
      recentRPEs: [6, 6, 7],
      currentWeight: 50,
      currentReps: 8,
      targetReps: 10,
      weeksAtWeight: 1,
    });
    expect(result.shouldProgress).toBe(false);
    expect(result.shouldDeload).toBe(false);
  });

  it("returns low confidence with no data", () => {
    const result = calculateDifficultyAdjustment({
      recentRPEs: [],
      currentWeight: 30,
      currentReps: 10,
      targetReps: 10,
      weeksAtWeight: 0,
    });
    expect(result.confidence).toBe("low");
    expect(result.reason).toContain("No RPE data");
  });
});

describe("calculateWeeklyRPEAverages", () => {
  it("groups RPEs by week", () => {
    const history = [
      { date: new Date("2024-01-01"), rpe: 6 as const },
      { date: new Date("2024-01-02"), rpe: 7 as const },
      { date: new Date("2024-01-08"), rpe: 8 as const },
    ];
    const result = calculateWeeklyRPEAverages(history);
    expect(result.length).toBe(2);
    expect(result[0]!.count).toBe(2);
    expect(result[1]!.count).toBe(1);
  });
});
