import { describe, it, expect } from "vitest";
import {
  calculatePoints,
  checkUnlockedBadges,
  getPointsForNextBadge,
  getAllBadges,
} from "@/server/services/fitness-engine/gamification";

describe("calculatePoints", () => {
  it("calculates workout points", () => {
    const points = calculatePoints({
      workoutsCompleted: 10,
      streakDays: 0,
      checkInsCompleted: 0,
      referralsCompleted: 0,
      prsSet: 0,
    });
    expect(points.total).toBe(100);
    expect(points.breakdown.workouts).toBe(100);
  });

  it("calculates streak points", () => {
    const points = calculatePoints({
      workoutsCompleted: 0,
      streakDays: 7,
      checkInsCompleted: 0,
      referralsCompleted: 0,
      prsSet: 0,
    });
    expect(points.total).toBe(35);
    expect(points.breakdown.streaks).toBe(35);
  });

  it("calculates combined points", () => {
    const points = calculatePoints({
      workoutsCompleted: 5,
      streakDays: 3,
      checkInsCompleted: 2,
      referralsCompleted: 1,
      prsSet: 3,
    });
    expect(points.total).toBe(50 + 15 + 30 + 50 + 60);
  });
});

describe("checkUnlockedBadges", () => {
  it("unlocks first workout badge", () => {
    const badges = checkUnlockedBadges({
      workoutsCompleted: 1,
      currentStreak: 0,
      checkInsCompleted: 0,
      referralsCompleted: 0,
      prsSet: 0,
      joinDate: new Date(),
    });
    expect(badges.some((b) => b.id === "first_workout")).toBe(true);
  });

  it("unlocks streak badges", () => {
    const badges = checkUnlockedBadges({
      workoutsCompleted: 0,
      currentStreak: 7,
      checkInsCompleted: 0,
      referralsCompleted: 0,
      prsSet: 0,
      joinDate: new Date(),
    });
    expect(badges.some((b) => b.id === "streak_3")).toBe(true);
    expect(badges.some((b) => b.id === "streak_7")).toBe(true);
    expect(badges.some((b) => b.id === "streak_14")).toBe(false);
  });

  it("does not unlock locked badges", () => {
    const badges = checkUnlockedBadges({
      workoutsCompleted: 5,
      currentStreak: 2,
      checkInsCompleted: 0,
      referralsCompleted: 0,
      prsSet: 0,
      joinDate: new Date(),
    });
    expect(badges.some((b) => b.id === "workout_10")).toBe(false);
    expect(badges.some((b) => b.id === "streak_3")).toBe(false);
  });
});

describe("getPointsForNextBadge", () => {
  it("finds next workout badge", () => {
    const result = getPointsForNextBadge({
      workoutsCompleted: 15,
      currentStreak: 0,
      checkInsCompleted: 0,
      referralsCompleted: 0,
      prsSet: 0,
    });
    expect(result).not.toBeNull();
    expect(result!.nextBadge.id).toBe("workout_25");
    expect(result!.needed).toBe(10);
  });

  it("returns null when all badges unlocked", () => {
    const result = getPointsForNextBadge({
      workoutsCompleted: 100,
      currentStreak: 100,
      checkInsCompleted: 12,
      referralsCompleted: 5,
      prsSet: 20,
    });
    expect(result).toBeNull();
  });
});

describe("getAllBadges", () => {
  it("returns all badge definitions", () => {
    const badges = getAllBadges();
    expect(badges.length).toBeGreaterThan(0);
    expect(badges.every((b) => b.id && b.name && b.icon)).toBe(true);
  });
});
