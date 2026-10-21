import type { PrismaClient } from "@prisma/client";
import { Difficulty, MuscleGroup } from "@prisma/client";

/**
 * Workout content generator for the clean_workout_programs_catalog.pdf programs.
 *
 * - EXERCISES is the shared exercise library (idempotently upserted by name).
 * - PROGRAM_CONTENT maps product slug → week/day structure built from day
 *   rotation blueprints, with week-over-week progressive overload applied.
 * - ensureProgramContent() materializes weeks/days/exercises for a Program and
 *   is safe to re-run (skips programs that already have content unless
 *   opts.rebuild is set).
 */

export type ExerciseDef = {
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  instructions: string;
};

// ─── Exercise library ────────────────────────────────────────────────────────

export const EXERCISES: ExerciseDef[] = [
  // Glutes
  { name: "Banded Lateral Walk", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "Loop a resistance band just above your knees. Sink into a quarter squat and step sideways, keeping tension on the band the entire time." },
  { name: "Glute Bridge", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "Lie on your back with knees bent and feet flat. Drive through your heels to lift your hips, squeezing your glutes hard at the top." },
  { name: "Single-Leg Glute Bridge", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Perform a glute bridge with one leg extended. Push through the heel of the working leg and keep your hips level." },
  { name: "Glute Bridge March", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Hold a glute bridge at the top and alternate lifting each foot a few inches off the floor without letting your hips drop." },
  { name: "Dumbbell Hip Thrust", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Sit on the floor with your upper back on a bench and a dumbbell over your hips. Thrust upward until your torso is parallel to the floor." },
  { name: "Barbell Hip Thrust", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Rest your upper back on a bench with a barbell over your hips. Drive through your heels and lock out your hips at the top without arching your lower back." },
  { name: "Clamshell", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "Lie on your side with a band above your knees, hips stacked. Keeping your feet together, open the top knee against the band and lower with control." },
  { name: "Donkey Kick", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "On all fours, kick one heel toward the ceiling with the knee bent at 90 degrees. Squeeze the glute at the top and avoid arching your back." },
  { name: "Fire Hydrant", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "On all fours, lift one knee out to the side while keeping the knee bent and core braced. Lower slowly without rotating your hips." },
  { name: "Frog Pump", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "Lie on your back with the soles of your feet together and knees falling open. Pulse your hips up by squeezing your glutes, keeping the movement small and fast." },
  { name: "Banded Good Morning", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Stand on a band with it across your upper back. Hinge at the hips with a flat back until you feel your hamstrings load, then drive your hips forward to stand." },
  { name: "Banded Kickback", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.BEGINNER, instructions: "On all fours with a band above your knees, drive one heel straight back and slightly up. Squeeze the glute at full extension before returning." },
  { name: "Curtsy Lunge", muscleGroup: MuscleGroup.GLUTES, difficulty: Difficulty.INTERMEDIATE, instructions: "Step one leg behind and across the other, lowering into a lunge. Keep your hips facing forward and drive back up through the front heel." },

  // Legs
  { name: "Goblet Squat", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Hold a dumbbell at your chest. Sit your hips down between your heels with your chest up, then drive through the whole foot to stand." },
  { name: "Dumbbell Romanian Deadlift", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.INTERMEDIATE, instructions: "With dumbbells in front of your thighs, hinge at the hips and slide them down your legs while keeping a flat back. Stop when your hamstrings load, then stand tall." },
  { name: "Barbell Romanian Deadlift", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.INTERMEDIATE, instructions: "Hold a barbell at your thighs and hinge back with soft knees, keeping the bar close to your legs. Feel the hamstring stretch, then drive your hips forward to stand." },
  { name: "Barbell Back Squat", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.INTERMEDIATE, instructions: "Bar across your upper back, brace your core and sit down and back until your thighs reach parallel. Push the floor away to stand, keeping your chest tall." },
  { name: "Bulgarian Split Squat", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.INTERMEDIATE, instructions: "Rear foot on a bench, dumbbells at your sides. Lower straight down until the front thigh is near parallel, then drive up through the front heel." },
  { name: "Reverse Lunge", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Step one foot back and lower both knees to about 90 degrees. Push through the front heel to return to standing without swinging the torso." },
  { name: "Walking Lunge", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.INTERMEDIATE, instructions: "Step forward into a lunge and continue stepping through, alternating legs. Keep your torso upright and knees tracking over toes." },
  { name: "Step-Up", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Place one full foot on a bench or sturdy step. Drive through that heel to stand on top, then lower with control — don't push off the bottom foot." },
  { name: "Lateral Lunge", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.INTERMEDIATE, instructions: "Step wide to one side, sitting that hip back while keeping the other leg straight. Push off the bent leg to return to center." },
  { name: "Sumo Squat", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Take a wide stance with toes turned out, dumbbell hanging between your legs. Sit straight down, keeping knees tracking over toes, and squeeze the glutes to stand." },
  { name: "Wall Sit", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Slide your back down a wall until your thighs are parallel to the floor. Hold with your weight in your heels and breathe steadily." },
  { name: "Calf Raise", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Stand tall and raise your heels as high as possible, pausing at the top. Lower slowly for a full stretch before the next rep." },
  { name: "Leg Press", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "In the leg press machine, place feet shoulder-width on the platform. Lower until your knees reach about 90 degrees and press without locking your knees hard." },
  { name: "Leg Extension", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Seated in the machine, extend your knees until your legs are straight and squeeze your quads at the top. Lower slowly and don't swing the weight." },
  { name: "Lying Leg Curl", muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.BEGINNER, instructions: "Face down on the curl machine and curl the pad toward your glutes, squeezing your hamstrings. Lower under control all the way down." },

  // Chest
  { name: "Dumbbell Bench Press", muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.INTERMEDIATE, instructions: "Lie on a bench with dumbbells at chest level. Press them up until your arms are extended, then lower slowly to chest height." },
  { name: "Incline Dumbbell Press", muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.INTERMEDIATE, instructions: "On a bench set to about 30 degrees, press the dumbbells up from chest height. Keep your shoulder blades pinned down and back." },
  { name: "Push-Up", muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.BEGINNER, instructions: "Hands under your shoulders, body in one straight line. Lower until your chest nearly touches the floor and press back up without sagging your hips." },
  { name: "Incline Push-Up", muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.BEGINNER, instructions: "Hands on a bench or sturdy surface, body angled. Lower your chest to the edge and press back up, keeping your core braced." },
  { name: "Dumbbell Chest Fly", muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.INTERMEDIATE, instructions: "Lie on a bench with dumbbells over your chest, slight bend in the elbows. Open your arms wide until you feel a chest stretch, then hug them back together." },
  { name: "Close-Grip Push-Up", muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.INTERMEDIATE, instructions: "Perform a push-up with hands close together under your chest. Keep elbows tracking back to bias the triceps and chest." },

  // Back
  { name: "Dumbbell Bent-Over Row", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.INTERMEDIATE, instructions: "Hinge forward with a flat back, dumbbells hanging down. Row both weights to your ribcage, squeezing your shoulder blades, then lower fully." },
  { name: "Single-Arm Dumbbell Row", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.BEGINNER, instructions: "One hand and knee on a bench, dumbbell in the free hand. Row the weight to your hip without twisting your torso, then lower with control." },
  { name: "Chest-Supported Dumbbell Row", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.INTERMEDIATE, instructions: "Lie chest-down on an incline bench holding dumbbells. Row them up by driving your elbows back, keeping your chest planted." },
  { name: "Superman", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.BEGINNER, instructions: "Lie face down with arms extended. Lift your arms, chest, and legs a few inches off the floor at the same time, pause, and lower slowly." },
  { name: "Rear Delt Fly", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.BEGINNER, instructions: "Hinge forward slightly with light dumbbells hanging down. Raise your arms out to the sides with soft elbows, leading with the hands, then lower slowly." },
  { name: "Seated Band Row", muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.BEGINNER, instructions: "Sit with a band around your feet, back tall. Pull the band to your lower ribs, squeezing your shoulder blades together, then release with control." },

  // Shoulders
  { name: "Dumbbell Shoulder Press", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.INTERMEDIATE, instructions: "Stand or sit with dumbbells at shoulder height. Press overhead until arms are extended, then lower back to your shoulders under control." },
  { name: "Lateral Raise", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.BEGINNER, instructions: "With light dumbbells at your sides, raise your arms out to shoulder height with soft elbows. Lower slowly — no swinging." },
  { name: "Front Raise", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.BEGINNER, instructions: "Raise one or both dumbbells straight in front of you to shoulder height, then lower under control without leaning back." },
  { name: "Arnold Press", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.INTERMEDIATE, instructions: "Start with dumbbells at your shoulders, palms facing you. Press overhead while rotating your palms forward, then reverse the motion on the way down." },
  { name: "Pike Push-Up", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.INTERMEDIATE, instructions: "From a downward-dog position with hips high, bend your elbows to lower your head toward the floor, then press back up." },
  { name: "Band Pull-Apart", muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.BEGINNER, instructions: "Hold a band at shoulder height with arms extended. Pull it apart until it touches your chest, squeezing your upper back, then return slowly." },

  // Arms
  { name: "Dumbbell Bicep Curl", muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.BEGINNER, instructions: "Stand tall with dumbbells at your sides, palms forward. Curl the weights up without swinging your torso, then lower fully." },
  { name: "Hammer Curl", muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.BEGINNER, instructions: "Curl dumbbells with palms facing each other, keeping elbows pinned at your sides. Lower slowly to a full stretch." },
  { name: "Tricep Kickback", muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.BEGINNER, instructions: "Hinge forward with a flat back, elbows high and pinned. Extend your forearms straight back, squeeze the triceps, and return under control." },
  { name: "Overhead Dumbbell Tricep Extension", muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.INTERMEDIATE, instructions: "Hold one dumbbell with both hands overhead. Lower it behind your head by bending your elbows, then extend back up without flaring your ribs." },
  { name: "Bench Dip", muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.INTERMEDIATE, instructions: "Hands on a bench edge, hips just off it. Lower by bending your elbows to about 90 degrees, then press back up without shrugging." },
  { name: "Band Bicep Curl", muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.BEGINNER, instructions: "Stand on a band and curl the handles toward your shoulders with elbows fixed at your sides. Lower against the band's tension slowly." },
  { name: "Band Tricep Extension", muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.BEGINNER, instructions: "Anchor the band high or hold it overhead. Extend your elbows against the band's resistance, squeeze the triceps, and return with control." },

  // Core
  { name: "Plank", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Forearms on the floor, body in one straight line from head to heels. Brace your abs and glutes, keep breathing, and don't let your hips sag or pike." },
  { name: "Side Plank", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.INTERMEDIATE, instructions: "On one forearm with feet stacked, lift your hips so your body forms a straight line. Hold while keeping your hips high and torso still." },
  { name: "Dead Bug", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Lie on your back with arms up and knees over hips. Lower the opposite arm and leg toward the floor while keeping your lower back pressed down, then return." },
  { name: "Bird Dog", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "On all fours, extend the opposite arm and leg until both are level with your torso. Pause, return with control, and avoid rotating your hips." },
  { name: "Hollow Body Hold", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.INTERMEDIATE, instructions: "Lie on your back and lift your shoulders and legs a few inches off the floor, arms extended overhead. Press your lower back down and hold." },
  { name: "Crunch", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Lie with knees bent, hands lightly behind your head. Curl your shoulder blades off the floor using your abs, then lower slowly." },
  { name: "Bicycle Crunch", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Lie on your back and alternate bringing elbow toward the opposite knee while extending the other leg. Move with control, not momentum." },
  { name: "Russian Twist", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.INTERMEDIATE, instructions: "Sit with knees bent and torso leaned back 45 degrees. Rotate your torso side to side, tapping the floor beside each hip." },
  { name: "Lying Leg Raise", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.INTERMEDIATE, instructions: "Lie flat with legs straight. Raise them to vertical, then lower slowly toward the floor without letting your lower back arch." },
  { name: "Mountain Climber", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.INTERMEDIATE, instructions: "From a high plank, drive one knee toward your chest and switch legs quickly while keeping your hips level and shoulders over wrists." },
  { name: "Toe Touch Crunch", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Lie with legs vertical. Reach your hands toward your toes, lifting your shoulder blades off the floor, then lower with control." },
  { name: "Flutter Kicks", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.INTERMEDIATE, instructions: "Lie flat with legs extended a few inches off the floor. Kick them up and down in small alternating motions while keeping your lower back down." },
  { name: "V-Up", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.ADVANCED, instructions: "Lie flat with arms overhead. Lift your legs and torso at the same time so your body forms a V, then lower both ends with control." },
  { name: "Heel Tap", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.BEGINNER, instructions: "Lie with knees bent and feet flat. Crunch up slightly and alternate tapping each heel with your fingertips, keeping your neck relaxed." },
  { name: "Marching Plank", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.INTERMEDIATE, instructions: "Hold a forearm plank and alternately lift each foot a few inches without letting your hips rock side to side." },
  { name: "Band Pallof Press", muscleGroup: MuscleGroup.CORE, difficulty: Difficulty.INTERMEDIATE, instructions: "Stand sideways to a band anchor at chest height. Press the band straight out in front of you, resist the rotation, and return slowly." },

  // Cardio — general
  { name: "March in Place", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "March upright, driving each knee to hip height with arms swinging. Stay tall and keep a steady rhythm." },
  { name: "Step Jack", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Like a jumping jack, but step one foot out at a time while raising your arms overhead. Keep the pace brisk for a low-impact option." },
  { name: "Jumping Jack", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Jump your feet wide while clapping hands overhead, then jump back to standing. Land softly with slightly bent knees." },
  { name: "High Knees", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.INTERMEDIATE, instructions: "Run in place, driving knees to hip height as fast as you can while staying tall and landing lightly on the balls of your feet." },
  { name: "Fast March", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "March quickly with high knees and powerful arm drive, staying light on your feet. Keep your chest up and core engaged." },
  { name: "Butt Kicks", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Jog in place, kicking your heels toward your glutes. Land softly and keep your knees pointing down." },
  { name: "Skater", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.INTERMEDIATE, instructions: "Leap laterally from one foot to the other, sweeping the trailing leg behind. Land softly and stay low through the hips." },
  { name: "Low-Impact Skater", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Step wide side to side, sweeping the trailing leg behind without jumping. Keep your hips low and move at a quick rhythm." },
  { name: "Shadow Boxing", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Throw controlled punches while bouncing lightly on your feet. Rotate your hips with each punch and keep your guard up." },
  { name: "Burpee", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.ADVANCED, instructions: "From standing, drop to a plank, perform a push-up, jump your feet back in, and explode upward. Move fluidly and land softly." },
  { name: "Step-Back Burpee", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Place your hands down, step your feet back to a plank one at a time, step them back in, and stand up reaching overhead — no jumping." },
  { name: "Lateral Step Touch", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Step to one side and tap the other foot beside it, then reverse. Swing your arms naturally and keep a quick, light rhythm." },
  { name: "Squat to Calf Raise", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Perform a bodyweight squat and stand up rising onto your toes into a calf raise. Flow between the two without pausing." },
  { name: "Standing Side Crunch", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Stand tall and lift one knee out to the side while bringing the same-side elbow down to meet it. Alternate sides at a steady pace." },
  { name: "Knee Drive", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Step back into a lunge stance and drive that knee forward toward your chest repeatedly, then switch sides. Use your arms to keep rhythm." },
  { name: "Torso Rotation", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.BEGINNER, instructions: "Stand with feet shoulder-width and rotate your torso side to side with arms bent, pivoting on your toes. Keep the movement brisk and controlled." },
  { name: "In-and-Out Squat", muscleGroup: MuscleGroup.CARDIO, difficulty: Difficulty.INTERMEDIATE, instructions: "Jump or step your feet out into a squat, touch the floor, then jump or step them back together. Keep your chest up as you sit back." },

  // Mobility
  { name: "Cat-Cow", muscleGroup: MuscleGroup.MOBILITY, difficulty: Difficulty.BEGINNER, instructions: "On all fours, alternate between arching your back toward the ceiling and letting it sag while lifting your head. Move slowly with your breath." },
  { name: "Hip Flexor Stretch", muscleGroup: MuscleGroup.MOBILITY, difficulty: Difficulty.BEGINNER, instructions: "From a half-kneeling position, tuck your pelvis and shift your weight forward until you feel a stretch at the front of the rear hip. Hold and breathe." },
  { name: "World's Greatest Stretch", muscleGroup: MuscleGroup.MOBILITY, difficulty: Difficulty.INTERMEDIATE, instructions: "From a lunge, place both hands inside your front foot, drop the same-side elbow toward the floor, then rotate the arm to the ceiling. Alternate sides." },
  { name: "Child's Pose", muscleGroup: MuscleGroup.MOBILITY, difficulty: Difficulty.BEGINNER, instructions: "Kneel with knees wide, sit your hips back to your heels and reach your arms forward. Breathe deeply and let your chest melt toward the floor." },
  { name: "Hamstring Stretch", muscleGroup: MuscleGroup.MOBILITY, difficulty: Difficulty.BEGINNER, instructions: "Sit with one leg extended and hinge forward from the hips until you feel a stretch along the back of the thigh. Keep your back long." },
];

// ─── Template types ──────────────────────────────────────────────────────────

type ExSpec = {
  name: string;
  sets: number;
  reps?: number;
  seconds?: number;
  rest: number;
  notes?: string;
};

type DayTemplate = {
  title: string;
  exercises: ExSpec[];
};

type ProgramTemplate = {
  weeks: number;
  daysPerWeek: number;
  rotation: DayTemplate[];
};

const ex = (name: string, sets: number, repsOrSeconds: number, rest: number, opts?: { seconds?: boolean; notes?: string }): ExSpec =>
  opts?.seconds
    ? { name, sets, seconds: repsOrSeconds, rest, notes: opts.notes }
    : { name, sets, reps: repsOrSeconds, rest, notes: opts?.notes };

// ─── Program templates ───────────────────────────────────────────────────────

export const PROGRAM_CONTENT: Record<string, ProgramTemplate> = {
  "21-day-booty-band-challenge": {
    weeks: 3,
    daysPerWeek: 5,
    rotation: [
      {
        title: "Band Activation",
        exercises: [
          ex("Banded Lateral Walk", 3, 15, 45),
          ex("Glute Bridge", 3, 15, 45),
          ex("Clamshell", 3, 12, 30, { notes: "Each side" }),
          ex("Donkey Kick", 3, 12, 30, { notes: "Each side" }),
          ex("Fire Hydrant", 3, 12, 30, { notes: "Each side" }),
        ],
      },
      {
        title: "Band Strength",
        exercises: [
          ex("Sumo Squat", 4, 12, 60),
          ex("Banded Good Morning", 3, 12, 60),
          ex("Glute Bridge March", 3, 12, 45),
          ex("Banded Lateral Walk", 3, 12, 30),
          ex("Banded Kickback", 3, 12, 30, { notes: "Each side" }),
        ],
      },
      {
        title: "Glute Burn",
        exercises: [
          ex("Frog Pump", 3, 20, 30),
          ex("Single-Leg Glute Bridge", 3, 10, 45, { notes: "Each side" }),
          ex("Curtsy Lunge", 3, 10, 45, { notes: "Alternating" }),
          ex("Donkey Kick", 3, 15, 30, { notes: "Each side" }),
          ex("Fire Hydrant", 3, 15, 30, { notes: "Each side" }),
        ],
      },
      {
        title: "Core + Glutes",
        exercises: [
          ex("Dead Bug", 3, 10, 45),
          ex("Bird Dog", 3, 10, 45, { notes: "Each side" }),
          ex("Glute Bridge", 3, 15, 30),
          ex("Plank", 3, 40, 30, { seconds: true }),
          ex("Side Plank", 3, 30, 30, { seconds: true, notes: "Each side" }),
        ],
      },
      {
        title: "Band Finisher",
        exercises: [
          ex("Banded Lateral Walk", 3, 20, 30),
          ex("Glute Bridge", 3, 20, 30),
          ex("Frog Pump", 3, 20, 20),
          ex("Clamshell", 3, 15, 30, { notes: "Each side" }),
          ex("Hip Flexor Stretch", 2, 45, 15, { seconds: true, notes: "Each side" }),
        ],
      },
    ],
  },

  "6-week-dumbbell-glute-growth": {
    weeks: 6,
    daysPerWeek: 5,
    rotation: [
      {
        title: "Heavy Glutes",
        exercises: [
          ex("Dumbbell Romanian Deadlift", 4, 10, 90),
          ex("Goblet Squat", 4, 12, 75),
          ex("Dumbbell Hip Thrust", 4, 12, 75),
          ex("Reverse Lunge", 3, 10, 60, { notes: "Each side" }),
          ex("Calf Raise", 3, 15, 45),
        ],
      },
      {
        title: "Quad + Glute",
        exercises: [
          ex("Bulgarian Split Squat", 3, 10, 75, { notes: "Each side" }),
          ex("Sumo Squat", 4, 12, 60),
          ex("Step-Up", 3, 12, 60, { notes: "Each side, dumbbells at sides" }),
          ex("Lying Leg Curl", 3, 12, 45),
          ex("Glute Bridge", 3, 15, 45),
        ],
      },
      {
        title: "Unilateral Focus",
        exercises: [
          ex("Single-Leg Glute Bridge", 3, 12, 45, { notes: "Each side" }),
          ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg" }),
          ex("Lateral Lunge", 3, 10, 60, { notes: "Each side" }),
          ex("Dumbbell Romanian Deadlift", 3, 10, 75),
          ex("Calf Raise", 3, 15, 45),
        ],
      },
      {
        title: "Core + Carry",
        exercises: [
          ex("Goblet Squat", 3, 12, 60),
          ex("Dumbbell Hip Thrust", 3, 15, 60),
          ex("Plank", 3, 45, 30, { seconds: true }),
          ex("Dead Bug", 3, 10, 45),
          ex("Russian Twist", 3, 16, 45, { notes: "8 each side" }),
        ],
      },
      {
        title: "Glute Volume",
        exercises: [
          ex("Glute Bridge", 4, 15, 45),
          ex("Frog Pump", 3, 20, 30),
          ex("Banded Lateral Walk", 3, 20, 30),
          ex("Reverse Lunge", 3, 12, 60, { notes: "Each side" }),
          ex("Hamstring Stretch", 2, 45, 15, { seconds: true }),
        ],
      },
    ],
  },

  "8-week-glute-growth-blueprint": {
    weeks: 8,
    daysPerWeek: 5,
    rotation: [
      {
        title: "Barbell Strength",
        exercises: [
          ex("Barbell Back Squat", 4, 8, 120),
          ex("Barbell Romanian Deadlift", 4, 10, 90),
          ex("Barbell Hip Thrust", 4, 10, 90),
          ex("Lying Leg Curl", 3, 12, 60),
          ex("Calf Raise", 3, 15, 45),
        ],
      },
      {
        title: "Hypertrophy",
        exercises: [
          ex("Bulgarian Split Squat", 3, 10, 75, { notes: "Each side" }),
          ex("Goblet Squat", 4, 12, 60),
          ex("Dumbbell Hip Thrust", 4, 12, 60),
          ex("Leg Extension", 3, 15, 45),
          ex("Glute Bridge", 3, 15, 45),
        ],
      },
      {
        title: "Upper + Core",
        exercises: [
          ex("Dumbbell Bench Press", 4, 10, 90),
          ex("Dumbbell Bent-Over Row", 4, 10, 90),
          ex("Dumbbell Shoulder Press", 3, 12, 60),
          ex("Plank", 3, 45, 30, { seconds: true }),
          ex("Dead Bug", 3, 10, 45),
        ],
      },
      {
        title: "Posterior Chain",
        exercises: [
          ex("Barbell Romanian Deadlift", 4, 8, 120),
          ex("Step-Up", 3, 10, 60, { notes: "Each side, holding dumbbells" }),
          ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg" }),
          ex("Banded Lateral Walk", 3, 20, 30),
          ex("Hamstring Stretch", 2, 45, 15, { seconds: true }),
        ],
      },
      {
        title: "Glute Peak",
        exercises: [
          ex("Barbell Hip Thrust", 4, 10, 90),
          ex("Sumo Squat", 3, 12, 60),
          ex("Single-Leg Glute Bridge", 3, 12, 45, { notes: "Each side" }),
          ex("Calf Raise", 3, 15, 45),
          ex("Child's Pose", 2, 60, 10, { seconds: true }),
        ],
      },
    ],
  },

  "6-week-glutes-and-quads-builder": {
    weeks: 6,
    daysPerWeek: 5,
    rotation: [
      {
        title: "Quad Strength",
        exercises: [
          ex("Leg Press", 4, 10, 90),
          ex("Goblet Squat", 4, 12, 60),
          ex("Bulgarian Split Squat", 3, 10, 75, { notes: "Each side" }),
          ex("Leg Extension", 3, 15, 45),
          ex("Calf Raise", 3, 15, 45),
        ],
      },
      {
        title: "Glute Strength",
        exercises: [
          ex("Dumbbell Romanian Deadlift", 4, 10, 90),
          ex("Dumbbell Hip Thrust", 4, 12, 75),
          ex("Lateral Lunge", 3, 10, 60, { notes: "Each side" }),
          ex("Lying Leg Curl", 3, 12, 45),
          ex("Glute Bridge", 3, 15, 45),
        ],
      },
      {
        title: "Machine Volume",
        exercises: [
          ex("Leg Press", 3, 15, 75, { notes: "Feet high on the platform" }),
          ex("Sumo Squat", 4, 12, 60),
          ex("Reverse Lunge", 3, 10, 60, { notes: "Each side" }),
          ex("Leg Extension", 3, 12, 45),
          ex("Lying Leg Curl", 3, 12, 45),
        ],
      },
      {
        title: "Lower Body + Core",
        exercises: [
          ex("Goblet Squat", 3, 12, 60),
          ex("Step-Up", 3, 10, 60, { notes: "Each side" }),
          ex("Wall Sit", 3, 45, 45, { seconds: true }),
          ex("Plank", 3, 45, 30, { seconds: true }),
          ex("Bicycle Crunch", 3, 16, 45, { notes: "8 each side" }),
        ],
      },
      {
        title: "Burnout",
        exercises: [
          ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg" }),
          ex("Frog Pump", 3, 20, 30),
          ex("Banded Lateral Walk", 3, 20, 30),
          ex("Calf Raise", 3, 20, 30),
          ex("Child's Pose", 2, 60, 10, { seconds: true }),
        ],
      },
    ],
  },

  "21-day-strong-abs-and-core-challenge": {
    weeks: 3,
    daysPerWeek: 5,
    rotation: [
      {
        title: "Core Foundation",
        exercises: [
          ex("Dead Bug", 3, 10, 45),
          ex("Plank", 3, 40, 30, { seconds: true }),
          ex("Crunch", 3, 15, 45),
          ex("Heel Tap", 3, 20, 30, { notes: "10 each side" }),
          ex("Bird Dog", 3, 10, 45, { notes: "Each side" }),
        ],
      },
      {
        title: "Lower Abs",
        exercises: [
          ex("Lying Leg Raise", 3, 12, 45),
          ex("Flutter Kicks", 3, 30, 30, { seconds: true }),
          ex("Toe Touch Crunch", 3, 15, 45),
          ex("Plank", 3, 45, 30, { seconds: true }),
          ex("Cat-Cow", 2, 45, 15, { seconds: true }),
        ],
      },
      {
        title: "Obliques",
        exercises: [
          ex("Russian Twist", 3, 20, 45, { notes: "10 each side" }),
          ex("Bicycle Crunch", 3, 16, 45, { notes: "8 each side" }),
          ex("Side Plank", 3, 30, 30, { seconds: true, notes: "Each side" }),
          ex("Mountain Climber", 3, 30, 30, { seconds: true }),
          ex("Hollow Body Hold", 3, 25, 30, { seconds: true }),
        ],
      },
      {
        title: "Deep Core",
        exercises: [
          ex("Hollow Body Hold", 3, 25, 30, { seconds: true }),
          ex("Dead Bug", 3, 12, 45),
          ex("Marching Plank", 3, 30, 30, { seconds: true }),
          ex("V-Up", 3, 10, 45),
          ex("Child's Pose", 2, 60, 10, { seconds: true }),
        ],
      },
      {
        title: "Core Circuit",
        exercises: [
          ex("Plank", 3, 45, 20, { seconds: true }),
          ex("Crunch", 3, 20, 30),
          ex("Lying Leg Raise", 3, 12, 30),
          ex("Russian Twist", 3, 20, 30, { notes: "10 each side" }),
          ex("Side Plank", 3, 30, 20, { seconds: true, notes: "Each side" }),
        ],
      },
    ],
  },

  "6-week-full-body-dumbbell-sculpt": {
    weeks: 6,
    daysPerWeek: 5,
    rotation: [
      {
        title: "Push + Legs",
        exercises: [
          ex("Dumbbell Bench Press", 4, 10, 75),
          ex("Goblet Squat", 4, 12, 60),
          ex("Dumbbell Shoulder Press", 3, 12, 60),
          ex("Reverse Lunge", 3, 10, 60, { notes: "Each side" }),
          ex("Plank", 3, 45, 30, { seconds: true }),
        ],
      },
      {
        title: "Pull + Posterior",
        exercises: [
          ex("Dumbbell Bent-Over Row", 4, 10, 75),
          ex("Dumbbell Romanian Deadlift", 4, 10, 75),
          ex("Lateral Raise", 3, 15, 45),
          ex("Step-Up", 3, 12, 60, { notes: "Each side" }),
          ex("Dead Bug", 3, 10, 45),
        ],
      },
      {
        title: "Full Body A",
        exercises: [
          ex("Sumo Squat", 4, 12, 60),
          ex("Chest-Supported Dumbbell Row", 4, 10, 75),
          ex("Incline Dumbbell Press", 3, 12, 60),
          ex("Hammer Curl", 3, 12, 45),
          ex("Russian Twist", 3, 16, 45, { notes: "8 each side" }),
        ],
      },
      {
        title: "Full Body B",
        exercises: [
          ex("Bulgarian Split Squat", 3, 10, 75, { notes: "Each side" }),
          ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side" }),
          ex("Arnold Press", 3, 12, 60),
          ex("Dumbbell Chest Fly", 3, 12, 45),
          ex("Lying Leg Raise", 3, 12, 45),
        ],
      },
      {
        title: "Conditioning + Core",
        exercises: [
          ex("Walking Lunge", 3, 12, 60, { notes: "12 each leg" }),
          ex("Push-Up", 3, 12, 45),
          ex("Rear Delt Fly", 3, 15, 45),
          ex("Mountain Climber", 3, 30, 30, { seconds: true }),
          ex("Hollow Body Hold", 3, 25, 30, { seconds: true }),
        ],
      },
    ],
  },

  "30-day-low-impact-cardio-burn": {
    weeks: 5,
    daysPerWeek: 5,
    rotation: [
      {
        title: "Low-Impact Intervals",
        exercises: [
          ex("March in Place", 4, 60, 30, { seconds: true }),
          ex("Step Jack", 4, 45, 30, { seconds: true }),
          ex("Lateral Step Touch", 3, 60, 30, { seconds: true }),
          ex("Torso Rotation", 3, 45, 20, { seconds: true }),
          ex("Standing Side Crunch", 3, 16, 30, { notes: "8 each side" }),
        ],
      },
      {
        title: "Sculpt + Sweat",
        exercises: [
          ex("Squat to Calf Raise", 4, 15, 45),
          ex("Step-Back Burpee", 3, 10, 45),
          ex("Shadow Boxing", 4, 60, 30, { seconds: true }),
          ex("Knee Drive", 3, 12, 30, { notes: "Each side" }),
          ex("Plank", 3, 40, 30, { seconds: true }),
        ],
      },
      {
        title: "Steady State",
        exercises: [
          ex("Fast March", 4, 90, 30, { seconds: true }),
          ex("Low-Impact Skater", 4, 45, 30, { seconds: true }),
          ex("Step Jack", 3, 45, 30, { seconds: true }),
          ex("Wall Sit", 3, 40, 45, { seconds: true }),
          ex("Dead Bug", 3, 10, 45),
        ],
      },
      {
        title: "Lower Body + Core",
        exercises: [
          ex("Sumo Squat", 4, 15, 45),
          ex("Reverse Lunge", 3, 10, 45, { notes: "Each side" }),
          ex("Glute Bridge", 3, 15, 45),
          ex("Heel Tap", 3, 20, 30, { notes: "10 each side" }),
          ex("Cat-Cow", 2, 45, 15, { seconds: true }),
        ],
      },
      {
        title: "Finisher Flow",
        exercises: [
          ex("Lateral Step Touch", 4, 60, 20, { seconds: true }),
          ex("In-and-Out Squat", 3, 12, 45, { notes: "Step out and in — no jumping needed" }),
          ex("Shadow Boxing", 3, 60, 20, { seconds: true }),
          ex("March in Place", 3, 60, 20, { seconds: true }),
          ex("Hip Flexor Stretch", 2, 45, 15, { seconds: true, notes: "Each side" }),
        ],
      },
    ],
  },

  "4-week-resistance-band-full-body-sculpt": {
    weeks: 4,
    daysPerWeek: 5,
    rotation: [
      {
        title: "Upper Body Band",
        exercises: [
          ex("Seated Band Row", 4, 12, 60),
          ex("Band Pull-Apart", 3, 15, 45),
          ex("Band Bicep Curl", 3, 12, 45),
          ex("Band Tricep Extension", 3, 12, 45),
          ex("Plank", 3, 40, 30, { seconds: true }),
        ],
      },
      {
        title: "Lower Body Band",
        exercises: [
          ex("Sumo Squat", 4, 12, 60),
          ex("Banded Good Morning", 3, 12, 60),
          ex("Banded Lateral Walk", 3, 15, 30),
          ex("Glute Bridge", 3, 15, 45),
          ex("Calf Raise", 3, 15, 45),
        ],
      },
      {
        title: "Full Body Band",
        exercises: [
          ex("Band Pull-Apart", 3, 15, 45),
          ex("Seated Band Row", 3, 12, 45),
          ex("Goblet Squat", 3, 12, 60),
          ex("Band Bicep Curl", 3, 12, 30),
          ex("Band Tricep Extension", 3, 12, 30),
        ],
      },
      {
        title: "Core + Carry",
        exercises: [
          ex("Band Pallof Press", 3, 10, 45, { notes: "Each side" }),
          ex("Dead Bug", 3, 10, 45),
          ex("Russian Twist", 3, 16, 45, { notes: "8 each side" }),
          ex("Side Plank", 3, 30, 30, { seconds: true, notes: "Each side" }),
          ex("Cat-Cow", 2, 45, 15, { seconds: true }),
        ],
      },
      {
        title: "Band Burnout",
        exercises: [
          ex("Banded Lateral Walk", 3, 20, 30),
          ex("Frog Pump", 3, 20, 30),
          ex("Band Bicep Curl", 3, 15, 30),
          ex("Band Pull-Apart", 3, 20, 30),
          ex("Child's Pose", 2, 60, 10, { seconds: true }),
        ],
      },
    ],
  },

  "14-day-tabata-and-cardio-challenge": {
    weeks: 2,
    daysPerWeek: 5,
    rotation: [
      {
        title: "Tabata Full Body",
        exercises: [
          ex("Jumping Jack", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("Squat to Calf Raise", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("Mountain Climber", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("Push-Up", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
        ],
      },
      {
        title: "Tabata Cardio",
        exercises: [
          ex("High Knees", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("Skater", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("Shadow Boxing", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("In-and-Out Squat", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
        ],
      },
      {
        title: "Tabata Core",
        exercises: [
          ex("Mountain Climber", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("Bicycle Crunch", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("Plank", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("Flutter Kicks", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
        ],
      },
      {
        title: "HIIT Power",
        exercises: [
          ex("Burpee", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest — modify with Step-Back Burpee" }),
          ex("Jumping Jack", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("Butt Kicks", 4, 40, 20, { seconds: true, notes: "40 sec on / 20 sec rest" }),
          ex("V-Up", 3, 30, 20, { seconds: true, notes: "30 sec on / 20 sec rest" }),
        ],
      },
      {
        title: "Active Recovery",
        exercises: [
          ex("March in Place", 3, 90, 30, { seconds: true }),
          ex("Cat-Cow", 2, 60, 15, { seconds: true }),
          ex("World's Greatest Stretch", 2, 60, 15, { seconds: true, notes: "30 sec each side" }),
          ex("Child's Pose", 2, 60, 10, { seconds: true }),
        ],
      },
    ],
  },

  "4-week-upper-body-dumbbell-sculpt": {
    weeks: 4,
    daysPerWeek: 4,
    rotation: [
      {
        title: "Push Day",
        exercises: [
          ex("Dumbbell Bench Press", 4, 10, 75),
          ex("Incline Dumbbell Press", 3, 12, 60),
          ex("Dumbbell Shoulder Press", 3, 12, 60),
          ex("Lateral Raise", 3, 15, 45),
          ex("Tricep Kickback", 3, 12, 45),
        ],
      },
      {
        title: "Pull Day",
        exercises: [
          ex("Dumbbell Bent-Over Row", 4, 10, 75),
          ex("Chest-Supported Dumbbell Row", 3, 12, 60),
          ex("Rear Delt Fly", 3, 15, 45),
          ex("Dumbbell Bicep Curl", 3, 12, 45),
          ex("Hammer Curl", 3, 12, 45),
        ],
      },
      {
        title: "Shoulders + Arms",
        exercises: [
          ex("Arnold Press", 3, 12, 60),
          ex("Front Raise", 3, 12, 45),
          ex("Lateral Raise", 3, 15, 45),
          ex("Overhead Dumbbell Tricep Extension", 3, 12, 45),
          ex("Dumbbell Bicep Curl", 3, 12, 45),
        ],
      },
      {
        title: "Upper + Core",
        exercises: [
          ex("Push-Up", 3, 12, 45),
          ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side" }),
          ex("Bench Dip", 3, 12, 45),
          ex("Plank", 3, 45, 30, { seconds: true }),
          ex("Dead Bug", 3, 10, 45),
        ],
      },
    ],
  },
};

// ─── Generator ───────────────────────────────────────────────────────────────

const PHASE_TITLES = [
  "Foundation",
  "Build",
  "Volume",
  "Intensify",
  "Peak",
  "Progress",
  "Advanced",
  "Finish",
];

/** Week-over-week progressive overload. */
function progression(spec: ExSpec, weekIdx: number): ExSpec {
  if (spec.seconds != null) {
    return {
      ...spec,
      seconds: spec.seconds + Math.min(30, Math.floor(weekIdx / 2) * 10),
      rest: Math.max(15, spec.rest - Math.floor(weekIdx / 2) * 5),
    };
  }
  const sets = Math.min(5, spec.sets + Math.floor(weekIdx / 2));
  const reps = spec.reps != null && spec.reps <= 15 && weekIdx >= 3 ? spec.reps + 2 : spec.reps;
  return { ...spec, sets, reps };
}

export type ContentResult = { weeks: number; days: number; entries: number } | null;

export async function ensureProgramContent(
  prisma: PrismaClient,
  programId: string,
  slug: string,
  opts: { rebuild?: boolean } = {},
): Promise<ContentResult> {
  const template = PROGRAM_CONTENT[slug];
  if (!template) return null;

  const existingWeeks = await prisma.programWeek.count({ where: { programId } });
  if (existingWeeks > 0 && !opts.rebuild) return null;
  if (existingWeeks > 0) {
    await prisma.programWeek.deleteMany({ where: { programId } });
  }

  // Resolve the exercise library (create anything missing, by unique name).
  const exerciseIds = new Map<string, string>();
  for (const def of EXERCISES) {
    const needed = template.rotation.some((d) => d.exercises.some((e) => e.name === def.name));
    if (!needed) continue;
    const found = await prisma.exercise.findFirst({ where: { name: def.name } });
    if (found) {
      exerciseIds.set(def.name, found.id);
    } else {
      const created = await prisma.exercise.create({ data: def });
      exerciseIds.set(def.name, created.id);
    }
  }

  const missing = template.rotation
    .flatMap((d) => d.exercises.map((e) => e.name))
    .filter((name) => !exerciseIds.has(name));
  if (missing.length > 0) {
    throw new Error(`PROGRAM_CONTENT[${slug}] references unknown exercises: ${missing.join(", ")}`);
  }

  let days = 0;
  let entries = 0;

  for (let w = 0; w < template.weeks; w++) {
    const weekDays: {
      dayNumber: number;
      title: string;
      exercises: {
        create: {
          exerciseId: string;
          order: number;
          sets: number;
          reps: number | null;
          duration: number | null;
          restSeconds: number;
          notes: string | null;
        }[];
      };
    }[] = [];

    for (let d = 0; d < template.daysPerWeek; d++) {
      const blueprint = template.rotation[d % template.rotation.length];
      const progressed = blueprint.exercises.map((e) => progression(e, w));
      weekDays.push({
        dayNumber: d + 1,
        title: blueprint.title,
        exercises: {
          create: progressed.map((e, i) => ({
            exerciseId: exerciseIds.get(e.name)!,
            order: i + 1,
            sets: e.sets,
            reps: e.reps ?? null,
            duration: e.seconds ?? null,
            restSeconds: e.rest,
            notes: e.notes ?? null,
          })),
        },
      });
      days++;
      entries += progressed.length;
    }

    await prisma.programWeek.create({
      data: {
        programId,
        weekNumber: w + 1,
        title: PHASE_TITLES[Math.min(w, PHASE_TITLES.length - 1)],
        days: { create: weekDays },
      },
    });
  }

  return { weeks: template.weeks, days, entries };
}
