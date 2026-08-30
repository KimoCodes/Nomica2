export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "workout" | "streak" | "milestone" | "social" | "special" | "checkin";
  requirement: number;
  unlockedAt?: string;
};

export type UserPoints = {
  total: number;
  breakdown: {
    workouts: number;
    streaks: number;
    checkins: number;
    referrals: number;
    milestones: number;
  };
};

export type LeaderboardEntry = {
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  badges: number;
};

const BADGE_DEFINITIONS: Omit<Badge, "unlockedAt">[] = [
  { id: "first_workout", name: "First Step", description: "Complete your first workout", icon: "🏋️", category: "workout", requirement: 1 },
  { id: "workout_10", name: "Getting Started", description: "Complete 10 workouts", icon: "💪", category: "workout", requirement: 10 },
  { id: "workout_25", name: "Dedicated", description: "Complete 25 workouts", icon: "🔥", category: "workout", requirement: 25 },
  { id: "workout_50", name: "Half Century", description: "Complete 50 workouts", icon: "⭐", category: "workout", requirement: 50 },
  { id: "workout_100", name: "Century Club", description: "Complete 100 workouts", icon: "🏆", category: "workout", requirement: 100 },
  { id: "streak_3", name: "On Fire", description: "3-day streak", icon: "🔥", category: "streak", requirement: 3 },
  { id: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "⚡", category: "streak", requirement: 7 },
  { id: "streak_14", name: "Unstoppable", description: "14-day streak", icon: "💫", category: "streak", requirement: 14 },
  { id: "streak_30", name: "Monthly Master", description: "30-day streak", icon: "👑", category: "streak", requirement: 30 },
  { id: "streak_100", name: "Legendary", description: "100-day streak", icon: "🌟", category: "streak", requirement: 100 },
  { id: "checkin_4", name: "Weekly Check-in", description: "Complete 4 weekly check-ins", icon: "📋", category: "checkin", requirement: 4 },
  { id: "checkin_12", name: "Consistent", description: "Complete 12 weekly check-ins", icon: "📊", category: "checkin", requirement: 12 },
  { id: "pr_5", name: "Record Breaker", description: "Set 5 personal records", icon: "🎯", category: "milestone", requirement: 5 },
  { id: "pr_20", name: "PR Machine", description: "Set 20 personal records", icon: "🏅", category: "milestone", requirement: 20 },
  { id: "referral_1", name: "Recruiter", description: "Refer 1 friend", icon: "🤝", category: "social", requirement: 1 },
  { id: "referral_5", name: "Ambassador", description: "Refer 5 friends", icon: "🌟", category: "social", requirement: 5 },
  { id: "early_adopter", name: "Early Adopter", description: "Joined in the first month", icon: "🚀", category: "special", requirement: 1 },
];

export function getAllBadges(): Badge[] {
  return BADGE_DEFINITIONS.map((b) => ({ ...b }));
}

export function calculatePoints(params: {
  workoutsCompleted: number;
  streakDays: number;
  checkInsCompleted: number;
  referralsCompleted: number;
  prsSet: number;
}): UserPoints {
  const { workoutsCompleted, streakDays, checkInsCompleted, referralsCompleted, prsSet } = params;

  const workoutPoints = workoutsCompleted * 10;
  const streakPoints = streakDays * 5;
  const checkinPoints = checkInsCompleted * 15;
  const referralPoints = referralsCompleted * 50;
  const milestonePoints = prsSet * 20;

  return {
    total: workoutPoints + streakPoints + checkinPoints + referralPoints + milestonePoints,
    breakdown: {
      workouts: workoutPoints,
      streaks: streakPoints,
      checkins: checkinPoints,
      referrals: referralPoints,
      milestones: milestonePoints,
    },
  };
}

export function checkUnlockedBadges(params: {
  workoutsCompleted: number;
  currentStreak: number;
  checkInsCompleted: number;
  referralsCompleted: number;
  prsSet: number;
  joinDate: Date;
}): Badge[] {
  const { workoutsCompleted, currentStreak, checkInsCompleted, referralsCompleted, prsSet, joinDate } = params;
  const now = new Date();
  const badges: Badge[] = [];

  for (const def of BADGE_DEFINITIONS) {
    let unlocked = false;

    switch (def.category) {
      case "workout":
        unlocked = workoutsCompleted >= def.requirement;
        break;
      case "streak":
        unlocked = currentStreak >= def.requirement;
        break;
      case "checkin":
        unlocked = checkInsCompleted >= def.requirement;
        break;
      case "milestone":
        unlocked = prsSet >= def.requirement;
        break;
      case "social":
        unlocked = referralsCompleted >= def.requirement;
        break;
      case "special":
        if (def.id === "early_adopter") {
          const firstMonth = new Date(joinDate);
          firstMonth.setMonth(firstMonth.getMonth() + 1);
          unlocked = now < firstMonth;
        }
        break;
    }

    if (unlocked) {
      badges.push({ ...def, unlockedAt: now.toISOString() });
    }
  }

  return badges;
}

export function getPointsForNextBadge(params: {
  workoutsCompleted: number;
  currentStreak: number;
  checkInsCompleted: number;
  referralsCompleted: number;
  prsSet: number;
}): { nextBadge: Omit<Badge, "unlockedAt">; current: number; needed: number } | null {
  const { workoutsCompleted, currentStreak, checkInsCompleted, referralsCompleted, prsSet } = params;

  const progressions = [
    { category: "workout", current: workoutsCompleted, badges: BADGE_DEFINITIONS.filter((b) => b.category === "workout") },
    { category: "streak", current: currentStreak, badges: BADGE_DEFINITIONS.filter((b) => b.category === "streak") },
    { category: "checkin", current: checkInsCompleted, badges: BADGE_DEFINITIONS.filter((b) => b.category === "checkin") },
    { category: "milestone", current: prsSet, badges: BADGE_DEFINITIONS.filter((b) => b.category === "milestone") },
    { category: "social", current: referralsCompleted, badges: BADGE_DEFINITIONS.filter((b) => b.category === "social") },
  ];

  for (const progression of progressions) {
    const nextBadge = progression.badges.find((b) => b.requirement > progression.current);
    if (nextBadge) {
      return {
        nextBadge,
        current: progression.current,
        needed: nextBadge.requirement - progression.current,
      };
    }
  }

  return null;
}
