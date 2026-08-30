import { describe, it, expect } from "vitest";
import {
  searchExercises,
  generateSurpriseWorkout,
} from "@/server/services/fitness-engine/exercise-search";

describe("searchExercises", () => {
  it("returns all exercises with no filters", () => {
    const results = searchExercises({});
    expect(results.length).toBeGreaterThan(0);
  });

  it("filters by muscle group", () => {
    const results = searchExercises({ muscleGroup: "CHEST" });
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.muscleGroup).toBe("CHEST");
    }
  });

  it("filters by equipment", () => {
    const results = searchExercises({ equipment: "none" });
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.equipment).toBe("none");
    }
  });

  it("filters by difficulty", () => {
    const results = searchExercises({ difficulty: "BEGINNER" });
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.difficulty).toBe("BEGINNER");
    }
  });

  it("filters by max duration", () => {
    const results = searchExercises({ maxDuration: 5 });
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.duration).toBeLessThanOrEqual(5);
    }
  });

  it("filters by location", () => {
    const results = searchExercises({ location: "home" });
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.location).toBe("home");
    }
  });

  it("combines multiple filters", () => {
    const results = searchExercises({
      muscleGroup: "LEGS",
      equipment: "none",
      difficulty: "BEGINNER",
    });
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.muscleGroup).toBe("LEGS");
      expect(ex.equipment).toBe("none");
      expect(ex.difficulty).toBe("BEGINNER");
    }
  });
});

describe("generateSurpriseWorkout", () => {
  it("generates a workout with time constraint", () => {
    const workout = generateSurpriseWorkout({
      availableMinutes: 20,
      equipment: "none",
      fitnessLevel: "BEGINNER",
      goal: null,
    });
    expect(workout.duration).toBe(20);
    expect(workout.exercises.length).toBeGreaterThan(0);
    expect(workout.title).toBeTruthy();
    expect(workout.reason).toBeTruthy();
  });

  it("respects equipment filter", () => {
    const workout = generateSurpriseWorkout({
      availableMinutes: 30,
      equipment: "dumbbell",
      fitnessLevel: "INTERMEDIATE",
      goal: "MUSCLE_GAIN",
    });
    expect(workout.equipment).toBe("dumbbell");
    expect(workout.exercises.length).toBeGreaterThan(0);
  });

  it("includes exercise details", () => {
    const workout = generateSurpriseWorkout({
      availableMinutes: 20,
      equipment: "none",
      fitnessLevel: "BEGINNER",
      goal: null,
    });
    for (const ex of workout.exercises) {
      expect(ex.name).toBeTruthy();
      expect(ex.muscleGroup).toBeTruthy();
      expect(ex.sets).toBeGreaterThan(0);
      expect(ex.reps).toBeGreaterThan(0);
    }
  });
});
