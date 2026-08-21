import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CoachAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole([Role.COACH]);

  const profile = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingComplete: true },
  });

  if (!profile?.onboardingComplete) {
    redirect("/coach/onboarding");
  }

  return <>{children}</>;
}
