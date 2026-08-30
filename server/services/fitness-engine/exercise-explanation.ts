export type ExerciseExplanation = {
  whyThisExercise: string;
  whyToday: string;
  targetMuscles: string[];
  tips: string[];
  modifications: {
    easier: string;
    harder: string;
    noEquipment: string;
  };
};

const EXERCISE_DB: Record<string, {
  primaryMuscles: string[];
  purpose: string;
  tips: string[];
  easier: string;
  harder: string;
  noEquipment: string;
}> = {
  "chest": {
    primaryMuscles: ["Pectoralis Major", "Anterior Deltoid", "Triceps"],
    purpose: "building upper-body pushing strength",
    tips: ["Keep shoulder blades retracted", "Control the eccentric (lowering) phase", "Drive through your chest, not your shoulders"],
    easier: "Incline push-ups or machine press",
    harder: "Pause reps or tempo training (3-second lowering)",
    noEquipment: "Push-up variations (diamond, wide, archer)",
  },
  "back": {
    primaryMuscles: ["Latissimus Dorsi", "Rhomboids", "Biceps"],
    purpose: "building pulling strength and posture",
    tips: ["Initiate the pull from your elbows, not your hands", "Keep your core braced", "Squeeze your shoulder blades at the top"],
    easier: "Seated cable row or band pull-aparts",
    harder: "Weighted pull-ups or single-arm rows",
    noEquipment: "Inverted rows under a table or doorframe rows",
  },
  "legs": {
    primaryMuscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"],
    purpose: "building lower-body strength and power",
    tips: ["Push through your whole foot", "Keep knees tracking over toes", "Brace your core before each rep"],
    easier: "Goblet squats or leg press",
    harder: "Pause squats or Bulgarian split squats",
    noEquipment: "Bodyweight squats, lunges, and pistol progressions",
  },
  "shoulders": {
    primaryMuscles: ["Deltoids", "Trapezius", "Rotator Cuff"],
    purpose: "building overhead pressing strength and shoulder stability",
    tips: ["Keep a slight bend in your elbows", "Don't arch your lower back", "Control the weight — don't momentum press"],
    easier: "Lateral raises or machine press",
    harder: "Push press or Arnold press",
    noEquipment: "Pike push-ups and handstand progressions",
  },
  "arms": {
    primaryMuscles: ["Biceps", "Triceps", "Forearms"],
    purpose: "building arm strength and definition",
    tips: ["Avoid swinging — strict form builds more muscle", "Full range of motion matters", "Squeeze at the top of each rep"],
    easier: "Resistance band curls or tricep kickbacks",
    harder: "Close-grip bench press or hammer curls",
    noEquipment: "Chin-ups (biceps) and diamond push-ups (triceps)",
  },
  "core": {
    primaryMuscles: ["Rectus Abdominis", "Obliques", "Transverse Abdominis"],
    purpose: "building core stability and anti-rotation strength",
    tips: ["Breathe through each rep — don't hold your breath", "Brace as if someone is about to punch your stomach", "Keep your lower back pressed into the floor"],
    easier: "Dead bugs or bird-dogs",
    harder: "Ab wheel rollouts or hanging leg raises",
    noEquipment: "Planks, mountain climbers, and bicycle crunches",
  },
  "glutes": {
    primaryMuscles: ["Gluteus Maximus", "Gluteus Medius", "Hamstrings"],
    purpose: "building hip extension strength and glute activation",
    tips: ["Drive through your heels", "Squeeze your glutes at the top", "Don't let your knees cave inward"],
    easier: "Glute bridges or banded walks",
    harder: "Hip thrusts with pause or single-leg deadlifts",
    noEquipment: "Glute bridges, fire hydrants, and clamshells",
  },
  "cardio": {
    primaryMuscles: ["Heart", "Lungs", "Full Body"],
    purpose: "improving cardiovascular endurance and calorie burn",
    tips: ["Keep your heart rate in the target zone", "Breathe rhythmically", "Stay hydrated"],
    easier: "Walking or light cycling",
    harder: "HIIT intervals or sprint work",
    noEquipment: "Jumping jacks, high knees, or burpees",
  },
  "mobility": {
    primaryMuscles: ["Joints", "Connective Tissue", "Full Body"],
    purpose: "improving range of motion and reducing injury risk",
    tips: ["Move slowly and deliberately", "Breathe into tight areas", "Consistency beats intensity"],
    easier: "Seated stretches or foam rolling",
    harder: "Loaded stretching or PNF techniques",
    noEquipment: "Yoga flows or dynamic stretching routines",
  },
};

function findExerciseContext(muscleGroup: string): typeof EXERCISE_DB["chest"] {
  const key = muscleGroup.toLowerCase();
  return EXERCISE_DB[key] ?? EXERCISE_DB["chest"]!;
}

export function explainExercise(params: {
  exerciseName: string;
  muscleGroup: string;
  goal: string | null;
  lastWorkoutDaysAgo: number | null;
  programFocus: string | null;
}): ExerciseExplanation {
  const { exerciseName, muscleGroup, goal, lastWorkoutDaysAgo, programFocus } = params;
  const ctx = findExerciseContext(muscleGroup);

  const goalText = goal === "STRENGTH"
    ? "strength and power"
    : goal === "FAT_LOSS"
      ? "calorie burn and muscle retention"
      : goal === "MUSCLE_GAIN"
        ? "muscle growth and hypertrophy"
        : "overall fitness";

  const whyThisExercise = `${exerciseName} targets your ${ctx.primaryMuscles.join(", ")} and supports your goal of ${goalText}.`;

  let whyToday: string;
  if (lastWorkoutDaysAgo === null) {
    whyToday = `This exercise is part of your current program's ${programFocus ?? "training"} focus.`;
  } else if (lastWorkoutDaysAgo >= 4) {
    whyToday = `It's been ${lastWorkoutDaysAgo} days since you last trained ${muscleGroup.toLowerCase()}. Your muscles are recovered and ready.`;
  } else {
    whyToday = `This is a follow-up session for ${muscleGroup.toLowerCase()} to build training volume this week.`;
  }

  return {
    whyThisExercise,
    whyToday,
    targetMuscles: ctx.primaryMuscles,
    tips: ctx.tips,
    modifications: {
      easier: ctx.easier,
      harder: ctx.harder,
      noEquipment: ctx.noEquipment,
    },
  };
}
