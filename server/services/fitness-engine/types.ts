export type SetLog = {
  actualReps: number | null;
  actualWeight: number | null;
  completed: boolean;
  setNumber: number;
};

export type ExercisePerformance = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: SetLog[];
  completedAt: Date;
};

export type WorkoutHistoryEntry = {
  completedAt: Date;
  dayTitle: string;
  exercises: ExercisePerformance[];
};

export type UserProfile = {
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  fitnessGoal: string | null;
  activityLevel: string | null;
  equipment: string | null;
};

export type HabitData = {
  type: string;
  value: number;
  target: number;
  date: Date;
};

export type CheckInData = {
  energyLevel: number | null;
  sleepQuality: number | null;
  workoutsCompleted: number | null;
  submittedAt: Date | null;
  weekStart: Date;
};

export type ProgressionType = "increase" | "maintain" | "decrease";

export type ExerciseRecommendation = {
  exerciseId: string;
  exerciseName: string;
  suggestedWeight: number | null;
  suggestedReps: number;
  suggestedSets: number;
  progressionType: ProgressionType;
  confidence: number;
  reason: string;
};

export type ReadinessScore = {
  score: number;
  recommendation: "high_intensity" | "moderate" | "light" | "recovery" | "rest";
  factors: {
    sleep: number;
    energy: number;
    habits: number;
    recovery: number;
    consistency: number;
  };
  explanation: string;
};

export type RecoveryInsight = {
  category: "sleep" | "training" | "habits" | "nutrition" | "general";
  severity: "info" | "warning" | "positive";
  message: string;
  actionable: boolean;
};

export type ExerciseSubstitution = {
  originalExerciseId: string;
  substituteExerciseId: string;
  substituteExerciseName: string;
  muscleGroup: string;
  reason: string;
  difficultyMatch: boolean;
};
