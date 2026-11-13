// Lower-body exercise instructions (v2): GLUTES + LEGS — source of truth for Exercise.instructions.
import type { ExerciseInstruction } from "./types";

export const EXERCISES_LOWER: ExerciseInstruction[] = [
  {
    name: "Banded Lateral Walk",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Loop a resistance band just above your knees and sink into a quarter squat, feet hip-width apart.
Execution: Step sideways one foot at a time, keeping constant tension on the band and your hips at the same height.
Breathing: Exhale as you step out, inhale as the trailing foot follows.
Watch for: Letting the knees cave inward or rising out of the squat as you move.
Easier: Use a lighter band or take smaller steps with less knee bend.
Harder: Use a thicker band or hold a dumbbell at your chest.`,
  },
  {
    name: "Glute Bridge",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie flat on your back with knees bent, feet flat hip-width apart, arms by your sides.
Execution: Drive through your heels to lift your hips until your body forms a straight line, then lower with control.
Breathing: Exhale as you lift your hips, inhale on the way down.
Watch for: Pushing through your toes or arching your lower back at the top.
Easier: Lift only partway, stopping before your lower back starts to arch.
Harder: Pause two seconds at the top of every rep, or place a dumbbell across your hips.`,
  },
  {
    name: "Single-Leg Glute Bridge",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie on your back with one knee bent and foot flat, the other leg extended toward the ceiling.
Execution: Drive through the planted heel to lift your hips level, then lower with control; all reps are per side.
Breathing: Exhale as you drive up, inhale as your hips return to the floor.
Watch for: Letting the raised hip drop so your pelvis tilts, or drifting onto your upper back.
Easier: Keep the extended leg bent, or rest its foot on the floor for support.
Harder: Hold a dumbbell across your hips, or slow each rep to three seconds down.`,
  },
  {
    name: "Glute Bridge March",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start on your back with knees bent, feet flat, and arms pressing into the floor beside you.
Execution: Bridge up and hold, then alternate lifting each foot a few inches, keeping your hips level throughout.
Breathing: Breathe steadily; exhale each time you lift a foot.
Watch for: Letting your hips drop or rock side to side as you march.
Easier: March with smaller lifts, or hold a static bridge instead of alternating.
Harder: Place a dumbbell across your hips or slow the march to a two-count.`,
  },
  {
    name: "Dumbbell Hip Thrust",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Sit on the floor with your upper back against a bench and a dumbbell resting over your hips.
Execution: Drive through your heels to lift until your torso is parallel to the floor, then lower with control.
Breathing: Exhale as you thrust up, inhale as you lower back down.
Watch for: Arching your lower back at the top instead of finishing with your glutes.
Easier: Use a lighter dumbbell or reduce the range by not lowering fully.
Harder: Add a two-second pause at the top or hold a heavier dumbbell.`,
  },
  {
    name: "Barbell Hip Thrust",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Rest your upper back on a bench with a barbell padded across your hips, feet flat.
Execution: Brace your core, drive through your heels to full hip extension, and lower slowly without over-arching.
Breathing: Exhale at the top of the thrust, inhale as you descend.
Watch for: Letting your ribs flare and lower back arch as you lock out.
Easier: Use an empty bar or a dumbbell instead of a loaded barbell.
Harder: Pause one second at lockout or slow the lowering phase to three seconds.`,
  },
  {
    name: "Clamshell",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie on your side with knees bent, hips stacked, and a band just above your knees.
Execution: Keep your feet touching and open the top knee against the band, then lower slowly. Reps are per side.
Breathing: Exhale as you open the knee, inhale as you return it.
Watch for: Rolling your hips back or letting the band pull your knees together on the way down.
Easier: Use a lighter band or open the knee only a few inches.
Harder: Use a thicker band or add a one-second pause at the top.`,
  },
  {
    name: "Donkey Kick",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Position yourself on all fours with hands under shoulders and knees under hips, core braced.
Execution: Drive one heel up with the knee bent 90 degrees, then lower with control; reps are per side.
Breathing: Exhale as you kick up, inhale as the knee returns down.
Watch for: Arching your lower back or letting the working hip drift outward.
Easier: Kick to a lower height or reduce the range near the top.
Harder: Add a one-second squeeze at the top or loop a band above your knees.`,
  },
  {
    name: "Fire Hydrant",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start on all fours with a flat back, hands under shoulders and core braced.
Execution: Lift one bent knee out to the side without rotating your hips, then lower slowly. Reps are per side.
Breathing: Exhale as the knee rises, inhale on the return.
Watch for: Leaning away from the working leg or letting the pelvis twist.
Easier: Lift the knee only halfway or use no band at all.
Harder: Loop a band above your knees or pause at the top of each lift.`,
  },
  {
    name: "Frog Pump",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie on your back with the soles of your feet together and knees falling open.
Execution: Pulse your hips up in a small, quick range by squeezing your glutes, keeping the movement short.
Breathing: Exhale on each upward pulse, inhale between pulses.
Watch for: Pushing the range too far and arching your lower back.
Easier: Slow the pulses or use a smaller range of motion.
Harder: Place a dumbbell across your hips or slow each pulse to two seconds.`,
  },
  {
    name: "Banded Good Morning",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand on a band with feet hip-width apart and the other end looped across your upper back.
Execution: Hinge at the hips with a flat back until your hamstrings load, then drive hips forward to stand.
Breathing: Inhale as you hinge, exhale as you stand tall.
Watch for: Rounding your back or bending your knees too much on the way down.
Easier: Use a lighter band or reduce the depth of the hinge.
Harder: Use a thicker band or pause for two seconds at the bottom.`,
  },
  {
    name: "Banded Kickback",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: On all fours with a band above your knees, keep your back flat and core braced.
Execution: Drive one heel straight back and slightly up against the band, squeeze, then return. Reps are per side.
Breathing: Exhale as you press the heel back, inhale on the return.
Watch for: Letting your lower back arch as the leg extends.
Easier: Use a lighter band or shorten the backward drive.
Harder: Add a one-second hold at full extension or use a thicker band.`,
  },
  {
    name: "Curtsy Lunge",
    muscleGroup: "GLUTES" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand tall with feet hip-width apart, arms relaxed at your sides.
Execution: Step one leg behind and across the other, lowering until both knees bend about 90 degrees; reps are per side.
Breathing: Exhale as you drive back up, inhale as you lower into the step.
Watch for: Letting your hips rotate or your front knee collapse inward.
Easier: Reduce the depth or keep the crossing step very small.
Harder: Hold dumbbells at your sides or slow the lowering phase.`,
  },
  {
    name: "Goblet Squat",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hold a dumbbell vertically at your chest with both hands, feet shoulder-width apart, toes slightly out.
Execution: Sit your hips down between your heels with your chest up, then drive through the whole foot to stand.
Breathing: Inhale as you sit down, exhale as you stand.
Watch for: Your heels lifting off the floor or your chest dropping forward.
Easier: Squat to a bench or reduce the depth.
Harder: Hold a heavier dumbbell or slow the descent to three seconds.`,
  },
  {
    name: "Dumbbell Romanian Deadlift",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hold a dumbbell in each hand in front of your thighs, feet hip-width apart, knees softly bent.
Execution: Hinge at the hips and slide the weights down your legs with a flat back, then stand tall.
Breathing: Inhale as you hinge, exhale as you return to standing.
Watch for: Rounding your back or letting the weights drift away from your legs.
Easier: Use lighter dumbbells or stop the hinge higher.
Harder: Use heavier dumbbells or pause at the bottom before standing.`,
  },
  {
    name: "Barbell Romanian Deadlift",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hold a barbell at your thighs with feet hip-width apart and a soft bend in your knees.
Execution: Push your hips back and slide the bar down your legs keeping it close, then drive hips forward to stand.
Breathing: Inhale on the way down, exhale as you finish the stand.
Watch for: Rounding the upper back or letting the bar roll away from your legs.
Easier: Use an empty bar or reduce the depth of the hinge.
Harder: Add a two-second pause at the bottom or increase the load.`,
  },
  {
    name: "Barbell Back Squat",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Rest the bar across your upper back, feet shoulder-width apart, core braced, hands gripping the bar.
Execution: Sit down and back until your thighs reach parallel, then push the floor away to stand with your chest tall.
Breathing: Inhale and brace before you descend, exhale as you stand up.
Watch for: Knees caving inward or your heels rising as you drive up.
Easier: Squat to a box or use a lighter barbell.
Harder: Slow each rep to three seconds down or add a pause at parallel.`,
  },
  {
    name: "Bulgarian Split Squat",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand in front of a bench with your rear foot resting on it, dumbbells at your sides.
Execution: Lower until your front thigh is near parallel, then drive up through the front heel; reps are per side.
Breathing: Inhale as you lower, exhale as you press back up.
Watch for: Your front heel lifting or your torso leaning far forward.
Easier: Hold onto a wall for balance or use no dumbbells.
Harder: Hold heavier dumbbells or slow the lowering phase to three seconds.`,
  },
  {
    name: "Reverse Lunge",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand tall with feet hip-width apart and core braced.
Execution: Step one foot back, lower both knees near 90 degrees, then drive up through the front heel; reps per side.
Breathing: Inhale as you step back and lower, exhale as you return to standing.
Watch for: Swinging your torso or letting your front knee cave inward.
Easier: Hold a wall for support or take a shallower step.
Harder: Hold dumbbells at your sides or slow each rep to three seconds.`,
  },
  {
    name: "Walking Lunge",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand tall with feet together, core braced, hands at your sides.
Execution: Step forward into a lunge, then continue through into the next step, alternating legs; count one rep per side.
Breathing: Exhale as you drive up and step through, inhale as you land.
Watch for: Letting your torso lean forward or your knees cave inward.
Easier: Perform stationary alternating lunges instead of traveling.
Harder: Hold dumbbells at your sides or lengthen each stride.`,
  },
  {
    name: "Step-Up",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Place one full foot on a bench or sturdy step, standing tall with hands at your sides.
Execution: Drive through that heel to stand on top without pushing off the bottom foot, then lower slowly; reps per side.
Breathing: Exhale as you stand up, inhale as you step down.
Watch for: Pushing off the bottom foot or letting your torso rock forward.
Easier: Use a lower step or push lightly from the bottom foot.
Harder: Hold dumbbells at your sides or slow the lowering phase.`,
  },
  {
    name: "Lateral Lunge",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start standing tall with your feet together and your weight balanced.
Execution: Step wide to one side, sit that hip back with a straight trailing leg, then push up; reps per side.
Breathing: Inhale as you sit into the lunge, exhale as you push back up.
Watch for: Rounding your back or letting the bent knee collapse inward.
Easier: Take a narrower step or reduce how far you sit back.
Harder: Hold a dumbbell at your chest or lengthen the step.`,
  },
  {
    name: "Sumo Squat",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Take a wide stance with toes turned out and a dumbbell hanging between your legs.
Execution: Sit straight down with knees tracking over your toes, then squeeze your glutes to stand tall.
Breathing: Inhale as you lower, exhale as you stand.
Watch for: Your knees caving in or your heels lifting off the floor.
Easier: Reduce the depth or hold onto a support for balance.
Harder: Hold a heavier dumbbell or pause for two seconds at the bottom.`,
  },
  {
    name: "Wall Sit",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand with your back flat against a wall and feet a step out from it.
Execution: Slide down until your thighs are parallel to the floor and hold that position steadily.
Breathing: Breathe steadily throughout the hold without holding your breath.
Watch for: Letting your knees roll forward past your toes or your hips slide too low.
Easier: Hold with your thighs higher than parallel or shorten the hold.
Harder: Hold a dumbbell across your thighs or extend the hold time.`,
  },
  {
    name: "Calf Raise",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand tall with feet hip-width apart, weight over the balls of your feet.
Execution: Raise your heels as high as possible, pause at the top, then lower slowly for a full stretch.
Breathing: Exhale as you raise your heels, inhale on the way down.
Watch for: Bouncing off the floor or letting your ankles roll outward.
Easier: Do the raises on flat ground with a smaller range.
Harder: Perform single-leg raises or hold dumbbells at your sides.`,
  },
  {
    name: "Leg Press",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Sit in the leg press machine with feet shoulder-width on the platform, hips and back flat.
Execution: Lower until your knees reach about 90 degrees, then press the platform away without locking your knees hard.
Breathing: Inhale as you lower, exhale as you press.
Watch for: Your hips lifting off the seat or snapping the knees at lockout.
Easier: Reduce the weight or use a shallower range.
Harder: Add weight or slow the lowering phase to three seconds.`,
  },
  {
    name: "Leg Extension",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Sit in the leg extension machine with the pad resting against your lower shins, handles gripped.
Execution: Extend your knees until your legs are straight, squeeze your quads, then lower slowly without swinging.
Breathing: Exhale as you extend, inhale as you lower the pad.
Watch for: Using momentum to swing the weight or locking out with a jerk.
Easier: Use a lighter pin setting or reduce the range slightly.
Harder: Add a one-second pause at full extension or increase the weight.`,
  },
  {
    name: "Lying Leg Curl",
    muscleGroup: "LEGS" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie face down on the curl machine with the pad just above your heels.
Execution: Curl the pad toward your glutes, squeezing your hamstrings, then lower all the way down under control.
Breathing: Exhale as you curl, inhale as you lower the pad.
Watch for: Lifting your hips off the pad or letting the weight drop quickly.
Easier: Use a lighter weight or reduce the range at the top.
Harder: Add a one-second squeeze at the top or increase the load.`,
  },
];
