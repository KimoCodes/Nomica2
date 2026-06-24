import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getCoachProfile } from "@/server/services/onboarding.service";

export default async function CoachAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole([Role.COACH]);
  const profile = await getCoachProfile(session.user.id);

  if (!profile?.onboardingComplete) {
    redirect("/coach/onboarding");
  }

  return children;
}
