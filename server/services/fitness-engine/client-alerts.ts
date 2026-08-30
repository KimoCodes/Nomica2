export type ClientAlert = {
  clientId: string;
  clientName: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  factors: AlertFactor[];
  suggestedActions: string[];
};

export type AlertFactor = {
  category:
    | "attendance"
    | "engagement"
    | "progress"
    | "checkins"
    | "communication";
  severity: "low" | "medium" | "high";
  description: string;
};

export type ClientData = {
  id: string;
  name: string;
  completionsLast7Days: number;
  completionsLast30Days: number;
  expectedWeeklyWorkouts: number;
  lastWorkoutDaysAgo: number | null;
  checkinResponseRate: number;
  unreadMessages: number;
  lastMessageDaysAgo: number | null;
  progressTrend: "improving" | "stable" | "declining" | null;
  daysSinceStart: number;
  assignedProgram: boolean;
};

function scoreAttendance(client: ClientData): AlertFactor | null {
  if (client.expectedWeeklyWorkouts === 0) return null;

  const adherence = client.completionsLast7Days / client.expectedWeeklyWorkouts;

  if (adherence < 0.25) {
    return {
      category: "attendance",
      severity: "high",
      description: `Only ${client.completionsLast7Days} of ${client.expectedWeeklyWorkouts} expected workouts completed this week.`,
    };
  }
  if (adherence <= 0.5) {
    return {
      category: "attendance",
      severity: "medium",
      description: `Completed ${client.completionsLast7Days} of ${client.expectedWeeklyWorkouts} expected workouts this week.`,
    };
  }
  return null;
}

function scoreInactivity(client: ClientData): AlertFactor | null {
  if (client.lastWorkoutDaysAgo === null || client.lastWorkoutDaysAgo <= 3)
    return null;

  if (client.lastWorkoutDaysAgo >= 14) {
    return {
      category: "attendance",
      severity: "high",
      description: `No workout in ${client.lastWorkoutDaysAgo} days. High dropout risk.`,
    };
  }
  if (client.lastWorkoutDaysAgo >= 7) {
    return {
      category: "attendance",
      severity: "medium",
      description: `Last workout was ${client.lastWorkoutDaysAgo} days ago.`,
    };
  }
  return null;
}

function scoreEngagement(client: ClientData): AlertFactor | null {
  if (client.lastMessageDaysAgo === null) return null;

  if (client.lastMessageDaysAgo >= 14) {
    return {
      category: "engagement",
      severity: "high",
      description: `No communication in ${client.lastMessageDaysAgo} days.`,
    };
  }
  if (client.lastMessageDaysAgo >= 7) {
    return {
      category: "engagement",
      severity: "medium",
      description: `Last message was ${client.lastMessageDaysAgo} days ago.`,
    };
  }
  return null;
}

function scoreCheckins(client: ClientData): AlertFactor | null {
  if (client.checkinResponseRate < 0.3) {
    return {
      category: "checkins",
      severity: "high",
      description: `Check-in response rate is ${Math.round(client.checkinResponseRate * 100)}%.`,
    };
  }
  if (client.checkinResponseRate < 0.6) {
    return {
      category: "checkins",
      severity: "medium",
      description: `Check-in response rate is ${Math.round(client.checkinResponseRate * 100)}%.`,
    };
  }
  return null;
}

function scoreProgress(client: ClientData): AlertFactor | null {
  if (client.progressTrend === "declining") {
    return {
      category: "progress",
      severity: "high",
      description: "Progress metrics are declining.",
    };
  }
  if (client.progressTrend === null && client.daysSinceStart >= 21) {
    return {
      category: "progress",
      severity: "medium",
      description: "No progress data logged after 3+ weeks.",
    };
  }
  return null;
}

function scoreProgram(client: ClientData): AlertFactor | null {
  if (!client.assignedProgram && client.daysSinceStart >= 7) {
    return {
      category: "engagement",
      severity: "medium",
      description: "No active program assigned.",
    };
  }
  return null;
}

function calculateRiskScore(factors: AlertFactor[]): number {
  let score = 0;
  for (const f of factors) {
    if (f.severity === "high") score += 30;
    else if (f.severity === "medium") score += 15;
    else score += 5;
  }
  return Math.min(score, 100);
}

function getRiskLevel(
  score: number,
): ClientAlert["riskLevel"] {
  if (score >= 60) return "critical";
  if (score >= 40) return "high";
  if (score >= 20) return "medium";
  return "low";
}

function buildSuggestedActions(
  factors: AlertFactor[],
): string[] {
  const actions: string[] = [];
  const categories = new Set(factors.map((f) => f.category));

  if (categories.has("attendance")) {
    actions.push("Send a motivational check-in message");
  }
  if (categories.has("engagement")) {
    actions.push("Reach out to reconnect");
  }
  if (categories.has("checkins")) {
    actions.push("Follow up on missed check-ins");
  }
  if (categories.has("progress")) {
    actions.push("Review and adjust the program");
  }
  if (categories.has("communication")) {
    actions.push("Schedule a call or video chat");
  }

  return actions;
}

export function assessClientRisk(client: ClientData): ClientAlert {
  const factors: AlertFactor[] = [];

  const attendance = scoreAttendance(client);
  if (attendance) factors.push(attendance);

  const inactivity = scoreInactivity(client);
  if (inactivity) factors.push(inactivity);

  const engagement = scoreEngagement(client);
  if (engagement) factors.push(engagement);

  const checkins = scoreCheckins(client);
  if (checkins) factors.push(checkins);

  const progress = scoreProgress(client);
  if (progress) factors.push(progress);

  const program = scoreProgram(client);
  if (program) factors.push(program);

  const riskScore = calculateRiskScore(factors);

  return {
    clientId: client.id,
    clientName: client.name,
    riskLevel: getRiskLevel(riskScore),
    riskScore,
    factors,
    suggestedActions: buildSuggestedActions(factors),
  };
}

export function rankClientsByRisk(
  clients: ClientData[],
): ClientAlert[] {
  return clients
    .map(assessClientRisk)
    .sort((a, b) => b.riskScore - a.riskScore);
}
