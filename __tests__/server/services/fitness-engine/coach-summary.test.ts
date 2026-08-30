import { describe, it, expect } from "vitest";
import { buildCoachSummary } from "@/server/services/fitness-engine/coach-summary";
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

describe("buildCoachSummary", () => {
  it("returns correct totals", () => {
    const clients = [makeClient(), makeClient({ id: "c2", name: "Client 2" })];
    const result = buildCoachSummary(clients);
    expect(result.totalClients).toBe(2);
    expect(result.activeClients).toBe(2);
    expect(result.atRiskCount).toBe(0);
  });

  it("identifies at-risk clients", () => {
    const clients = [
      makeClient({
        id: "c1",
        name: "Good Client",
        completionsLast7Days: 4,
        lastWorkoutDaysAgo: 0,
      }),
      makeClient({
        id: "c2",
        name: "At Risk",
        completionsLast7Days: 0,
        lastWorkoutDaysAgo: 15,
        checkinResponseRate: 0.1,
      }),
    ];
    const result = buildCoachSummary(clients);
    expect(result.atRiskCount).toBe(1);
  });

  it("identifies milestone clients", () => {
    const clients = [
      makeClient({ id: "c1", name: "Week 1", daysSinceStart: 7 }),
      makeClient({ id: "c2", name: "Month 1", daysSinceStart: 30 }),
    ];
    const result = buildCoachSummary(clients);
    const milestones = result.insights.filter((i) => i.category === "milestone");
    expect(milestones.length).toBe(2);
  });

  it("identifies trend insights for multiple declining clients", () => {
    const clients = [
      makeClient({ id: "c1", name: "C1", progressTrend: "declining" }),
      makeClient({ id: "c2", name: "C2", progressTrend: "declining" }),
      makeClient({ id: "c3", name: "C3", progressTrend: "declining" }),
    ];
    const result = buildCoachSummary(clients);
    const trends = result.insights.filter((i) => i.category === "trend");
    expect(trends.length).toBeGreaterThan(0);
  });

  it("populates clientRiskMap", () => {
    const clients = [makeClient({ id: "c1" })];
    const result = buildCoachSummary(clients);
    expect(result.clientRiskMap.has("c1")).toBe(true);
    expect(result.clientRiskMap.get("c1")).toHaveProperty("riskLevel");
    expect(result.clientRiskMap.get("c1")).toHaveProperty("riskScore");
  });

  it("insights are sorted by priority descending", () => {
    const clients = [
      makeClient({ id: "c1", name: "C1", daysSinceStart: 7 }),
      makeClient({
        id: "c2",
        name: "C2",
        completionsLast7Days: 0,
        lastWorkoutDaysAgo: 20,
        lastMessageDaysAgo: 20,
        checkinResponseRate: 0,
        progressTrend: "declining",
      }),
    ];
    const result = buildCoachSummary(clients);
    for (let i = 1; i < result.insights.length; i++) {
      expect(result.insights[i - 1].priority).toBeGreaterThanOrEqual(
        result.insights[i].priority,
      );
    }
  });

  it("returns empty insights for empty input", () => {
    const result = buildCoachSummary([]);
    expect(result.totalClients).toBe(0);
    expect(result.insights).toEqual([]);
  });
});
