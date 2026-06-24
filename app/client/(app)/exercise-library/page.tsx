import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExerciseLibraryClient } from "@/components/exercise-library-client";

export default async function ExerciseLibraryPage() {
  const session = await requireRole([Role.CLIENT]);

  const exercises = await prisma.exercise.findMany({
    select: {
      id: true,
      name: true,
      muscleGroup: true,
      difficulty: true,
      instructions: true,
      videoUrl: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <ExerciseLibraryClient
      exercises={exercises}
      userName={session.user.name}
    />
  );
}
