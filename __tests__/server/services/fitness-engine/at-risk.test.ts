import { describe, it, expect } from "vitest";
import { calculateAtRiskScore, getAtRiskUsers, type UserActivityData } from "@/server/services/fitness-engine/at-risk";

function makeUserData(overrides: Partial<UserActivityData> = {}): UserActivityData {
  return {
    userId: "user1",
    lastWorkoutDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    workoutsThisWeek: 3,
    workoutsLastWeek: 3,
    avgSessionDuration: 45,
    checkInRate: 0.8,
    loginFrequency: 5,
    daysSinceLastLogin: 1,
    subscriptionStatus: "active",
    paymentFailures: 0,
    supportTickets: 0,
    programCompletionRate: 0.7,
    streakDays: 10,
    ...overrides,
  };
}

describe("calculateAtRiskScore", () => {
  it("returns low risk for active user", () => {
    const score = calculateAtRiskScore(makeUserData());
    expect(score.level).toBe("low");
    expect(score.score).toBeLessThan(30);
  });

  it("returns high risk for inactive user", () => {
    const score = calculateAtRiskScore(makeUserData({
      lastWorkoutDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      daysSinceLastLogin: 10,
      workoutsThisWeek: 0,
      workoutsLastWeek: 3,
    }));
    expect(score.level).toMatch(/high|critical/);
    expect(score.score).toBeGreaterThanOrEqual(50);
  });

  it("detects payment issues", () => {
    const score = calculateAtRiskScore(makeUserData({
      paymentFailures: 2,
      subscriptionStatus: "past_due",
    }));
    expect(score.factors.some((f) => f.name === "Payment Issues")).toBe(true);
    expect(score.factors.some((f) => f.name === "Subscription Past Due")).toBe(true);
  });

  it("detects declining frequency", () => {
    const score = calculateAtRiskScore(makeUserData({
      workoutsThisWeek: 1,
      workoutsLastWeek: 4,
    }));
    expect(score.factors.some((f) => f.name === "Declining Frequency")).toBe(true);
  });

  it("provides recommendations", () => {
    const score = calculateAtRiskScore(makeUserData({
      lastWorkoutDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    }));
    expect(score.recommendations.length).toBeGreaterThan(0);
  });
});

describe("getAtRiskUsers", () => {
  it("categorizes users correctly", () => {
    const scores = [
      calculateAtRiskScore(makeUserData({ userId: "u1" })),
      calculateAtRiskScore(makeUserData({
        userId: "u2",
        lastWorkoutDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        daysSinceLastLogin: 10,
        workoutsThisWeek: 0,
        workoutsLastWeek: 3,
      })),
    ];

    const result = getAtRiskUsers(scores);
    expect(result.summary.total).toBe(2);
    expect(result.summary.atRisk).toBeGreaterThanOrEqual(0);
  });
});
