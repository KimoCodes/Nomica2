import { type FilteredExercise } from "./exercise-search";

export type BodyweightCategory = {
  name: string;
  muscleGroup: string;
  difficulty: string;
  exercises: FilteredExercise[];
};

const BODYWEIGHT_EXERCISES: FilteredExercise[] = [
  { id: "bw1", name: "Push-up", muscleGroup: "CHEST", difficulty: "BEGINNER", equipment: "none", duration: 4, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw2", name: "Diamond Push-up", muscleGroup: "CHEST", difficulty: "INTERMEDIATE", equipment: "none", duration: 4, goal: "MUSCLE_GAIN", location: "home" },
  { id: "bw3", name: "Wide Push-up", muscleGroup: "CHEST", difficulty: "BEGINNER", equipment: "none", duration: 4, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw4", name: "Pike Push-up", muscleGroup: "SHOULDERS", difficulty: "INTERMEDIATE", equipment: "none", duration: 4, goal: "MUSCLE_GAIN", location: "home" },
  { id: "bw5", name: "Bodyweight Squat", muscleGroup: "LEGS", difficulty: "BEGINNER", equipment: "none", duration: 4, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw6", name: "Jump Squat", muscleGroup: "LEGS", difficulty: "INTERMEDIATE", equipment: "none", duration: 3, goal: "CARDIO", location: "home" },
  { id: "bw7", name: "Bulgarian Split Squat", muscleGroup: "LEGS", difficulty: "INTERMEDIATE", equipment: "none", duration: 5, goal: "MUSCLE_GAIN", location: "home" },
  { id: "bw8", name: "Lunges", muscleGroup: "LEGS", difficulty: "BEGINNER", equipment: "none", duration: 5, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw9", name: "Walking Lunges", muscleGroup: "LEGS", difficulty: "INTERMEDIATE", equipment: "none", duration: 5, goal: "MUSCLE_GAIN", location: "home" },
  { id: "bw10", name: "Glute Bridge", muscleGroup: "GLUTES", difficulty: "BEGINNER", equipment: "none", duration: 4, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw11", name: "Single Leg Glute Bridge", muscleGroup: "GLUTES", difficulty: "INTERMEDIATE", equipment: "none", duration: 4, goal: "MUSCLE_GAIN", location: "home" },
  { id: "bw12", name: "Plank", muscleGroup: "CORE", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw13", name: "Side Plank", muscleGroup: "CORE", difficulty: "INTERMEDIATE", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw14", name: "Mountain Climbers", muscleGroup: "CORE", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "CARDIO", location: "home" },
  { id: "bw15", name: "Russian Twist", muscleGroup: "CORE", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw16", name: "Dead Bug", muscleGroup: "CORE", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw17", name: "Inverted Row", muscleGroup: "BACK", difficulty: "INTERMEDIATE", equipment: "none", duration: 5, goal: "MUSCLE_GAIN", location: "home" },
  { id: "bw18", name: "Superman", muscleGroup: "BACK", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw19", name: "Tricep Dip", muscleGroup: "ARMS", difficulty: "INTERMEDIATE", equipment: "none", duration: 4, goal: "MUSCLE_GAIN", location: "home" },
  { id: "bw20", name: "Chin-up", muscleGroup: "ARMS", difficulty: "ADVANCED", equipment: "none", duration: 5, goal: "STRENGTH", location: "home" },
  { id: "bw21", name: "Pull-up", muscleGroup: "BACK", difficulty: "ADVANCED", equipment: "none", duration: 5, goal: "STRENGTH", location: "home" },
  { id: "bw22", name: "Burpee", muscleGroup: "CARDIO", difficulty: "INTERMEDIATE", equipment: "none", duration: 3, goal: "CARDIO", location: "home" },
  { id: "bw23", name: "Jumping Jacks", muscleGroup: "CARDIO", difficulty: "BEGINNER", equipment: "none", duration: 2, goal: "CARDIO", location: "home" },
  { id: "bw24", name: "High Knees", muscleGroup: "CARDIO", difficulty: "BEGINNER", equipment: "none", duration: 2, goal: "CARDIO", location: "home" },
  { id: "bw25", name: "Fire Hydrant", muscleGroup: "GLUTES", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw26", name: "Clamshell", muscleGroup: "GLUTES", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw27", name: "Wall Sit", muscleGroup: "LEGS", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "ENDURANCE", location: "home" },
  { id: "bw28", name: "Calf Raise", muscleGroup: "LEGS", difficulty: "BEGINNER", equipment: "none", duration: 3, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw29", name: "Step-up", muscleGroup: "LEGS", difficulty: "BEGINNER", equipment: "none", duration: 4, goal: "GENERAL_FITNESS", location: "home" },
  { id: "bw30", name: "Bear Crawl", muscleGroup: "CORE", difficulty: "INTERMEDIATE", equipment: "none", duration: 3, goal: "CARDIO", location: "home" },
];

export function getBodyweightExercises(filters?: {
  muscleGroup?: string;
  difficulty?: string;
  goal?: string;
  maxDuration?: number;
}): FilteredExercise[] {
  return BODYWEIGHT_EXERCISES.filter((ex) => {
    if (filters?.muscleGroup && ex.muscleGroup !== filters.muscleGroup.toUpperCase()) return false;
    if (filters?.difficulty && ex.difficulty !== filters.difficulty.toUpperCase()) return false;
    if (filters?.goal && ex.goal !== filters.goal.toUpperCase()) return false;
    if (filters?.maxDuration && ex.duration > filters.maxDuration) return false;
    return true;
  });
}

export function getBodyweightExercisesByMuscleGroup(): BodyweightCategory[] {
  const groups = new Map<string, FilteredExercise[]>();

  for (const ex of BODYWEIGHT_EXERCISES) {
    const existing = groups.get(ex.muscleGroup) ?? [];
    existing.push(ex);
    groups.set(ex.muscleGroup, existing);
  }

  return Array.from(groups.entries()).map(([muscleGroup, exercises]) => ({
    name: `${muscleGroup} Bodyweight`,
    muscleGroup,
    difficulty: exercises.some((e) => e.difficulty === "ADVANCED") ? "ADVANCED" :
               exercises.some((e) => e.difficulty === "INTERMEDIATE") ? "INTERMEDIATE" : "BEGINNER",
    exercises,
  }));
}

export function getBodyweightWorkout(params: {
  minutes: number;
  focus?: string;
  difficulty?: string;
}): { name: string; exercises: { name: string; duration: number; muscleGroup: string }[] } {
  const { minutes, focus, difficulty } = params;

  const candidates = getBodyweightExercises({
    muscleGroup: focus,
    difficulty,
  });

  const selected: typeof candidates = [];
  const usedGroups = new Set<string>();

  for (const ex of candidates) {
    if (selected.length >= Math.min(8, Math.ceil(minutes / 4))) break;
    if (!usedGroups.has(ex.muscleGroup)) {
      selected.push(ex);
      usedGroups.add(ex.muscleGroup);
    }
  }

  if (selected.length === 0) {
    return {
      name: "Quick Bodyweight Blast",
      exercises: [
        { name: "Push-ups", duration: 3, muscleGroup: "CHEST" },
        { name: "Bodyweight Squats", duration: 3, muscleGroup: "LEGS" },
        { name: "Plank", duration: 2, muscleGroup: "CORE" },
        { name: "Lunges", duration: 3, muscleGroup: "LEGS" },
        { name: "Mountain Climbers", duration: 2, muscleGroup: "CORE" },
      ],
    };
  }

  const timePerExercise = Math.floor(minutes / selected.length);

  return {
    name: `${minutes}-Min Bodyweight ${focus ?? "Full Body"}`,
    exercises: selected.map((ex) => ({
      name: ex.name,
      duration: Math.max(2, timePerExercise),
      muscleGroup: ex.muscleGroup,
    })),
  };
}
