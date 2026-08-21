import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { handleLogout } from "@/actions/logout.action";
import { Button } from "@/components/ui/button";
import { getCoachProfile } from "@/server/services/onboarding.service";
import { CoachOnboardingForm } from "@/components/forms/onboarding/coach-onboarding-form";

export default async function CoachOnboardingPage() {
  const session = await requireRole([Role.COACH]);
  const profile = await getCoachProfile(session.user.id);

  if (profile?.onboardingComplete) {
    redirect("/coach");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-4">
      <div className="absolute right-4 top-4">
        <form action={handleLogout}>
          <Button type="submit" variant="outline" size="sm">
            Switch account
          </Button>
        </form>
      </div>
      <div className="w-full max-w-lg">
        <CoachOnboardingForm />
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Coach Onboarding" };
}
