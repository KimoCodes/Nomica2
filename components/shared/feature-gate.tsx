import { Role } from "@prisma/client";
import { getUserSubscription } from "@/server/services/subscription.service";
import { hasActiveFreeTrial } from "@/server/services/free-trial.service";
import { hasFeatureAccess, ACTIVE_STATUSES, type FEATURE_GATING } from "@/constants/subscriptions";
import { Lock, Gift } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FeatureGateProps = {
  userId: string;
  userRole: Role;
  feature: keyof typeof FEATURE_GATING;
  children: React.ReactNode;
};

export async function FeatureGate({
  userId,
  userRole,
  feature,
  children,
}: FeatureGateProps) {
  if (userRole === Role.ADMIN || userRole === Role.COACH) {
    return <>{children}</>;
  }

  const subscription = await getUserSubscription(userId);
  const plan = subscription?.plan ?? null;
  const status = subscription?.status ?? null;
  const isActiveSub = status !== null && ACTIVE_STATUSES.includes(status);

  if (plan && isActiveSub && hasFeatureAccess(plan, feature)) {
    return <>{children}</>;
  }

  const isActiveTrial = await hasActiveFreeTrial(userId);

  if (isActiveTrial) {
    return <>{children}</>;
  }

  const hasCanceledSubscription = plan !== null && !isActiveSub;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
      <Lock className="mb-3 size-10 text-muted-foreground/30" />
      <p className="text-sm font-medium">
        {hasCanceledSubscription
          ? "Subscription inactive"
          : "Premium feature"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {hasCanceledSubscription
          ? "Your subscription is no longer active. Renew to regain access."
          : "Choose a plan to access this feature."}
      </p>
      <Link
        href="/client/subscription"
        className={`${buttonVariants({ variant: "outline", className: "mt-4" })}`}
      >
        {hasCanceledSubscription ? "Renew subscription" : "View plans"}
      </Link>
    </div>
  );
}
