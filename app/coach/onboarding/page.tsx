import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getCoachProfile } from "@/server/services/onboarding.service";
import { CoachOnboardingForm } from "@/components/forms/onboarding/coach-onboarding-form";

export default async function CoachOnboardingPage() {
  const session = await requireRole([Role.COACH]);
  const profile = await getCoachProfile(session.user.id);

  if (profile?.onboardingComplete) {
    redirect("/coach");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-4">
      <div className="w-full max-w-lg">
        <CoachOnboardingForm />
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Coach Onboarding" };
}
