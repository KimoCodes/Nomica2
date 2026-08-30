export type AtRiskScore = {
  userId: string;
  score: number;
  level: "low" | "medium" | "high" | "critical";
  factors: AtRiskFactor[];
  recommendations: string[];
  lastCalculated: string;
};

export type AtRiskFactor = {
  name: string;
  impact: number;
  description: string;
};

export type UserActivityData = {
  userId: string;
  lastWorkoutDate: Date | null;
  workoutsThisWeek: number;
  workoutsLastWeek: number;
  avgSessionDuration: number;
  checkInRate: number;
  loginFrequency: number;
  daysSinceLastLogin: number;
  subscriptionStatus: string;
  paymentFailures: number;
  supportTickets: number;
  programCompletionRate: number;
  streakDays: number;
};

export function calculateAtRiskScore(data: UserActivityData): AtRiskScore {
  const factors: AtRiskFactor[] = [];
  let totalScore = 0;

  const daysSinceWorkout = data.lastWorkoutDate
    ? Math.floor((Date.now() - data.lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  if (daysSinceWorkout > 7) {
    const impact = Math.min(30, daysSinceWorkout * 3);
    factors.push({
      name: "Workout Inactivity",
      impact,
      description: `No workout in ${daysSinceWorkout} days`,
    });
    totalScore += impact;
  }

  if (data.workoutsLastWeek > 0 && data.workoutsThisWeek < data.workoutsLastWeek * 0.5) {
    const impact = 15;
    factors.push({
      name: "Declining Frequency",
      impact,
      description: "Workout frequency dropped by more than 50%",
    });
    totalScore += impact;
  }

  if (data.checkInRate < 0.5) {
    const impact = 10;
    factors.push({
      name: "Low Engagement",
      impact,
      description: `Check-in rate: ${Math.round(data.checkInRate * 100)}%`,
    });
    totalScore += impact;
  }

  if (data.daysSinceLastLogin > 5) {
    const impact = Math.min(20, data.daysSinceLastLogin * 2);
    factors.push({
      name: "Login Inactivity",
      impact,
      description: `Last login ${data.daysSinceLastLogin} days ago`,
    });
    totalScore += impact;
  }

  if (data.paymentFailures > 0) {
    const impact = data.paymentFailures * 10;
    factors.push({
      name: "Payment Issues",
      impact,
      description: `${data.paymentFailures} failed payment(s)`,
    });
    totalScore += impact;
  }

  if (data.subscriptionStatus === "past_due") {
    const impact = 20;
    factors.push({
      name: "Subscription Past Due",
      impact,
      description: "Subscription payment is overdue",
    });
    totalScore += impact;
  }

  if (data.programCompletionRate < 0.3) {
    const impact = 10;
    factors.push({
      name: "Low Program Completion",
      impact,
      description: `Only ${Math.round(data.programCompletionRate * 100)}% of programs completed`,
    });
    totalScore += impact;
  }

  if (data.supportTickets > 2) {
    const impact = 5;
    factors.push({
      name: "Support Issues",
      impact,
      description: `${data.supportTickets} support tickets filed`,
    });
    totalScore += impact;
  }

  const normalizedScore = Math.min(100, totalScore);

  let level: AtRiskScore["level"];
  if (normalizedScore >= 70) level = "critical";
  else if (normalizedScore >= 50) level = "high";
  else if (normalizedScore >= 30) level = "medium";
  else level = "low";

  const recommendations = generateRecommendations(level, factors);

  return {
    userId: data.userId,
    score: normalizedScore,
    level,
    factors,
    recommendations,
    lastCalculated: new Date().toISOString(),
  };
}

function generateRecommendations(level: AtRiskScore["level"], factors: AtRiskFactor[]): string[] {
  const recommendations: string[] = [];

  if (level === "critical" || level === "high") {
    recommendations.push("Send personalized re-engagement email");
    recommendations.push("Coach should reach out within 24 hours");
  }

  if (factors.some((f) => f.name === "Workout Inactivity")) {
    recommendations.push("Suggest a quick 15-minute workout");
    recommendations.push("Send motivational content about getting back on track");
  }

  if (factors.some((f) => f.name === "Payment Issues" || f.name === "Subscription Past Due")) {
    recommendations.push("Send payment reminder with easy retry link");
    recommendations.push("Offer temporary discount or pause option");
  }

  if (factors.some((f) => f.name === "Low Engagement")) {
    recommendations.push("Send check-in reminder notification");
    recommendations.push("Highlight recent achievements to re-engage");
  }

  if (level === "low") {
    recommendations.push("User is healthy - no action needed");
  }

  return recommendations;
}

export function getAtRiskUsers(scores: AtRiskScore[]): {
  critical: AtRiskScore[];
  high: AtRiskScore[];
  medium: AtRiskScore[];
  summary: {
    total: number;
    atRisk: number;
    avgScore: number;
  };
} {
  const critical = scores.filter((s) => s.level === "critical");
  const high = scores.filter((s) => s.level === "high");
  const medium = scores.filter((s) => s.level === "medium");
  const atRisk = critical.length + high.length;

  return {
    critical,
    high,
    medium,
    summary: {
      total: scores.length,
      atRisk,
      avgScore: scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
        : 0,
    },
  };
}
