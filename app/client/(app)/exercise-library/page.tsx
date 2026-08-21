import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExerciseLibraryClient } from "@/components/exercise-library-client";
import { FeatureGate } from "@/components/shared/feature-gate";

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
    take: 200,
  });

  return (
    <FeatureGate userId={session.user.id} userRole={Role.CLIENT} feature="exerciseLibrary">
      <ExerciseLibraryClient
        exercises={exercises}
        userName={session.user.name}
      />
    </FeatureGate>
  );
}
