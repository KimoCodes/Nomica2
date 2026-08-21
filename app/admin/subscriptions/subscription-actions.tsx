"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import {
  adminChangePlanAction,
  adminCancelSubscriptionAction,
  adminApproveSubscriptionAction,
  adminRevokeSubscriptionAction,
} from "@/actions/subscription.actions";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLANS, formatPlanPrice } from "@/constants/subscriptions";
import {
  Loader2,
  ArrowUpDown,
  CreditCard,
  XCircle,
  CheckCircle,
  Ban,
} from "lucide-react";

import { trackLoading } from "@/components/ui/loading-bar";

type AdminSubscriptionActionsProps = {
  subscriptionId: string;
  userId: string;
  currentPlan: SubscriptionPlan;
  status: string;
};

export function AdminSubscriptionActions({
  subscriptionId,
  userId,
  currentPlan,
  status,
}: AdminSubscriptionActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | "">("");

  const isCanceled = status === "canceled";

  async function handleChangePlan() {
    if (!selectedPlan || selectedPlan === currentPlan) return;
    setIsPending(true);
    const result = await trackLoading(() =>
      adminChangePlanAction(subscriptionId, selectedPlan),
    );
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
    setSelectedPlan("");
  }

  async function handleCancel() {
    setIsPending(true);
    const result = await trackLoading(() =>
      adminCancelSubscriptionAction(subscriptionId),
    );
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
  }

  async function handleApprove(plan: SubscriptionPlan) {
    setIsPending(true);
    const result = await trackLoading(() =>
      adminApproveSubscriptionAction(userId, plan),
    );
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
  }

  async function handleRevoke() {
    setIsPending(true);
    const result = await trackLoading(() =>
      adminRevokeSubscriptionAction(userId),
    );
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
  }

  return (
    <div className="flex items-center gap-2">
      {isCanceled ? (
        <Select
          value={selectedPlan}
          onValueChange={(value) => value && setSelectedPlan(value as SubscriptionPlan)}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <CheckCircle className="mr-1 size-3" />
            <SelectValue placeholder="Approve plan" />
          </SelectTrigger>
          <SelectContent>
            {PLANS.map((plan) => (
              <SelectItem key={plan.id} value={plan.id} className="text-xs">
                {plan.name} ({formatPlanPrice(plan)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Select
          value={selectedPlan}
          onValueChange={(value) => value && setSelectedPlan(value as SubscriptionPlan)}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <ArrowUpDown className="mr-1 size-3" />
            <SelectValue placeholder="Change plan" />
          </SelectTrigger>
          <SelectContent>
            {PLANS.filter((p) => p.id !== currentPlan).map((plan) => (
              <SelectItem key={plan.id} value={plan.id} className="text-xs">
                {plan.name} ({formatPlanPrice(plan)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {selectedPlan && ((isCanceled && selectedPlan !== currentPlan) || (!isCanceled && selectedPlan !== currentPlan)) && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="sm" variant={isCanceled ? "default" : "default"} className="h-8 text-xs">
                {isPending ? (
                  <Loader2 className="mr-1 size-3 animate-spin" />
                ) : isCanceled ? (
                  <CheckCircle className="mr-1 size-3" />
                ) : (
                  <CreditCard className="mr-1 size-3" />
                )}
                {isCanceled ? "Approve" : "Apply"}
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isCanceled ? "Approve subscription?" : "Change subscription plan?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isCanceled
                  ? `This will create a new active ${selectedPlan.replace("_", " ")} subscription for this user. They will gain immediate access to all features.`
                  : `This will change the user's plan from ${currentPlan} to ${selectedPlan} via Stripe. The user will be charged or credited proportionally.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => isCanceled ? handleApprove(selectedPlan) : handleChangePlan()}>
                {isCanceled ? "Confirm approval" : "Confirm change"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {!isCanceled && (
        <>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="sm" variant="destructive" className="h-8 text-xs" disabled={isPending}>
                  <XCircle className="mr-1 size-3" />
                  Cancel
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  The subscription will remain active until the end of the current billing
                  period. This will update Stripe to prevent renewal.
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

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="sm" variant="destructive" className="h-8 text-xs" disabled={isPending}>
                  <Ban className="mr-1 size-3" />
                  Revoke
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke this subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately cancel the subscription and revoke access.
                  The user will be notified. This action can be undone by approving
                  a new subscription.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevoke}>
                  Confirm revocation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
