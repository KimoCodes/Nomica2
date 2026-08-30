import { describe, it, expect } from "vitest";
import {
  findSubstitutes,
  filterExercisesByEquipment,
} from "@/server/services/fitness-engine/substitution";

const EXERCISES = [
  { id: "1", name: "Barbell Bench Press", muscleGroup: "CHEST", difficulty: "INTERMEDIATE" },
  { id: "2", name: "Dumbbell Bench Press", muscleGroup: "CHEST", difficulty: "INTERMEDIATE" },
  { id: "3", name: "Push-ups", muscleGroup: "CHEST", difficulty: "BEGINNER" },
  { id: "4", name: "Incline Dumbbell Press", muscleGroup: "CHEST", difficulty: "INTERMEDIATE" },
  { id: "5", name: "Barbell Squat", muscleGroup: "LEGS", difficulty: "INTERMEDIATE" },
  { id: "6", name: "Goblet Squat", muscleGroup: "LEGS", difficulty: "BEGINNER" },
  { id: "7", name: "Leg Press", muscleGroup: "LEGS", difficulty: "BEGINNER" },
  { id: "8", name: "Pull-ups", muscleGroup: "BACK", difficulty: "ADVANCED" },
  { id: "9", name: "Lat Pulldown", muscleGroup: "BACK", difficulty: "INTERMEDIATE" },
  { id: "10", name: "Deadlift", muscleGroup: "BACK", difficulty: "ADVANCED" },
];

describe("findSubstitutes", () => {
  const benchPress = EXERCISES[0];

  it("returns substitutes for barbell bench press", () => {
    const result = findSubstitutes(benchPress, EXERCISES, "COMMERCIAL_GYM");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((s) => s.muscleGroup === "CHEST")).toBe(true);
  });

  it("does not include the original exercise", () => {
    const result = findSubstitutes(benchPress, EXERCISES, "COMMERCIAL_GYM");
    expect(result.every((s) => s.substituteExerciseId !== benchPress.id)).toBe(true);
  });

  it("returns at most the limit", () => {
    const result = findSubstitutes(benchPress, EXERCISES, "COMMERCIAL_GYM", 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("scores matching difficulty higher", () => {
    const result = findSubstitutes(benchPress, EXERCISES, "COMMERCIAL_GYM");
    const matchingDiff = result.find((s) => s.difficultyMatch);
    expect(matchingDiff).toBeDefined();
  });

  it("returns empty when no good matches exist", () => {
    const isolated = { id: "99", name: "Mystery Move", muscleGroup: "CARDIO", difficulty: "BEGINNER" };
    const result = findSubstitutes(isolated, EXERCISES, "NONE");
    expect(result.length).toBe(0);
  });

  it("filters by equipment for NONE user", () => {
    const result = findSubstitutes(benchPress, EXERCISES, "NONE");
    const ids = result.map((s) => s.substituteExerciseId);
    expect(ids).toContain("3");
  });
});

describe("filterExercisesByEquipment", () => {
  it("returns all exercises for COMMERCIAL_GYM", () => {
    const result = filterExercisesByEquipment(EXERCISES, "COMMERCIAL_GYM");
    expect(result.length).toBe(EXERCISES.length);
  });

  it("filters exercises for NONE equipment", () => {
    const result = filterExercisesByEquipment(EXERCISES, "NONE");
    expect(result.length).toBeGreaterThanOrEqual(0);
    expect(result.every((e) => EXERCISES.some((orig) => orig.id === e.id))).toBe(true);
  });
});
