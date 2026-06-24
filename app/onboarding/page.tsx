import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getClientOnboardingState } from "@/server/services/onboarding.service";
import { ClientOnboardingWizard } from "@/components/forms/onboarding/client-onboarding-wizard";

export default async function ClientOnboardingPage() {
  const session = await requireRole([Role.CLIENT]);
  const state = await getClientOnboardingState(session.user.id);

  if (state.isComplete) {
    redirect("/client");
  }

  return (
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
  );
}
