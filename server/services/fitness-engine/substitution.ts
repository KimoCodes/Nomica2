import type { ExerciseSubstitution } from "./types";

type ExerciseCandidate = {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: string;
};

const EQUIPMENT_ACCESS_LEVEL = {
  NONE: 0,
  DUMBBELLS: 1,
  HOME_GYM: 2,
  COMMERCIAL_GYM: 3,
} as const;

const DIFFICULTY_EQUIPMENT_NEED = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
} as const;

const DIFFICULTY_ORDER = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

function isEquipmentCompatible(
  exerciseDifficulty: string,
  userEquipment: string,
): boolean {
  const userLevel =
    EQUIPMENT_ACCESS_LEVEL[userEquipment as keyof typeof EQUIPMENT_ACCESS_LEVEL] ?? 3;
  const exerciseNeed =
    DIFFICULTY_EQUIPMENT_NEED[exerciseDifficulty as keyof typeof DIFFICULTY_EQUIPMENT_NEED] ?? 1;
  return userLevel >= exerciseNeed;
}

function getDifficultyDistance(a: string, b: string): number {
  const indexA = DIFFICULTY_ORDER.indexOf(a);
  const indexB = DIFFICULTY_ORDER.indexOf(b);
  if (indexA === -1 || indexB === -1) return 999;
  return Math.abs(indexA - indexB);
}

function scoreCandidate(
  candidate: ExerciseCandidate,
  original: ExerciseCandidate,
  userEquipment: string,
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  if (candidate.muscleGroup === original.muscleGroup) {
    score += 10;
    reasons.push("same muscle group");
  }

  const diffDist = getDifficultyDistance(candidate.difficulty, original.difficulty);
  if (diffDist === 0) {
    score += 5;
    reasons.push("matching difficulty");
  } else if (diffDist === 1) {
    score += 3;
    reasons.push("similar difficulty");
  }

  if (isEquipmentCompatible(candidate.difficulty, userEquipment)) {
    score += 3;
    reasons.push("equipment compatible");
  }

  return { score, reason: reasons.join(", ") };
}

export function findSubstitutes(
  originalExercise: ExerciseCandidate,
  availableExercises: ExerciseCandidate[],
  userEquipment: string,
  limit: number = 4,
): ExerciseSubstitution[] {
  const candidates = availableExercises
    .filter((e) => e.id !== originalExercise.id)
    .filter((e) => e.muscleGroup === originalExercise.muscleGroup)
    .map((candidate) => ({
      candidate,
      ...scoreCandidate(candidate, originalExercise, userEquipment),
    }))
    .filter((c) => c.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return candidates.map(({ candidate, reason }) => ({
    originalExerciseId: originalExercise.id,
    substituteExerciseId: candidate.id,
    substituteExerciseName: candidate.name,
    muscleGroup: candidate.muscleGroup,
    reason,
    difficultyMatch:
      candidate.difficulty === originalExercise.difficulty,
  }));
}

export function filterExercisesByEquipment(
  exercises: ExerciseCandidate[],
  userEquipment: string,
): ExerciseCandidate[] {
  return exercises.filter((e) => isEquipmentCompatible(e.difficulty, userEquipment));
}
