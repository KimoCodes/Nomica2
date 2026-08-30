export type ExerciseFilter = {
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  maxDuration?: number;
  goal?: string;
  location?: string;
};

export type FilteredExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: string;
  equipment: string;
  duration: number;
  goal: string;
  location: string;
};

const EXERCISE_CATALOG: FilteredExercise[] = [
  { id: "ex1", name: "Barbell Back Squat", muscleGroup: "LEGS", difficulty: "INTERMEDIATE", equipment: "barbell", duration: 8, goal: "STRENGTH", location: "gym" },
  { id: "ex2", name: "Goblet Squat", muscleGroup: "LEGS", difficulty: "BEGINNER", equipment: "dumbbell", duration: 6, goal: "STRENGTH", location: "home" },
  { id: "ex3", name: "Bodyweight Squat", muscleGroup: "LEGS", difficulty: "BEGINNER", equipment: "none", duration: 4, goal: "GENERAL_FITNESS", location: "home" },
  { id: "ex4", name: "Bench Press", muscleGroup: "CHEST", difficulty: "INTERMEDIATE", equipment: "barbell", duration: 8, goal: "STRENGTH", location: "gym" },
  { id: "ex5", name: "Push-up", muscleGroup: "CHEST", difficulty: "BEGINNER", equipment: "none", duration: 4, goal: "GENERAL_FITNESS", location: "home" },
  { id: "ex6", name: "Dumbbell Fly", muscleGroup: "CHEST", difficulty: "BEGINNER", equipment: "dumbbell", duration: 5, goal: "MUSCLE_GAIN", location: "home" },
  { id: "ex7", name: "Deadlift", muscleGroup: "BACK", difficulty: "ADVANCED", equipment: "barbell", duration: 10, goal: "STRENGTH", location: "gym" },
  { id: "ex8", name: "Bent-over Row", muscleGroup: "BACK", difficulty: "INTERMEDIATE", equipment: "dumbbell", duration: 6, goal: "MUSCLE_GAIN", location: "home" },
  { id: "ex9", name: "Pull-up", muscleGroup: "BACK", difficulty: "ADVANCED", equipment: "none", duration: 5, goal: "STRENGTH", location: "gym" },
  { id: "ex10", name: "Overhead Press", muscleGroup: "SHOULDERS", difficulty: "INTERMEDIATE", equipment: "barbell", duration: 7, goal: "STRENGTH", location: "gym" },
  { id: "ex11", name: "Lateral Raise", muscleGroup: "SHOULDERS", difficulty: "BEGINNER", equipment: "dumbbell", duration: 4, goal: "MUSCLE_GAIN", location: "home" },
  { id: "ex12", name: "Bicep Curl", muscleGroup: "ARMS", difficulty: "BEGINNER", equipment: "dumbbell", duration: 4, goal: "MUSCLE_GAIN", location: "home" },
  { id: "ex13", name: "Tricep Dip", muscleGroup: "ARMS", difficulty: "INTERMEDIATE", equipment: "none", duration: 4, goal: "MUSCLE_GAIN", location: "home" },
  { id: "ex14", name: "Plank", muscleGroup: "CORE", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "ex15", name: "Russian Twist", muscleGroup: "CORE", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "ex16", name: "Hip Thrust", muscleGroup: "GLUTES", difficulty: "INTERMEDIATE", equipment: "barbell", duration: 6, goal: "MUSCLE_GAIN", location: "gym" },
  { id: "ex17", name: "Glute Bridge", muscleGroup: "GLUTES", difficulty: "BEGINNER", equipment: "none", duration: 4, goal: "GENERAL_FITNESS", location: "home" },
  { id: "ex18", name: "Lunges", muscleGroup: "LEGS", difficulty: "BEGINNER", equipment: "none", duration: 5, goal: "GENERAL_FITNESS", location: "home" },
  { id: "ex19", name: "Romanian Deadlift", muscleGroup: "LEGS", difficulty: "INTERMEDIATE", equipment: "barbell", duration: 7, goal: "STRENGTH", location: "gym" },
  { id: "ex20", name: "Bulgarian Split Squat", muscleGroup: "LEGS", difficulty: "INTERMEDIATE", equipment: "dumbbell", duration: 6, goal: "MUSCLE_GAIN", location: "home" },
];

export function searchExercises(filters: ExerciseFilter): FilteredExercise[] {
  return EXERCISE_CATALOG.filter((ex) => {
    if (filters.muscleGroup && ex.muscleGroup !== filters.muscleGroup.toUpperCase()) return false;
    if (filters.equipment && ex.equipment !== filters.equipment.toLowerCase()) return false;
    if (filters.difficulty && ex.difficulty !== filters.difficulty.toUpperCase()) return false;
    if (filters.maxDuration && ex.duration > filters.maxDuration) return false;
    if (filters.goal && ex.goal !== filters.goal.toUpperCase()) return false;
    if (filters.location && ex.location !== filters.location.toLowerCase()) return false;
    return true;
  });
}

export type SurpriseWorkout = {
  title: string;
  duration: number;
  difficulty: string;
  equipment: string;
  exercises: {
    name: string;
    muscleGroup: string;
    sets: number;
    reps: number;
    rest: number;
  }[];
  reason: string;
};

export function generateSurpriseWorkout(params: {
  availableMinutes: number;
  equipment: string;
  fitnessLevel: string;
  goal: string | null;
}): SurpriseWorkout {
  const { availableMinutes, equipment, fitnessLevel, goal } = params;

  const candidates = searchExercises({
    equipment: equipment === "none" ? "none" : undefined,
    difficulty: fitnessLevel,
    goal: goal ?? undefined,
    maxDuration: Math.ceil(availableMinutes / 3),
  });

  if (candidates.length === 0) {
    const fallback = searchExercises({ equipment: "none" });
    return {
      title: "Surprise Full Body",
      duration: availableMinutes,
      difficulty: "BEGINNER",
      equipment: "none",
      exercises: fallback.slice(0, 4).map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: 3,
        reps: 10,
        rest: 60,
      })),
      reason: "Generated a bodyweight full-body workout based on your time and equipment.",
    };
  }

  const selected: typeof candidates = [];
  const usedGroups = new Set<string>();

  for (const ex of candidates) {
    if (selected.length >= 5) break;
    if (!usedGroups.has(ex.muscleGroup)) {
      selected.push(ex);
      usedGroups.add(ex.muscleGroup);
    }
  }

  const timePerExercise = Math.floor(availableMinutes / selected.length);
  const setsPerExercise = Math.max(2, Math.floor(timePerExercise / 3));

  return {
    title: `Surprise ${goal ?? "Full Body"}`,
    duration: availableMinutes,
    difficulty: fitnessLevel,
    equipment,
    exercises: selected.map((ex) => ({
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: setsPerExercise,
      reps: fitnessLevel === "ADVANCED" ? 8 : fitnessLevel === "INTERMEDIATE" ? 10 : 12,
      rest: fitnessLevel === "ADVANCED" ? 120 : 90,
    })),
    reason: `Generated a ${fitnessLevel.toLowerCase()} ${goal?.toLowerCase() ?? "full body"} workout matching your ${equipment} equipment and ${availableMinutes}-minute window.`,
  };
}
