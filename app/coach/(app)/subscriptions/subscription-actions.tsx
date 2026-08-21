"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import {
  coachApproveSubscriptionAction,
  coachRevokeSubscriptionAction,
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
import { Loader2, CheckCircle, Ban } from "lucide-react";
import { trackLoading } from "@/components/ui/loading-bar";

type CoachSubscriptionActionsProps = {
  targetUserId: string;
  currentPlan: SubscriptionPlan;
  status: string;
};

export function CoachSubscriptionActions({
  targetUserId,
  currentPlan,
  status,
}: CoachSubscriptionActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | "">("");

  const isCanceled = status === "canceled";

  async function handleApprove() {
    if (!selectedPlan) return;
    setIsPending(true);
    const result = await trackLoading(() =>
      coachApproveSubscriptionAction(targetUserId, selectedPlan),
    );
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
    setSelectedPlan("");
  }

  async function handleRevoke() {
    setIsPending(true);
    const result = await trackLoading(() =>
      coachRevokeSubscriptionAction(targetUserId),
    );
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedPlan}
        onValueChange={(value) => value && setSelectedPlan(value as SubscriptionPlan)}
      >
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <CheckCircle className="mr-1 size-3" />
          <SelectValue placeholder={isCanceled ? "Approve plan" : "Change plan"} />
        </SelectTrigger>
        <SelectContent>
          {PLANS.map((plan) => (
            <SelectItem key={plan.id} value={plan.id} className="text-xs">
              {plan.name} ({formatPlanPrice(plan)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPlan && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="sm" variant="default" className="h-8 text-xs" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-1 size-3 animate-spin" />
                ) : (
                  <CheckCircle className="mr-1 size-3" />
                )}
                {isCanceled || status === "canceled" ? "Approve" : "Apply"}
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isCanceled || status === "canceled"
                  ? "Approve subscription?"
                  : "Change subscription plan?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isCanceled || status === "canceled"
                  ? `This will create a new active ${selectedPlan.replace("_", " ")} subscription for this client. They will gain immediate access to all features.`
                  : `This will change the client's plan from ${currentPlan} to ${selectedPlan}.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleApprove}>
                {isCanceled || status === "canceled" ? "Confirm approval" : "Confirm change"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {status !== "canceled" && (
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
                This will immediately cancel the client&apos;s subscription and revoke
                their access. They will be notified. You can approve a new subscription
                for them at any time.
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
      )}
    </div>
  );
}
