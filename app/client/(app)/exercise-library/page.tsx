import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExerciseLibraryClient } from "@/components/exercise-library-client";
import { getOwnedCatalogProductIds } from "@/server/services/entitlement.service";

export default async function ExerciseLibraryPage() {
  const session = await requireRole([Role.CLIENT]);

  const [ownedProductIds, assignment, exercises] = await Promise.all([
    getOwnedCatalogProductIds(session.user.id),
    prisma.clientProgram.findFirst({
      where: { clientProfile: { userId: session.user.id }, isActive: true },
      select: { id: true },
    }),
    prisma.exercise.findMany({
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
    }),
  ]);

  const hasFullAccess = ownedProductIds.length > 0 || assignment !== null;

  return (
    <ExerciseLibraryClient
      exercises={hasFullAccess
        ? exercises.map((exercise) => ({
          ...exercise,
          videoUrl: exercise.videoUrl
            ? `/api/media/videos/${exercise.id}`
            : null,
        }))
        : exercises.map((exercise) => ({
          ...exercise,
          instructions: "",
          videoUrl: null,
        }))}
      libraryLocked={!hasFullAccess}
      userName={session.user.name}
    />
  );
}
