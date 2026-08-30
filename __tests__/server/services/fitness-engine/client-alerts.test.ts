import { describe, it, expect } from "vitest";
import {
  assessClientRisk,
  rankClientsByRisk,
} from "@/server/services/fitness-engine/client-alerts";
import type { ClientData } from "@/server/services/fitness-engine/client-alerts";

function makeClient(overrides: Partial<ClientData> = {}): ClientData {
  return {
    id: "c1",
    name: "Test Client",
    completionsLast7Days: 3,
    completionsLast30Days: 12,
    expectedWeeklyWorkouts: 4,
    lastWorkoutDaysAgo: 1,
    checkinResponseRate: 0.8,
    unreadMessages: 0,
    lastMessageDaysAgo: 2,
    progressTrend: "stable",
    daysSinceStart: 30,
    assignedProgram: true,
    ...overrides,
  };
}

describe("assessClientRisk", () => {
  it("returns low risk for healthy client", () => {
    const client = makeClient();
    const result = assessClientRisk(client);
    expect(result.riskLevel).toBe("low");
    expect(result.riskScore).toBe(0);
    expect(result.factors).toHaveLength(0);
  });

  it("detects low attendance", () => {
    const client = makeClient({ completionsLast7Days: 1, expectedWeeklyWorkouts: 4 });
    const result = assessClientRisk(client);
    expect(result.factors.some((f) => f.category === "attendance")).toBe(true);
  });

  it("detects inactivity", () => {
    const client = makeClient({ lastWorkoutDaysAgo: 10 });
    const result = assessClientRisk(client);
    expect(result.factors.some((f) => f.category === "attendance")).toBe(true);
  });

  it("detects disengagement", () => {
    const client = makeClient({ lastMessageDaysAgo: 10 });
    const result = assessClientRisk(client);
    expect(result.factors.some((f) => f.category === "engagement")).toBe(true);
  });

  it("detects low check-in rate", () => {
    const client = makeClient({ checkinResponseRate: 0.2 });
    const result = assessClientRisk(client);
    expect(result.factors.some((f) => f.category === "checkins")).toBe(true);
  });

  it("detects declining progress", () => {
    const client = makeClient({ progressTrend: "declining" });
    const result = assessClientRisk(client);
    expect(result.factors.some((f) => f.category === "progress")).toBe(true);
  });

  it("detects missing program", () => {
    const client = makeClient({ assignedProgram: false, daysSinceStart: 14 });
    const result = assessClientRisk(client);
    expect(result.factors.some((f) => f.description.includes("No active program"))).toBe(true);
  });

  it("combines multiple risk factors", () => {
    const client = makeClient({
      completionsLast7Days: 0,
      lastWorkoutDaysAgo: 15,
      lastMessageDaysAgo: 20,
      checkinResponseRate: 0.1,
      progressTrend: "declining",
    });
    const result = assessClientRisk(client);
    expect(result.factors.length).toBeGreaterThanOrEqual(3);
    expect(result.riskLevel).toBe("critical");
  });

  it("provides suggested actions", () => {
    const client = makeClient({
      completionsLast7Days: 0,
      lastWorkoutDaysAgo: 10,
      checkinResponseRate: 0.1,
    });
    const result = assessClientRisk(client);
    expect(result.suggestedActions.length).toBeGreaterThan(0);
  });

  it("risk score caps at 100", () => {
    const client = makeClient({
      completionsLast7Days: 0,
      lastWorkoutDaysAgo: 30,
      lastMessageDaysAgo: 30,
      checkinResponseRate: 0,
      progressTrend: "declining",
      assignedProgram: false,
      daysSinceStart: 30,
    });
    const result = assessClientRisk(client);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });
});

describe("rankClientsByRisk", () => {
  it("returns clients sorted by risk score descending", () => {
    const clients = [
      makeClient({ id: "c1", name: "Low Risk", completionsLast7Days: 4, lastWorkoutDaysAgo: 0 }),
      makeClient({
        id: "c2",
        name: "High Risk",
        completionsLast7Days: 0,
        lastWorkoutDaysAgo: 15,
        checkinResponseRate: 0.1,
      }),
      makeClient({ id: "c3", name: "Medium Risk", completionsLast7Days: 2, lastWorkoutDaysAgo: 5 }),
    ];
    const result = rankClientsByRisk(clients);
    expect(result[0].clientName).toBe("High Risk");
    expect(result[1].clientName).toBe("Medium Risk");
    expect(result[2].clientName).toBe("Low Risk");
  });

  it("returns empty array for empty input", () => {
    const result = rankClientsByRisk([]);
    expect(result).toEqual([]);
  });
});
