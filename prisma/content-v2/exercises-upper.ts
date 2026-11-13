// Phase 2 upper-body exercise instructions (v2) — source of truth for Exercise.instructions.
import type { ExerciseInstruction } from "./types";

export const EXERCISES_UPPER: ExerciseInstruction[] = [
  {
    name: "Dumbbell Bench Press",
    muscleGroup: "CHEST" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie flat with feet planted, shoulder blades pinned down and back, dumbbells at chest level, palms facing forward.
Execution: Press both weights straight up until your arms extend over your chest, then lower slowly until your elbows reach bench level.
Breathing: Exhale as you press up and inhale as you lower.
Watch for: Keep your ribs down and don't let your hips lift off the bench.
Easier: Use lighter dumbbells and stop the descent at a comfortable depth.
Harder: Add a one-second pause with the weights at your chest each rep.`,
  },
  {
    name: "Incline Dumbbell Press",
    muscleGroup: "CHEST" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Set the bench to about 30 degrees, sit back with shoulder blades pinned, dumbbells held at your upper chest.
Execution: Press the weights up and back over your shoulders until your arms are straight, then lower under control to chest height.
Breathing: Breathe out on the press and breathe in on the descent.
Watch for: Don't let your lower back arch or your ribs flare as you press.
Easier: Drop the bench to a flatter angle or use a lighter load.
Harder: Pause for a full second at the bottom of every rep.`,
  },
  {
    name: "Push-Up",
    muscleGroup: "CHEST" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hands just wider than shoulders, feet together, body forming one straight line from head to heels.
Execution: Lower until your chest is an inch from the floor, then press up to straight arms without sagging your hips.
Breathing: Inhale as you lower and exhale as you press away.
Watch for: Your hips must not drop toward the floor or pike toward the ceiling.
Easier: Do them with your hands on a bench (Incline Push-Up).
Harder: Set your feet on a bench to shift more load onto your chest.`,
  },
  {
    name: "Incline Push-Up",
    muscleGroup: "CHEST" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hands on a bench slightly wider than shoulders, feet walked back so your body sits at an angle.
Execution: Bend your elbows to bring your chest to the bench edge, then press back to straight arms keeping your line rigid.
Breathing: Exhale as you push up and inhale as you come down.
Watch for: Keep your core braced so your hips don't sag toward the floor.
Easier: Choose a higher surface so you stand more upright.
Harder: Move down to the floor for a standard Push-Up.`,
  },
  {
    name: "Dumbbell Chest Fly",
    muscleGroup: "CHEST" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie flat with dumbbells stacked over your chest, palms facing each other, elbows softly bent and fixed.
Execution: Open your arms wide until you feel a stretch across your chest, then hug the weights back together over your sternum.
Breathing: Inhale as your arms open and exhale as they close.
Watch for: Hold the same elbow bend; don't let your shoulders roll forward at the bottom.
Easier: Use lighter dumbbells and open only halfway.
Harder: Slow the opening phase to three seconds for each rep.`,
  },
  {
    name: "Close-Grip Push-Up",
    muscleGroup: "CHEST" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hands on the floor directly under your chest with thumbs nearly touching, body held in a tight line.
Execution: Lower with your elbows tracking back past your ribs, then press up until your arms are fully extended.
Breathing: Exhale at the top of each press and inhale as you descend.
Watch for: Keep your elbows close to your body; don't let them wing out sideways.
Easier: Take the same narrow grip with your hands on a bench.
Harder: Set your feet on a low step to load more weight onto your arms.`,
  },
  {
    name: "Dumbbell Bent-Over Row",
    muscleGroup: "BACK" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hinge at your hips to about 45 degrees with a flat back, knees soft, dumbbells hanging below your shoulders.
Execution: Row both weights to your ribcage by driving your elbows straight back, pinch your shoulder blades, then lower fully.
Breathing: Exhale as you row and inhale as the weights descend.
Watch for: Don't round your lower back or let your torso twist as you pull.
Easier: Brace one hand on a bench and row a single dumbbell.
Harder: Hold the top for two seconds on every rep.`,
  },
  {
    name: "Single-Arm Dumbbell Row",
    muscleGroup: "BACK" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Place one hand and the same-side knee on a bench, opposite foot planted, dumbbell hanging from your free hand.
Execution: Pull the weight toward your hip by driving your elbow back, then lower until your arm hangs fully stretched.
Breathing: Breathe out on the pull and breathe in as the weight lowers.
Watch for: Keep your shoulders level and don't rotate your chest open at the top.
Easier: Use a lighter dumbbell and stop the pull at your ribs.
Harder: Row both dumbbells from a hinged stance without bench support.`,
  },
  {
    name: "Chest-Supported Dumbbell Row",
    muscleGroup: "BACK" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie chest-down on an incline bench set near 30 degrees, arms hanging with dumbbells, feet flat on the floor.
Execution: Drive your elbows past your ribs to lift the weights, squeeze your shoulder blades, then lower until your arms extend.
Breathing: Exhale on the way up and inhale as you lower.
Watch for: Keep your chest on the pad instead of lifting it to heave the load.
Easier: Lighten the load or set the bench more upright.
Harder: Pause for one second with the weights at your ribs.`,
  },
  {
    name: "Superman",
    muscleGroup: "BACK" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie face down with legs straight, arms extended overhead, and forehead resting lightly on the floor.
Execution: Lift your arms, chest, and thighs a few inches together, hold briefly, then lower back down with control.
Breathing: Exhale as you lift and inhale as you return to the floor.
Watch for: Move smoothly from your hips and upper back; don't jerk your neck.
Easier: Lift only your chest and arms while keeping your feet on the floor.
Harder: Hold the top position for three seconds on every repetition.`,
  },
  {
    name: "Rear Delt Fly",
    muscleGroup: "BACK" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand hinged forward about 45 degrees with light dumbbells hanging in front, elbows softly bent.
Execution: Raise your arms out to the sides until level with your shoulders, then lower slowly along the same arc.
Breathing: Exhale as your arms rise and inhale as they fall.
Watch for: Don't swing your torso or shrug your shoulders toward your ears.
Easier: Perform it seated, or work one arm at a time.
Harder: Lie chest-down on an incline bench so momentum can't help.`,
  },
  {
    name: "Seated Band Row",
    muscleGroup: "BACK" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Check the band for nicks, then sit tall with legs extended and loop it around both feet.
Execution: Pull the band to your lower ribs by driving your elbows back, then straighten slowly with constant tension.
Breathing: Breathe out on the pull and breathe in as you release.
Watch for: Keep your chest tall and don't lean back to finish the rep.
Easier: Hold the band further from your feet so it starts with less stretch.
Harder: Grip the band nearer your feet so the same pull stretches it more.`,
  },
  {
    name: "Dumbbell Shoulder Press",
    muscleGroup: "SHOULDERS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Sit or stand with dumbbells at shoulder height, palms forward, elbows slightly in front, ribs stacked over hips.
Execution: Press both weights overhead until your arms lock out, then lower under control back to shoulder height.
Breathing: Exhale as you press and inhale as you lower.
Watch for: Don't arch your lower back or flare your ribs as the weights pass your head.
Easier: Press seated with lighter dumbbells and stop at eye level.
Harder: Stand for the set so your core must control the load.`,
  },
  {
    name: "Lateral Raise",
    muscleGroup: "SHOULDERS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand tall with a light dumbbell in each hand at your sides, elbows softly bent, shoulders relaxed.
Execution: Raise your arms out to the sides until they're level with your shoulders, then lower slowly along the same path.
Breathing: Exhale on the way up and inhale on the way down.
Watch for: Lead with your elbows and don't swing or lean back.
Easier: Raise the weights only to hip height.
Harder: Pause for two seconds at shoulder height each rep.`,
  },
  {
    name: "Front Raise",
    muscleGroup: "SHOULDERS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand with dumbbells resting against the front of your thighs, palms facing down, feet about hip-width.
Execution: Raise both arms straight in front to shoulder height, then lower with control without swinging.
Breathing: Breathe out as the weights rise and breathe in as they return.
Watch for: Keep your torso still; don't lean back to lift the load.
Easier: Raise a single dumbbell at a time.
Harder: Alternate arms continuously with no pause between sides.`,
  },
  {
    name: "Arnold Press",
    muscleGroup: "SHOULDERS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Sit tall with dumbbells at shoulder height, palms facing your body, elbows tucked in front of your chest.
Execution: Press overhead while rotating your palms to face forward, then reverse the rotation as you lower back down.
Breathing: Exhale during the press and inhale on the way down.
Watch for: Keep the rotation smooth and your ribs down; don't rush the turn.
Easier: Use light dumbbells and press only halfway up.
Harder: Slow the lowering phase to three seconds each rep.`,
  },
  {
    name: "Pike Push-Up",
    muscleGroup: "SHOULDERS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start in a downward-dog position with hips high, hands shoulder-width, and head between your arms.
Execution: Bend your elbows to lower the crown of your head toward the floor, then press back to straight arms.
Breathing: Inhale as you lower and exhale as you press up.
Watch for: Keep your hips high and elbows tracking back rather than flaring wide.
Easier: Set your hands on a bench or reduce how far you lower.
Harder: Set your feet on a box to load more weight onto your shoulders.`,
  },
  {
    name: "Band Pull-Apart",
    muscleGroup: "SHOULDERS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Inspect the band, then hold it at shoulder height with arms extended and hands about shoulder-width apart.
Execution: Pull the band apart until it touches your chest, then return slowly while keeping tension throughout.
Breathing: Exhale as you pull and inhale as you return.
Watch for: Keep your shoulders down; don't shrug as the band reaches your chest.
Easier: Grip the band wider to shorten the working range.
Harder: Move your hands closer together to increase the stretch.`,
  },
  {
    name: "Dumbbell Bicep Curl",
    muscleGroup: "ARMS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand tall with a dumbbell in each hand, palms forward, elbows tucked against your ribs.
Execution: Curl the weights toward your shoulders without moving your elbows, then lower until your arms are straight.
Breathing: Exhale on the curl and inhale as you lower.
Watch for: Don't swing your torso or let your elbows drift forward.
Easier: Curl one arm at a time with a lighter load.
Harder: Stop just short of lockout at the bottom to keep constant tension.`,
  },
  {
    name: "Hammer Curl",
    muscleGroup: "ARMS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand with dumbbells at your sides, palms facing your body, elbows pinned to your ribs.
Execution: Curl both weights up with palms still facing each other, pause briefly, then lower to a full stretch.
Breathing: Breathe out as you curl and breathe in as you lower.
Watch for: Keep your wrists neutral and don't let your elbows swing forward.
Easier: Use lighter dumbbells or curl one arm at a time.
Harder: Alternate arms with a two-second lowering on each rep.`,
  },
  {
    name: "Tricep Kickback",
    muscleGroup: "ARMS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hinge forward with a flat back, dumbbells at your sides, elbows lifted high beside your torso.
Execution: Extend your forearms straight back until your arms are level, squeeze, then return to 90 degrees under control.
Breathing: Exhale as you extend and inhale as you bend back.
Watch for: Keep your upper arms still; don't let your elbows drop.
Easier: Use a lighter dumbbell or work one arm at a time.
Harder: Hold the fully extended position for two seconds each rep.`,
  },
  {
    name: "Overhead Dumbbell Tricep Extension",
    muscleGroup: "ARMS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Sit tall holding one dumbbell with both hands under the top plate, arms overhead and ribs down.
Execution: Lower the weight behind your head by bending your elbows, then extend back to straight without flaring your ribs.
Breathing: Inhale as you lower and exhale as you extend.
Watch for: Keep your elbows pointing forward and close to your head.
Easier: Use a lighter dumbbell or train one arm at a time.
Harder: Slow the lowering phase to three seconds on every rep.`,
  },
  {
    name: "Bench Dip",
    muscleGroup: "ARMS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Sit on a bench edge with hands gripping just beside your hips, then slide your hips off.
Execution: Bend your elbows to lower your hips toward the floor, then press back up until your arms are straight.
Breathing: Exhale as you press up and inhale as you lower.
Watch for: Keep your shoulders down and elbows pointing back, not out to the sides.
Easier: Bend your knees and keep your feet flat close to the bench.
Harder: Rest your feet on a second bench to load more weight.`,
  },
  {
    name: "Band Bicep Curl",
    muscleGroup: "ARMS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Check the band for damage, stand on its middle with feet hip-width, handles held in both hands.
Execution: Curl the handles toward your shoulders against the band's tension, then lower slowly without letting it go slack.
Breathing: Exhale on the curl and inhale on the return.
Watch for: Keep your elbows fixed at your sides and your torso upright.
Easier: Set your feet closer together on the band for less tension.
Harder: Widen your stance to shorten the free band and add resistance.`,
  },
  {
    name: "Band Tricep Extension",
    muscleGroup: "ARMS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Inspect the band, anchor it high behind you, and hold it behind your head with elbows pointing up.
Execution: Extend your elbows until your arms are straight overhead, squeeze your triceps, then return slowly against the tension.
Breathing: Breathe out as you extend and breathe in as you bend.
Watch for: Keep your elbows narrow and your ribs down throughout.
Easier: Stand a step closer to the anchor to lighten the pull.
Harder: Step further away to lengthen the band before you start.`,
  },
];
