export type TransformationTimeline = {
  clientId: string;
  startDate: string;
  totalDays: number;
  milestones: Milestone[];
  stats: TransformationStats;
  journey: JourneyEntry[];
};

export type Milestone = {
  day: number;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate: string | null;
};

export type TransformationStats = {
  strength: { start: number; current: number; change: number };
  consistency: number;
  totalWorkouts: number;
  avgSleep: number;
  weight: { start: number | null; current: number | null; change: number | null };
  prs: { exercise: string; before: number; after: number }[];
};

export type JourneyEntry = {
  date: string;
  day: number;
  type: "workout" | "checkin" | "milestone" | "pr" | "habit";
  title: string;
  detail: string;
  impact: "positive" | "neutral" | "negative";
};

const MILESTONE_THRESHOLDS = [
  { day: 7, title: "First Week Complete", description: "You completed your first 7 days of training." },
  { day: 14, title: "Two-Week Warrior", description: "14 days of consistency. You're building a real habit." },
  { day: 21, title: "Habit Formed", description: "Research says 21 days builds a habit. You're there." },
  { day: 30, title: "One Month Strong", description: "30 days of dedication. Your body is changing." },
  { day: 60, title: "Consistency Champion", description: "60 days. You're in the top 10% of fitness app users." },
  { day: 90, title: "90-Day Transformation", description: "90 days of commitment. You've transformed your fitness." },
  { day: 120, title: "Quarter Year Warrior", description: "4 months of consistent training. Remarkable dedication." },
  { day: 180, title: "Half-Year Hero", description: "6 months. You're no longer a beginner — you're an athlete." },
  { day: 365, title: "One Year Legend", description: "365 days. You've made fitness a permanent part of your life." },
];

export function generateTransformationTimeline(params: {
  clientId: string;
  startDate: Date;
  completions: { completedAt: Date; dayTitle: string }[];
  checkIns: { submittedAt: Date; energyLevel: number | null }[];
  personalRecords: { exercise: string; weight: number; date: Date }[];
  weightHistory: { weight: number; date: Date }[];
  sleepHistory: { hours: number; date: Date }[];
}): TransformationTimeline {
  const { clientId, startDate, completions, checkIns, personalRecords, weightHistory, sleepHistory } = params;
  const now = new Date();
  const totalDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const milestones: Milestone[] = MILESTONE_THRESHOLDS.map((m) => ({
    day: m.day,
    title: m.title,
    description: m.description,
    achieved: totalDays >= m.day,
    achievedDate: totalDays >= m.day ? startDate.toISOString().split("T")[0] : null,
  }));

  const avgSleep = sleepHistory.length > 0
    ? sleepHistory.reduce((sum, s) => sum + s.hours, 0) / sleepHistory.length
    : 0;

  const consistency = totalDays > 0
    ? Math.round((completions.length / totalDays) * 100)
    : 0;

  const weightStart = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1]!.weight : null;
  const weightCurrent = weightHistory.length > 0 ? weightHistory[0]!.weight : null;

  const prMap = new Map<string, { before: number; after: number }>();
  for (const pr of personalRecords) {
    const existing = prMap.get(pr.exercise);
    if (!existing || pr.date < new Date()) {
      prMap.set(pr.exercise, { before: existing?.before ?? pr.weight, after: pr.weight });
    }
  }

  const stats: TransformationStats = {
    strength: {
      start: personalRecords.length > 0 ? personalRecords[personalRecords.length - 1]!.weight : 0,
      current: personalRecords.length > 0 ? personalRecords[0]!.weight : 0,
      change: personalRecords.length >= 2
        ? personalRecords[0]!.weight - personalRecords[personalRecords.length - 1]!.weight
        : 0,
    },
    consistency,
    totalWorkouts: completions.length,
    avgSleep: Math.round(avgSleep * 10) / 10,
    weight: {
      start: weightStart,
      current: weightCurrent,
      change: weightStart !== null && weightCurrent !== null
        ? Math.round((weightCurrent - weightStart) * 10) / 10
        : null,
    },
    prs: Array.from(prMap.entries()).map(([exercise, data]) => ({
      exercise,
      before: data.before,
      after: data.after,
    })),
  };

  const journey: JourneyEntry[] = [];

  for (const c of completions) {
    journey.push({
      date: c.completedAt.toISOString().split("T")[0]!,
      day: Math.floor((c.completedAt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      type: "workout",
      title: c.dayTitle,
      detail: "Workout completed",
      impact: "positive",
    });
  }

  for (const ci of checkIns) {
    journey.push({
      date: ci.submittedAt.toISOString().split("T")[0]!,
      day: Math.floor((ci.submittedAt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      type: "checkin",
      title: "Weekly Check-in",
      detail: `Energy: ${ci.energyLevel ?? "N/A"}/10`,
      impact: (ci.energyLevel ?? 5) >= 7 ? "positive" : (ci.energyLevel ?? 5) <= 3 ? "negative" : "neutral",
    });
  }

  for (const m of milestones.filter((m) => m.achieved)) {
    journey.push({
      date: m.achievedDate!,
      day: m.day,
      type: "milestone",
      title: m.title,
      detail: m.description,
      impact: "positive",
    });
  }

  journey.sort((a, b) => a.date.localeCompare(b.date));

  return {
    clientId,
    startDate: startDate.toISOString().split("T")[0]!,
    totalDays,
    milestones,
    stats,
    journey,
  };
}
