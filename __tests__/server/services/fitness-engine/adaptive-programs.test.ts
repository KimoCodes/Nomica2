import { describe, it, expect } from "vitest";
import { analyzeProgramPerformance, suggestDeloadWeek } from "@/server/services/fitness-engine/adaptive-programs";

function makeCompletion(
  daysAgo: number,
  exercises: { name: string; weight: number; reps: number; completed: boolean }[]
) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    completedAt: date,
    exercises: exercises.map((e) => ({
      name: e.name,
      sets: [
        { actualWeight: e.weight, actualReps: e.reps, completed: e.completed },
        { actualWeight: e.weight, actualReps: e.reps, completed: e.completed },
      ],
    })),
  };
}

describe("analyzeProgramPerformance", () => {
  it("returns snapshots for each exercise", () => {
    const result = analyzeProgramPerformance({
      programId: "p1",
      completions: [
        makeCompletion(10, [{ name: "Bench Press", weight: 60, reps: 10, completed: true }]),
        makeCompletion(3, [{ name: "Bench Press", weight: 65, reps: 10, completed: true }]),
      ],
      currentWeek: 4,
      totalWeeks: 8,
    });
    expect(result.snapshots.length).toBe(1);
    expect(result.snapshots[0]!.exerciseName).toBe("Bench Press");
  });

  it("detects improving trend", () => {
    const result = analyzeProgramPerformance({
      programId: "p1",
      completions: [
        makeCompletion(2, [{ name: "Squat", weight: 80, reps: 8, completed: true }]),
        makeCompletion(9, [{ name: "Squat", weight: 70, reps: 8, completed: true }]),
      ],
      currentWeek: 4,
      totalWeeks: 8,
    });
    expect(result.snapshots[0]!.trend).toBe("improving");
  });

  it("detects declining trend", () => {
    const result = analyzeProgramPerformance({
      programId: "p1",
      completions: [
        makeCompletion(2, [{ name: "Deadlift", weight: 80, reps: 5, completed: true }]),
        makeCompletion(9, [{ name: "Deadlift", weight: 90, reps: 5, completed: true }]),
      ],
      currentWeek: 4,
      totalWeeks: 8,
    });
    expect(result.snapshots[0]!.trend).toBe("declining");
  });

  it("recommends difficulty increase for high completion rate", () => {
    const result = analyzeProgramPerformance({
      programId: "p1",
      completions: [
        makeCompletion(1, [{ name: "Press", weight: 40, reps: 10, completed: true }]),
        makeCompletion(4, [{ name: "Press", weight: 38, reps: 10, completed: true }]),
        makeCompletion(7, [{ name: "Press", weight: 36, reps: 10, completed: true }]),
      ],
      currentWeek: 4,
      totalWeeks: 8,
    });
    expect(result.adjustment.changes.some((c) => c.type === "increase_difficulty")).toBe(true);
  });

  it("has high confidence with 6+ completions", () => {
    const result = analyzeProgramPerformance({
      programId: "p1",
      completions: Array.from({ length: 8 }, (_, i) =>
        makeCompletion(i + 1, [{ name: "Row", weight: 50, reps: 10, completed: true }])
      ),
      currentWeek: 4,
      totalWeeks: 8,
    });
    expect(result.adjustment.confidence).toBe("high");
  });
});

describe("suggestDeloadWeek", () => {
  it("suggests deload after 4+ weeks", () => {
    const result = suggestDeloadWeek({
      recentRPEs: [6, 7, 6],
      weeksSinceDeload: 5,
      avgSleep: 7,
      consistency: 90,
    });
    expect(result.shouldDeload).toBe(true);
    expect(result.suggestedActivities.length).toBeGreaterThan(0);
  });

  it("suggests deload for consistently high RPE", () => {
    const result = suggestDeloadWeek({
      recentRPEs: [8, 9, 8, 9],
      weeksSinceDeload: 2,
      avgSleep: 7,
      consistency: 85,
    });
    expect(result.shouldDeload).toBe(true);
  });

  it("does not deload when everything is fine", () => {
    const result = suggestDeloadWeek({
      recentRPEs: [5, 6, 5],
      weeksSinceDeload: 2,
      avgSleep: 7.5,
      consistency: 90,
    });
    expect(result.shouldDeload).toBe(false);
  });
});
