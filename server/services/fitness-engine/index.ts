import type {
  WorkoutHistoryEntry,
  HabitData,
  CheckInData,
  ExerciseRecommendation,
  ReadinessScore,
  RecoveryInsight,
  ExerciseSubstitution,
} from "./types";
import { calculateWorkoutProgressions } from "./progressive-overload";
import { calculateReadinessScore } from "./readiness";
import { generateRecoveryInsights } from "./recovery";
import { findSubstitutes } from "./substitution";

export { generateWorkoutRecommendation, generateQuickWorkout } from "./workout-recommendation";
export type { WorkoutRecommendation } from "./workout-recommendation";

export { calculateDifficultyAdjustment, getRPELabel, getRPEColor, calculateWeeklyRPEAverages } from "./adaptive-difficulty";
export type { RPEValue, RPEFeedback, DifficultyAdjustment } from "./adaptive-difficulty";

export { explainExercise } from "./exercise-explanation";
export type { ExerciseExplanation } from "./exercise-explanation";

export { generateCalendar, rescheduleEvent, skipWorkout } from "./fitness-calendar";
export type { CalendarEvent, CalendarDay, CalendarWeek } from "./fitness-calendar";

export { searchExercises, generateSurpriseWorkout } from "./exercise-search";
export type { ExerciseFilter, FilteredExercise, SurpriseWorkout } from "./exercise-search";

export { generateTransformationTimeline } from "./transformation-tracking";
export type { TransformationTimeline, Milestone, TransformationStats, JourneyEntry } from "./transformation-tracking";

export { analyzeProgramPerformance, suggestDeloadWeek } from "./adaptive-programs";
export type { ProgramAdjustment, ProgramChange, PerformanceSnapshot } from "./adaptive-programs";

export { calculatePoints, checkUnlockedBadges, getPointsForNextBadge, getAllBadges } from "./gamification";
export type { Badge, UserPoints, LeaderboardEntry } from "./gamification";

type PrescribedExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: number | null;
  reps: number | null;
};

type ExerciseCandidate = {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: string;
};

export type FitnessEngineResult = {
  readiness: ReadinessScore;
  progressions: ExerciseRecommendation[];
  recoveryInsights: RecoveryInsight[];
  substitutions: Map<string, ExerciseSubstitution[]>;
};

export function analyzeFitnessState(params: {
  history: WorkoutHistoryEntry[];
  habits: HabitData[];
  checkIn: CheckInData | null;
  prescribedExercises: PrescribedExercise[];
  allExercises: ExerciseCandidate[];
  userEquipment: string;
}): FitnessEngineResult {
  const {
    history,
    habits,
    checkIn,
    prescribedExercises,
    allExercises,
    userEquipment,
  } = params;

  const readiness = calculateReadinessScore(history, habits, checkIn);
  const progressions = calculateWorkoutProgressions(history, prescribedExercises);
  const recoveryInsights = generateRecoveryInsights(history, habits, checkIn);

  const substitutions = new Map<string, ExerciseSubstitution[]>();
  for (const prescribed of prescribedExercises) {
    const candidate = allExercises.find((e) => e.id === prescribed.exerciseId);
    if (candidate) {
      const subs = findSubstitutes(candidate, allExercises, userEquipment);
      if (subs.length > 0) {
        substitutions.set(prescribed.exerciseId, subs);
      }
    }
  }

  return { readiness, progressions, recoveryInsights, substitutions };
}
