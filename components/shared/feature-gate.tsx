import { Role } from "@prisma/client";
import { getUserSubscription } from "@/server/services/subscription.service";
import { hasFeatureAccess, type FEATURE_GATING } from "@/constants/subscriptions";
import { Lock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

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

  if (hasFeatureAccess(plan, feature)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
      <Lock className="mb-3 size-10 text-muted-foreground/30" />
      <p className="text-sm font-medium">Premium feature</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Upgrade your plan to access this feature.
      </p>
      <Link href="/client/subscription" className={`${buttonVariants({ variant: "outline", className: "mt-4" })}`}>
        View plans
      </Link>
    </div>
  );
}
