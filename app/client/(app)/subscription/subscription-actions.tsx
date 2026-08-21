"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import {
  changePlanAction,
  cancelSubscriptionAction,
  reactivateSubscriptionAction,
} from "@/actions/subscription.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";

import { trackLoading } from "@/components/ui/loading-bar";

type SubscriptionActionsProps = {
  currentPlan: SubscriptionPlan;
  upgradePlan: SubscriptionPlan | null;
  downgradePlan: SubscriptionPlan | null;
  isCanceled: boolean;
  subscriptionId: string;
};

export function SubscriptionActions({
  currentPlan,
  upgradePlan,
  downgradePlan,
  isCanceled,
  subscriptionId: _subscriptionId,
}: SubscriptionActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    if (!upgradePlan) return;
    setError(null);
    setIsPending(true);
    try {
      const result = await trackLoading(() => changePlanAction(upgradePlan));
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error?.message ?? "Failed to upgrade plan");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDowngrade() {
    if (!downgradePlan) return;
    setError(null);
    setIsPending(true);
    try {
      const result = await trackLoading(() => changePlanAction(downgradePlan));
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error?.message ?? "Failed to downgrade plan");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleCancel() {
    setError(null);
    setIsPending(true);
    try {
      const result = await trackLoading(() => cancelSubscriptionAction());
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error?.message ?? "Failed to cancel subscription");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleReactivate() {
    setError(null);
    setIsPending(true);
    try {
      const result = await trackLoading(() => reactivateSubscriptionAction());
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error?.message ?? "Failed to reactivate subscription");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold">{currentPlan.replace(/_/g, " ")}</p>
          <p className="text-sm text-muted-foreground">Your current plan</p>
        </div>
        <Badge variant="secondary">{isCanceled ? "Canceling" : "Active"}</Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        {upgradePlan && !isCanceled && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="default" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <ArrowUpCircle className="mr-2 size-4" />
                  )}
                  Upgrade to Annual
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Upgrade your plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be upgraded to the Annual plan. A prorated payment will be
                  processed immediately for the remainder of your billing period.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUpgrade}>
                  Confirm upgrade
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {downgradePlan && !isCanceled && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" disabled={isPending}>
                  <ArrowDownCircle className="mr-2 size-4" />
                  Downgrade to Monthly
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Downgrade your plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be downgraded to the Monthly plan at the end of your current
                  billing period. You will lose access to the annual rate.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDowngrade}>
                  Confirm downgrade
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isCanceled ? (
          <Button variant="outline" onClick={handleReactivate} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 size-4" />
            )}
            Reactivate
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" disabled={isPending}>
                  <XCircle className="mr-2 size-4" />
                  Cancel subscription
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your subscription will remain active until the end of the current
                  billing period. You can reactivate it before then.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  Confirm cancellation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
