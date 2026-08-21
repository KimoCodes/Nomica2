import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NutritionClient } from "@/components/nutrition-client";
import { FeatureGate } from "@/components/shared/feature-gate";

export default async function NutritionPage() {
  const session = await requireRole([Role.CLIENT]);

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    select: { weight: true },
  });

  return (
    <FeatureGate userId={session.user.id} userRole={Role.CLIENT} feature="nutrition">
      <NutritionClient
        userName={session.user.name}
        userWeight={profile?.weight ?? null}
      />
    </FeatureGate>
  );
}
