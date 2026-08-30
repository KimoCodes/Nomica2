import { describe, it, expect } from "vitest";
import {
  generateWorkoutRecommendation,
  generateQuickWorkout,
} from "@/server/services/fitness-engine/workout-recommendation";
import type { ReadinessScore } from "@/server/services/fitness-engine/types";

function makeHistory(muscleGroups: string[]): never[] {
  return [] as never[];
}

function makeReadiness(score: number): ReadinessScore {
  return {
    score,
    recommendation: score >= 75 ? "high_intensity" : score >= 50 ? "moderate" : score >= 30 ? "light" : "recovery",
    factors: { sleep: 20, energy: 20, habits: 20, recovery: 20, consistency: 20 },
    explanation: `Readiness is ${score}/100`,
  };
}

describe("generateWorkoutRecommendation", () => {
  it("returns rest day for very low readiness", () => {
    const rec = generateWorkoutRecommendation({
      history: [],
      habits: [],
      readiness: makeReadiness(20),
      goal: null,
    });
    expect(rec.type).toBe("rest");
    expect(rec.title).toBe("Rest Day");
    expect(rec.exercises).toHaveLength(0);
  });

  it("returns recovery for low readiness", () => {
    const rec = generateWorkoutRecommendation({
      history: [],
      habits: [],
      readiness: makeReadiness(40),
      goal: null,
    });
    expect(rec.type).toBe("recovery");
    expect(rec.title).toBe("Active Recovery");
    expect(rec.duration).toBeLessThanOrEqual(20);
  });

  it("returns strength workout for high readiness", () => {
    const rec = generateWorkoutRecommendation({
      history: [],
      habits: [],
      readiness: makeReadiness(80),
      goal: "STRENGTH",
    });
    expect(rec.type).toBe("strength");
    expect(rec.intensity).toBe("high");
    expect(rec.duration).toBeGreaterThanOrEqual(40);
  });

  it("returns hypertrophy for moderate readiness", () => {
    const rec = generateWorkoutRecommendation({
      history: [],
      habits: [],
      readiness: makeReadiness(60),
      goal: "MUSCLE_GAIN",
    });
    expect(rec.type).toBe("hypertrophy");
    expect(rec.intensity).toBe("moderate");
  });

  it("includes reason for recommendation", () => {
    const rec = generateWorkoutRecommendation({
      history: [],
      habits: [],
      readiness: makeReadiness(65),
      goal: null,
    });
    expect(rec.reason).toBeTruthy();
    expect(rec.reason.length).toBeGreaterThan(10);
  });
});

describe("generateQuickWorkout", () => {
  it("generates a 15-minute workout", () => {
    const workout = generateQuickWorkout(15);
    expect(workout.duration).toBe(15);
    expect(workout.exercises.length).toBeGreaterThan(0);
    expect(workout.title).toContain("15");
  });

  it("generates a 20-minute workout", () => {
    const workout = generateQuickWorkout(20);
    expect(workout.duration).toBe(20);
    expect(workout.exercises.length).toBeGreaterThan(0);
  });

  it("generates a 30-minute workout", () => {
    const workout = generateQuickWorkout(30);
    expect(workout.duration).toBe(30);
    expect(workout.exercises.length).toBeGreaterThan(0);
  });

  it("scales exercises for odd durations", () => {
    const workout = generateQuickWorkout(25);
    expect(workout.duration).toBeGreaterThan(0);
    expect(workout.exercises.length).toBeGreaterThan(0);
    expect(workout.title).toBeTruthy();
  });

  it("each exercise has required fields", () => {
    const workout = generateQuickWorkout(20);
    for (const ex of workout.exercises) {
      expect(ex.name).toBeTruthy();
      expect(ex.duration).toBeGreaterThan(0);
      expect(ex.type).toBeTruthy();
    }
  });
});
