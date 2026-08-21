"use client";

import { usePathname } from "next/navigation";
import { Lock, CreditCard, AlertTriangle, Gift, Clock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ACTIVE_STATUSES } from "@/constants/subscriptions";

const EXEMPT_PATHS = ["/client/subscription", "/client/payments", "/settings"];

type FreeTrialInfo = {
  id: string;
  durationDays: number;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
  grantedBy: { name: string | null; email: string };
} | null;

type SubscriptionStatus = {
  status: string | null;
  plan: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
};

export function SubscriptionGuard({
  children,
  subscription,
  freeTrial,
}: {
  children: React.ReactNode;
  subscription: SubscriptionStatus;
  freeTrial?: FreeTrialInfo;
}) {
  const pathname = usePathname();

  if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  const isActiveSub = subscription.status !== null && ACTIVE_STATUSES.includes(subscription.status as "active" | "trialing" | "past_due");
  const isActiveTrial = !!freeTrial && freeTrial.daysRemaining > 0;

  if (isActiveSub || isActiveTrial) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Lock className="size-8 text-muted-foreground/40" />
      </div>

      <h3 className="text-lg font-semibold">Subscription Required</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You need an active subscription to access this feature. Subscribe to
        NOMICA All Access to unlock workouts, progress tracking, nutrition plans,
        messaging, and more.
      </p>

      {subscription.status && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current status:</span>
          <Badge
            variant="outline"
            className={
              subscription.status === "past_due"
                ? "bg-warning/10 text-warning border-warning/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }
          >
            {subscription.status === "past_due" ? (
              <AlertTriangle className="mr-1 size-3" />
            ) : (
              <Lock className="mr-1 size-3" />
            )}
            {subscription.status.replace("_", " ")}
          </Badge>
        </div>
      )}

      {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
        <p className="mt-2 text-xs text-warning">
          Your subscription ends on{" "}
          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.{" "}
          Reactivate to keep access.
        </p>
      )}

      {subscription.status === "past_due" && (
        <p className="mt-2 text-xs text-warning">
          Your payment is past due. Please update your payment method to
          restore access.
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Link
          href="/client/subscription"
          className={buttonVariants({ variant: "default" })}
        >
          <CreditCard className="mr-2 size-4" />
          {subscription.status ? "Manage subscription" : "View plans"}
        </Link>
        {subscription.cancelAtPeriodEnd && (
          <Link
            href="/client/subscription"
            className={buttonVariants({ variant: "outline" })}
          >
            Reactivate
          </Link>
        )}
      </div>
    </div>
  );
}
