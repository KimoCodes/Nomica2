import type { ClientData } from "./client-alerts";
import { assessClientRisk } from "./client-alerts";

export type CoachInsight = {
  category:
    | "at_risk"
    | "needs_attention"
    | "milestone"
    | "trend"
    | "action_required";
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  priority: number;
};

export type CoachDashboardSummary = {
  totalClients: number;
  activeClients: number;
  atRiskCount: number;
  needsAttentionCount: number;
  insights: CoachInsight[];
  clientRiskMap: Map<string, { riskLevel: string; riskScore: number }>;
};

function identifyAtRiskClients(clients: ClientData[]): CoachInsight[] {
  const insights: CoachInsight[] = [];

  for (const client of clients) {
    const assessment = assessClientRisk(client);
    if (assessment.riskLevel === "critical" || assessment.riskLevel === "high") {
      insights.push({
        category: "at_risk",
        title: `${client.name} is at ${assessment.riskLevel} risk`,
        description:
          assessment.factors.length > 0
            ? assessment.factors[0].description
            : "Multiple risk factors detected.",
        clientId: client.id,
        clientName: client.name,
        priority: assessment.riskScore,
      });
    }
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

function identifyNeedsAttention(clients: ClientData[]): CoachInsight[] {
  const insights: CoachInsight[] = [];

  for (const client of clients) {
    const assessment = assessClientRisk(client);
    if (assessment.riskLevel === "medium") {
      insights.push({
        category: "needs_attention",
        title: `${client.name} may need follow-up`,
        description:
          assessment.factors.length > 0
            ? assessment.factors[0].description
            : "Some risk factors present.",
        clientId: client.id,
        clientName: client.name,
        priority: assessment.riskScore,
      });
    }
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

function identifyMilestones(clients: ClientData[]): CoachInsight[] {
  const insights: CoachInsight[] = [];

  for (const client of clients) {
    if (client.daysSinceStart === 7) {
      insights.push({
        category: "milestone",
        title: `${client.name} completed week 1`,
        description: "First week milestone reached. Check in to maintain momentum.",
        clientId: client.id,
        clientName: client.name,
        priority: 5,
      });
    } else if (client.daysSinceStart === 30) {
      insights.push({
        category: "milestone",
        title: `${client.name} completed month 1`,
        description:
          "One month milestone. Review progress and discuss next steps.",
        clientId: client.id,
        clientName: client.name,
        priority: 10,
      });
    } else if (client.daysSinceStart === 90) {
      insights.push({
        category: "milestone",
        title: `${client.name} completed 3 months`,
        description: "Quarter milestone. Consider program progression.",
        clientId: client.id,
        clientName: client.name,
        priority: 15,
      });
    }
  }

  return insights;
}

function identifyTrends(clients: ClientData[]): CoachInsight[] {
  const insights: CoachInsight[] = [];

  const declining = clients.filter((c) => c.progressTrend === "declining");
  if (declining.length >= 3) {
    insights.push({
      category: "trend",
      title: `${declining.length} clients showing declining progress`,
      description:
        "Consider reviewing training programs for these clients.",
      priority: 20,
    });
  }

  const noCheckins = clients.filter((c) => c.checkinResponseRate < 0.3);
  if (noCheckins.length >= 2) {
    insights.push({
      category: "trend",
      title: `${noCheckins.length} clients not responding to check-ins`,
      description:
        "Low check-in response may indicate disengagement.",
      priority: 15,
    });
  }

  return insights;
}

function identifyActions(clients: ClientData[]): CoachInsight[] {
  const insights: CoachInsight[] = [];

  for (const client of clients) {
    if (
      client.lastMessageDaysAgo !== null &&
      client.lastMessageDaysAgo >= 7 &&
      client.completionsLast7Days === 0
    ) {
      insights.push({
        category: "action_required",
        title: `Follow up with ${client.name}`,
        description:
          "No recent workouts and no communication. Proactive outreach recommended.",
        clientId: client.id,
        clientName: client.name,
        priority: 25,
      });
    }
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

export function buildCoachSummary(
  clients: ClientData[],
): CoachDashboardSummary {
  const atRisk = identifyAtRiskClients(clients);
  const needsAttention = identifyNeedsAttention(clients);
  const milestones = identifyMilestones(clients);
  const trends = identifyTrends(clients);
  const actions = identifyActions(clients);

  const allInsights = [...actions, ...atRisk, ...needsAttention, ...milestones, ...trends].sort(
    (a, b) => b.priority - a.priority,
  );

  const clientRiskMap = new Map<string, { riskLevel: string; riskScore: number }>();
  for (const client of clients) {
    const assessment = assessClientRisk(client);
    clientRiskMap.set(client.id, {
      riskLevel: assessment.riskLevel,
      riskScore: assessment.riskScore,
    });
  }

  return {
    totalClients: clients.length,
    activeClients: clients.filter(
      (c) => c.completionsLast30Days > 0 || c.lastWorkoutDaysAgo === null,
    ).length,
    atRiskCount: atRisk.length,
    needsAttentionCount: needsAttention.length,
    insights: allInsights,
    clientRiskMap,
  };
}
