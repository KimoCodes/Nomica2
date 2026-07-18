"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import {
  changePlanAction,
  cancelSubscriptionAction,
  reactivateSubscriptionAction,
  simulatePaymentAction,
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
  subscriptionId,
}: SubscriptionActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleUpgrade() {
    if (!upgradePlan) return;
    setIsPending(true);
    const result = await trackLoading(() => changePlanAction(upgradePlan));
    if (result.success) {
      await simulatePaymentAction(subscriptionId);
      router.refresh();
    }
    setIsPending(false);
  }

  async function handleDowngrade() {
    if (!downgradePlan) return;
    setIsPending(true);
    const result = await trackLoading(() => changePlanAction(downgradePlan));
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
  }

  async function handleCancel() {
    setIsPending(true);
    const result = await trackLoading(() => cancelSubscriptionAction());
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
  }

  async function handleReactivate() {
    setIsPending(true);
    const result = await reactivateSubscriptionAction();
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold">{currentPlan}</p>
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
                  Upgrade to {upgradePlan}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Upgrade your plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be upgraded to the {upgradePlan} plan. A payment will be
                  processed immediately.
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
                  Downgrade to {downgradePlan}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Downgrade your plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be downgraded to the {downgradePlan} plan at the end of
                  your current billing period.
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
