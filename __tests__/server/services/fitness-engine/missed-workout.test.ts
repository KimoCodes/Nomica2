import { describe, it, expect } from "vitest";
import { getMissedWorkoutOptions } from "@/server/services/fitness-engine/missed-workout";
import type { WorkoutHistoryEntry } from "@/server/services/fitness-engine/types";

function makeHistory(daysAgo: number[]): WorkoutHistoryEntry[] {
  return daysAgo.map((d) => {
    const completedAt = new Date();
    completedAt.setDate(completedAt.getDate() - d);
    return { completedAt, dayTitle: "Day", exercises: [] };
  });
}

describe("getMissedWorkoutOptions", () => {
  it("always returns at least one option", () => {
    const result = getMissedWorkoutOptions([], "Missed Day");
    expect(result.length).toBeGreaterThan(0);
  });

  it("always includes continue option", () => {
    const result = getMissedWorkoutOptions([], "Missed Day");
    const continueOption = result.find((o) => o.id === "continue");
    expect(continueOption).toBeDefined();
  });

  it("suggests ease-in for long inactivity", () => {
    const history = makeHistory([10, 12]);
    const result = getMissedWorkoutOptions(history, "Missed Day");
    const easeIn = result.find((o) => o.id === "ease-in");
    expect(easeIn).toBeDefined();
    expect(easeIn!.priority).toBe("recommended");
  });

  it("does not suggest ease-in for recent activity", () => {
    const history = makeHistory([0, 1, 2]);
    const result = getMissedWorkoutOptions(history, "Missed Day");
    const easeIn = result.find((o) => o.id === "ease-in");
    expect(easeIn).toBeUndefined();
  });

  it("suggests rest when training heavily", () => {
    const history = makeHistory([0, 1, 2, 3, 4]);
    const result = getMissedWorkoutOptions(history, "Missed Day");
    const rest = result.find((o) => o.id === "rest");
    expect(rest).toBeDefined();
    expect(rest!.priority).toBe("recommended");
  });

  it("does not suggest rest when training lightly", () => {
    const history = makeHistory([5]);
    const result = getMissedWorkoutOptions(history, "Missed Day");
    const rest = result.find((o) => o.id === "rest");
    expect(rest).toBeUndefined();
  });

  it("includes estimated minutes for ease-in", () => {
    const history = makeHistory([10]);
    const result = getMissedWorkoutOptions(history, "Missed Day");
    const easeIn = result.find((o) => o.id === "ease-in");
    expect(easeIn!.estimatedMinutes).toBe(20);
  });

  it("returns options with valid structure", () => {
    const result = getMissedWorkoutOptions([], "Missed Day");
    for (const option of result) {
      expect(option).toHaveProperty("id");
      expect(option).toHaveProperty("title");
      expect(option).toHaveProperty("description");
      expect(option).toHaveProperty("priority");
      expect(["recommended", "alternative", "skip"]).toContain(option.priority);
    }
  });
});
