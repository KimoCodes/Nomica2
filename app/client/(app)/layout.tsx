import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionGuard } from "@/components/shared/subscription-guard";
import { getSubscriptionForClient } from "@/server/services/subscription.service";
import { getClientFreeTrial } from "@/server/services/free-trial.service";

export default async function ClientAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole([Role.CLIENT]);

  const [profile, subscription, freeTrial] = await Promise.all([
    prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { onboardingComplete: true },
    }),
    getSubscriptionForClient(session.user.id),
    getClientFreeTrial(session.user.id),
  ]);

  if (!profile?.onboardingComplete) {
    redirect("/onboarding");
  }

  const trialInfo = freeTrial
    ? (() => {
        const now = new Date();
        const daysRemaining = Math.max(
          0,
          Math.ceil(
            (freeTrial.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
        );
        return {
          id: freeTrial.id,
          durationDays: freeTrial.durationDays,
          startDate: freeTrial.startDate,
          endDate: freeTrial.endDate,
          daysRemaining,
          grantedBy: {
            name: freeTrial.grantedBy.name,
            email: freeTrial.grantedBy.email,
          },
        };
      })()
    : null;

  return (
    <SubscriptionGuard
      subscription={{
        status: subscription?.status ?? null,
        plan: subscription?.plan ?? null,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
        currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      }}
      freeTrial={trialInfo}
    >
      {children}
    </SubscriptionGuard>
  );
}
