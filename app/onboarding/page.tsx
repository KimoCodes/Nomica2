import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { handleLogout } from "@/actions/logout.action";
import { Button } from "@/components/ui/button";
import { getClientOnboardingState } from "@/server/services/onboarding.service";
import { ClientOnboardingWizard } from "@/components/forms/onboarding/client-onboarding-wizard";

export default async function ClientOnboardingPage() {
  const session = await requireRole([Role.CLIENT]);
  const state = await getClientOnboardingState(session.user.id);

  if (state.isComplete) {
    redirect("/client");
  }

  return (
    <div className="relative">
      <div className="absolute right-0 top-0 z-10">
        <form action={handleLogout}>
          <Button type="submit" variant="outline" size="sm">
            Switch account
          </Button>
        </form>
      </div>
      <ClientOnboardingWizard
        initialStep={state.currentStep}
        profile={
          state.profile
            ? {
                age: state.profile.age,
                gender: state.profile.gender,
                height: state.profile.height,
                weight: state.profile.weight,
                fitnessGoal: state.profile.fitnessGoal,
                activityLevel: state.profile.activityLevel,
                equipment: state.profile.equipment,
              }
            : null
        }
      />
    </div>
  );
}
