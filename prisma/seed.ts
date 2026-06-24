import { Difficulty, MuscleGroup, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const systemExercises = [
  {
    name: "Push-up",
    muscleGroup: MuscleGroup.CHEST,
    difficulty: Difficulty.BEGINNER,
    instructions:
      "Hands shoulder-width apart, body in a straight line, lower chest to floor and press back up.",
  },
  {
    name: "Barbell back squat",
    muscleGroup: MuscleGroup.LEGS,
    difficulty: Difficulty.INTERMEDIATE,
    instructions:
      "Bar on upper back, feet shoulder-width, sit hips back and down keeping chest up, drive through mid-foot to stand.",
  },
  {
    name: "Romanian deadlift",
    muscleGroup: MuscleGroup.LEGS,
    difficulty: Difficulty.INTERMEDIATE,
    instructions:
      "Soft knees, hinge at hips pushing them back, keep bar close to legs, feel stretch in hamstrings, return to standing.",
  },
  {
    name: "Lat pulldown",
    muscleGroup: MuscleGroup.BACK,
    difficulty: Difficulty.BEGINNER,
    instructions:
      "Grip bar slightly wider than shoulders, pull elbows down to ribs, squeeze shoulder blades, control the return.",
  },
  {
    name: "Dumbbell shoulder press",
    muscleGroup: MuscleGroup.ARMS,
    difficulty: Difficulty.BEGINNER,
    instructions:
      "Dumbbells at shoulder height, press overhead without arching lower back, lower with control.",
  },
  {
    name: "Plank",
    muscleGroup: MuscleGroup.MOBILITY,
    difficulty: Difficulty.BEGINNER,
    instructions:
      "Forearms on floor, body straight from head to heels, brace core and glutes, breathe steadily.",
  },
  {
    name: "Treadmill run",
    muscleGroup: MuscleGroup.CARDIO,
    difficulty: Difficulty.BEGINNER,
    instructions:
      "Maintain upright posture, land softly under hips, use a sustainable pace for the prescribed duration.",
  },
  {
    name: "Walking lunge",
    muscleGroup: MuscleGroup.LEGS,
    difficulty: Difficulty.BEGINNER,
    instructions:
      "Step forward into a lunge, back knee drops toward floor, push through front heel to the next step.",
  },
  {
    name: "Seated cable row",
    muscleGroup: MuscleGroup.BACK,
    difficulty: Difficulty.BEGINNER,
    instructions:
      "Sit tall, pull handle to lower ribs, squeeze shoulder blades together, extend arms with control.",
  },
  {
    name: "Incline dumbbell press",
    muscleGroup: MuscleGroup.CHEST,
    difficulty: Difficulty.INTERMEDIATE,
    instructions:
      "Bench at 30-45 degrees, press dumbbells up over chest, lower until elbows are just below shoulder line.",
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  for (const exercise of systemExercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name, coachId: null },
    });

    if (!existing) {
      await prisma.exercise.create({
        data: {
          ...exercise,
          coachId: null,
        },
      });
    }
  }

  console.log(`Seeded ${systemExercises.length} system exercises`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
