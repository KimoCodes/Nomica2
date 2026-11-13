// Phase 2 exercise technique blocks — core, cardio and mobility (grounded in prisma/program-content.ts).
import type { ExerciseInstruction } from "./types";

export const EXERCISES_CORE_CARDIO: ExerciseInstruction[] = [
  {
    name: "Plank",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Rest your forearms on the floor with elbows under shoulders, feet together, body in one straight line.
Execution: Brace your abs and glutes and hold the line from head to heels for the prescribed time.
Breathing: Breathe steadily through the nose and mouth; never hold your breath while braced.
Watch for: Don't let your hips sag toward the floor or pike up toward the ceiling.
Easier: Drop your knees to the floor while keeping a straight line from head to knees.
Harder: Lift one foot slightly off the floor and alternate, or simply hold longer.`,
  },
  {
    name: "Side Plank",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie on one side with your elbow under your shoulder and feet stacked.
Execution: Lift your hips until your body forms a straight line, hold, then lower; time is per side.
Breathing: Exhale as you lift, then breathe steadily through the hold — never hold your breath.
Watch for: Keep your hips high and stacked; don't let them sag or rotate backward.
Easier: Bend your bottom knee to the floor for extra support, or hold less time.
Harder: Stack the top foot fully and hold longer each side.`,
  },
  {
    name: "Dead Bug",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie on your back with arms pointing upward and knees stacked over your hips.
Execution: Lower the opposite arm and leg toward the floor, then return to the start.
Breathing: Exhale as you extend, inhale as you return, keeping your lower back pressed down.
Watch for: Stop the reach if your lower back begins to arch off the floor.
Easier: Move only your legs while keeping both arms still.
Harder: Extend both arms and one leg together, or slow the tempo.`,
  },
  {
    name: "Bird Dog",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: On all fours, stack wrists under shoulders and knees under hips with core braced.
Execution: Extend the opposite arm and leg to torso height, pause, then return; each side counts.
Breathing: Exhale as you extend, inhale on the return, and keep the hips level.
Watch for: Don't let the lifted leg rise above your torso or your hips rotate.
Easier: Extend only the leg while both hands stay on the floor.
Harder: Pause three seconds at full extension, or hold a light weight in your hand.`,
  },
  {
    name: "Hollow Body Hold",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start on your back with both arms extended overhead and legs straight.
Execution: Press your lower back down, lift your shoulders and legs a few inches, and hold.
Breathing: Take shallow, steady breaths while braced; never hold your breath in the hold.
Watch for: Stop if your lower back arches away from the floor.
Easier: Bend your knees or rest your arms at your sides.
Harder: Lower your legs closer to the floor while keeping your back flat.`,
  },
  {
    name: "Crunch",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie with knees bent, feet flat, and fingertips resting lightly behind your head.
Execution: Curl your shoulder blades clear of the floor using your abs, then lower slowly with control.
Breathing: Exhale as you curl up, inhale as you lower back down.
Watch for: Don't pull on your neck — the lift should come from your abdominals.
Easier: Cross your arms over your chest and keep the range of motion small.
Harder: Add a three-second lowering phase to every repetition.`,
  },
  {
    name: "Bicycle Crunch",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Rest on your back with hands lightly behind your head and legs raised.
Execution: Drive one elbow toward the opposite knee while extending the other leg, then alternate.
Breathing: Exhale as each elbow drives across, inhale as you switch sides.
Watch for: Move with control instead of momentum, and keep your lower back down.
Easier: Keep both feet on the floor and rotate only your upper body.
Harder: Slow the tempo and hold each twist for a beat.`,
  },
  {
    name: "Russian Twist",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Sit with knees bent, heels resting lightly down, and torso leaned back 45 degrees.
Execution: Rotate your torso to tap the floor beside each hip, passing through center each time.
Breathing: Exhale as you rotate to each side and inhale through the center.
Watch for: Turn from your ribs rather than your arms, and keep your chest tall.
Easier: Keep your heels on the floor and lean back less.
Harder: Lift your feet off the floor or hold a light weight at your chest.`,
  },
  {
    name: "Lying Leg Raise",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie flat on your back with legs straight and hands beside your hips.
Execution: Raise both legs to vertical, then lower them slowly toward the floor without rushing.
Breathing: Exhale as your legs lower and inhale as you raise them.
Watch for: Stop lowering the moment your lower back begins to arch.
Easier: Bend your knees, or lower your legs only halfway down.
Harder: Add a small hip lift at the top, or slow the lowering phase.`,
  },
  {
    name: "Mountain Climber",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start in a high plank with wrists under shoulders and your body straight.
Execution: Drive one knee toward your chest, then switch legs quickly at a steady pace.
Breathing: Breathe rhythmically with each knee drive rather than holding your breath.
Watch for: Keep your hips level and shoulders over your wrists; don't pike up.
Easier: Slow right down and step each foot in and out.
Harder: Speed up while keeping your upper body perfectly still.`,
  },
  {
    name: "Toe Touch Crunch",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie face-up with both of your legs raised straight toward the ceiling.
Execution: Reach your hands toward your toes, lifting your shoulder blades clear of the floor, then lower.
Breathing: Exhale as you reach up and inhale as you lower.
Watch for: Keep your lower back pressed down and don't swing your legs.
Easier: Bend your knees slightly, or reach only as far as your shins.
Harder: Hold each reach for a beat at the top.`,
  },
  {
    name: "Flutter Kicks",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie flat with legs extended and hands resting beside your hips.
Execution: Lift both legs a few inches and kick them up and down in small alternating motions.
Breathing: Breathe steadily through the set and never hold your breath.
Watch for: Keep your lower back pressed down; don't let the kicks grow large.
Easier: Bend your knees, or rest your heels on the floor between kicks.
Harder: Hold your legs closer to the floor and quicken the pace.`,
  },
  {
    name: "V-Up",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "ADVANCED" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start flat on your back with arms overhead and legs extended on the floor.
Execution: Lift your legs and torso at the same time so your body forms a V, then lower with control.
Breathing: Exhale as you fold up and inhale as you lower.
Watch for: Don't round your shoulders or swing your arms to cheat the lift.
Easier: Bend your knees, or lift only your legs or only your torso.
Harder: Take three controlled seconds to lower after every rep.`,
  },
  {
    name: "Heel Tap",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Lie down with knees bent, feet flat, and arms resting at your sides.
Execution: Crunch up slightly and alternate tapping each heel with your fingertips.
Breathing: Exhale as you reach to each side and inhale through the middle.
Watch for: Keep your neck relaxed and your shoulder blades lifted the whole set.
Easier: Crunch up less and tap closer to your hips.
Harder: Hold the crunch at the top and reach further past each knee.`,
  },
  {
    name: "Marching Plank",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hold a forearm plank with elbows stacked under your shoulders and feet together.
Execution: Lift one foot a few inches, set it down, then lift the other without rocking.
Breathing: Breathe steadily as you alternate feet; never hold your breath.
Watch for: Keep your hips square and stop them swaying side to side.
Easier: Widen your feet to give yourself a broader base.
Harder: Lift each foot higher, or pause two seconds on every lift.`,
  },
  {
    name: "Band Pallof Press",
    muscleGroup: "CORE" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand sideways to a band anchored at chest height with both hands holding it at your chest.
Execution: Press the band straight out, resist the pull, then return slowly; time is per side.
Breathing: Exhale as you press out and inhale as the band comes back.
Watch for: Keep your hips and shoulders square; don't let the band rotate you.
Easier: Step closer to the anchor to reduce the resistance.
Harder: Step further from the anchor, or hold each press for two seconds.`,
  },
  {
    name: "March in Place",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Begin standing with feet under your hips, elbows bent, and arms ready to swing.
Execution: Drive each knee up to hip height in turn, swinging opposite arms at a steady rhythm.
Breathing: Breathe naturally and evenly, matching your breath to your stride.
Watch for: Stay tall and avoid leaning back as each knee comes up.
Easier: March with smaller knee lifts at a slower, easier pace.
Harder: Pick up the pace and drive your knees up higher.`,
  },
  {
    name: "Step Jack",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand with your feet together and arms down at your sides.
Execution: Step one foot out wide while raising both arms overhead, then return and switch sides.
Breathing: Exhale as the foot steps out and inhale as you return.
Watch for: Keep the step brisk and your knees soft on every return.
Easier: Take smaller steps and raise your arms only to shoulder height.
Harder: Move faster, or add a shallow squat between each step.`,
  },
  {
    name: "Jumping Jack",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start with your feet together and arms hanging down at your sides.
Execution: Jump your feet wide while clapping your hands overhead, then jump back to the start.
Breathing: Exhale on the jump out and inhale on the way back in.
Watch for: Land softly with slightly bent knees instead of locking them out.
Easier: Do a Step Jack instead, stepping one foot out at a time.
Harder: Speed up the rhythm while still landing quietly.`,
  },
  {
    name: "High Knees",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Set your feet hip-width apart with elbows bent and hands ready at your sides.
Execution: Run in place, driving each knee to hip height as fast as good form allows.
Breathing: Breathe quickly and evenly in rhythm with your steps, and never hold your breath.
Watch for: Land lightly on the balls of your feet and stay tall.
Easier: March quickly in place with lower knee drives.
Harder: Raise the tempo, or add short ten-second bursts at full speed.`,
  },
  {
    name: "Fast March",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Place your feet under your hips with elbows bent and ready to drive.
Execution: March quickly with high knees and a powerful arm drive, staying light on your feet.
Breathing: Keep a steady breathing rhythm that matches your stride.
Watch for: Hold your chest up and core engaged rather than slouching forward.
Easier: Slow the pace and reduce how high your knees travel.
Harder: Increase the speed while keeping your knees at full height.`,
  },
  {
    name: "Butt Kicks",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Begin upright with feet under your hips and arms relaxed at your sides.
Execution: Jog in place, kicking your heels up toward your glutes with each step.
Breathing: Breathe steadily through your nose and mouth, exhaling lightly as each heel comes up.
Watch for: Keep your knees pointing down instead of driving them forward.
Easier: Walk in place and curl each heel up without hopping.
Harder: Speed up the jog while staying soft and quiet on your feet.`,
  },
  {
    name: "Skater",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand with a little clear space to each side and your weight on one foot.
Execution: Leap laterally onto the other foot, sweeping the trailing leg behind, and land softly.
Breathing: Exhale as you push off and inhale as you land.
Watch for: Stay low through the hips and land with a soft, bent knee.
Easier: Use a Low-Impact Skater, stepping side to side instead of leaping.
Harder: Leap farther sideways, or touch the floor on every landing.`,
  },
  {
    name: "Low-Impact Skater",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start upright with a little room to each side and knees softly bent.
Execution: Step wide to one side, sweeping the other leg behind, then reverse at a quick rhythm.
Breathing: Breathe evenly, matching your breath to the side-to-side rhythm.
Watch for: Keep one foot on the floor at all times — there is no jump.
Easier: Take smaller steps and slow the rhythm right down.
Harder: Sink lower through your hips and quicken the side-to-side pace.`,
  },
  {
    name: "Shadow Boxing",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand with feet staggered, hands up in front of your chin, and elbows tucked in.
Execution: Throw controlled punches, rotating your hips and pivoting on your toes with each one.
Breathing: Exhale sharply with each punch and inhale calmly between combinations.
Watch for: Keep your guard up and don't overreach or lock out your elbows.
Easier: Punch slower, keep your steps small, and use less rotation.
Harder: Add light bouncing footwork and string together longer combinations.`,
  },
  {
    name: "Burpee",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "ADVANCED" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Start standing with feet hip-width apart and arms hanging at your sides.
Execution: Drop to a plank, perform a push-up, jump your feet back in, and explode upward.
Breathing: Exhale as you press up and jump; inhale as you drop down.
Watch for: Land softly with bent knees and keep your hips from sagging in the plank.
Easier: Use a Step-Back Burpee — the no-jump, low-impact version.
Harder: Finish with a tuck jump and keep a brisk, unbroken pace.`,
  },
  {
    name: "Step-Back Burpee",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Set up with feet hip-width apart and arms relaxed, ready to crouch.
Execution: Hands down, step your feet back to a plank, step them in, then stand and reach overhead.
Breathing: Exhale as you stand and reach up; inhale as you crouch down.
Watch for: This is the no-jump, low-impact Burpee — keep your hips level in the plank.
Easier: Place your hands on a sturdy bench instead of the floor.
Harder: Add a knee push-up at the bottom, still without jumping.`,
  },
  {
    name: "Lateral Step Touch",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Face forward with your feet together and arms loose at your sides.
Execution: Step to one side and tap the other foot beside it, then reverse direction.
Breathing: Breathe naturally and keep an even rhythm with your steps.
Watch for: Stay light and quick, keeping a brisk rhythm throughout the set.
Easier: Take smaller steps at a slower tempo and keep the arms relaxed.
Harder: Widen your steps, swing your arms with more drive, and quicken the pace.`,
  },
  {
    name: "Squat to Calf Raise",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Take a shoulder-width stance with toes slightly turned out, arms in front of your chest.
Execution: Squat down, then stand and rise onto your toes, flowing between the two without pausing.
Breathing: Exhale as you stand and rise; inhale as you sit back down.
Watch for: Keep your heels tracking over your toes and let your knees follow outward.
Easier: Squat down to a chair, then rise only slightly onto your toes.
Harder: Hold a light weight at your chest, or pause a second at the top.`,
  },
  {
    name: "Standing Side Crunch",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Stand upright with feet under your hips and fingertips lightly behind your head.
Execution: Lift one knee out to the side as the same-side elbow meets it; reps are per side.
Breathing: Exhale as elbow and knee meet and inhale as you lower.
Watch for: Keep your torso moving sideways — don't fold forward or pull your neck.
Easier: Lift the knee lower and bring the elbow only part of the way down.
Harder: Slow the movement and squeeze for a beat at the top.`,
  },
  {
    name: "Knee Drive",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Step one foot back into a staggered stance with your weight on the front leg.
Execution: Drive the rear knee toward your chest repeatedly, using your arms for rhythm; reps are per side.
Breathing: Exhale sharply on each drive and inhale as your foot taps back.
Watch for: Stay tall and light — don't lean back as the knee rises.
Easier: Reduce the range and drive the knee only to hip height.
Harder: Increase the speed, or touch the floor with your hand between drives.`,
  },
  {
    name: "Torso Rotation",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Hold your feet shoulder-width with elbows bent and forearms in front of your chest.
Execution: Rotate side to side briskly, pivoting on the ball of each foot with every turn.
Breathing: Exhale through each rotation and inhale as you pass through the center.
Watch for: Pivot the trailing foot so your knees don't twist against a planted foot.
Easier: Slow the rotation down and keep both feet flat.
Harder: Widen your stance and rotate faster while staying controlled.`,
  },
  {
    name: "In-and-Out Squat",
    muscleGroup: "CARDIO" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Begin with feet together, knees softly bent, and arms relaxed at your sides.
Execution: Jump or step your feet out into a squat, touch the floor, then bring them together.
Breathing: Exhale as you jump or step out and inhale as you return.
Watch for: Sit your hips back with your chest up; don't round your back.
Easier: Step each foot out and in instead of jumping.
Harder: Jump your feet wider and keep a fast, continuous rhythm.`,
  },
  {
    name: "Cat-Cow",
    muscleGroup: "MOBILITY" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: On all fours with your wrists under your shoulders and knees under your hips.
Execution: Alternate between rounding your back toward the ceiling and arching it while lifting your head.
Breathing: Exhale as you round and inhale as you arch, moving slowly with your breath.
Watch for: Keep the movement slow and even, only going as far as feels comfortable.
Deeper: Increase the range gradually as your back warms up.
Softer: Reduce the range and pause in a neutral flat-back position.`,
  },
  {
    name: "Child's Pose",
    muscleGroup: "MOBILITY" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Kneel with your knees wide and big toes together, sitting your hips toward your heels.
Execution: Reach your arms forward and let your chest settle toward the floor, then hold.
Breathing: Breathe deeply into your back and never hold your breath in the hold.
Watch for: Keep your hips heavy on your heels instead of floating up.
Deeper: Walk your hands further forward and widen your knees slightly.
Softer: Place a cushion under your hips or sit on a folded towel.`,
  },
  {
    name: "Hip Flexor Stretch",
    muscleGroup: "MOBILITY" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: From a half-kneeling position, tuck your pelvis so your tailbone points down.
Execution: Shift your weight forward until you feel a stretch at the front of the rear hip; time is per side.
Breathing: Breathe steadily and let each exhale soften the stretch.
Watch for: Keep your hips square and don't let your lower back arch.
Deeper: Shift a little further forward while keeping the pelvis tucked.
Softer: Ease back out of the lunge, or pad the rear knee.`,
  },
  {
    name: "World's Greatest Stretch",
    muscleGroup: "MOBILITY" as ExerciseInstruction["muscleGroup"],
    difficulty: "INTERMEDIATE" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Step into a lunge and place both hands on the floor inside your front foot.
Execution: Drop the same-side elbow toward the floor, then rotate that arm up to the ceiling; each side.
Breathing: Exhale as you drop the elbow and inhale as you rotate open.
Watch for: Keep your back leg straight and your hips square to the floor.
Deeper: Sink your hips further forward as each side opens up.
Softer: Prop your hands on a block, or reduce how far the elbow drops.`,
  },
  {
    name: "Hamstring Stretch",
    muscleGroup: "MOBILITY" as ExerciseInstruction["muscleGroup"],
    difficulty: "BEGINNER" as ExerciseInstruction["difficulty"],
    instructions: `Set-up: Sit with one leg extended, the other foot against your inner thigh, and back long.
Execution: Hinge forward from the hips until you feel a stretch along the back of the thigh; per side.
Breathing: Exhale as you hinge forward and inhale as you ease back slightly.
Watch for: Hinge from your hips rather than rounding your shoulders forward.
Deeper: Slide your hands further along the leg while keeping your back long.
Softer: Sit taller, or place a rolled towel under your bent knee.`,
  },
];
