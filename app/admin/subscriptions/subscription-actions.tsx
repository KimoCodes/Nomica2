"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import { changePlanAction, cancelSubscriptionAction, simulatePaymentAction } from "@/actions/subscription.actions";
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
import { PLANS, formatPrice } from "@/constants/subscriptions";
import { Loader2, ArrowUpDown, CreditCard, XCircle } from "lucide-react";

type AdminSubscriptionActionsProps = {
  subscriptionId: string;
  currentPlan: SubscriptionPlan;
  status: string;
};

export function AdminSubscriptionActions({
  subscriptionId,
  currentPlan,
  status,
}: AdminSubscriptionActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | "">("");

  async function handleChangePlan() {
    if (!selectedPlan || selectedPlan === currentPlan) return;
    setIsPending(true);
    const result = await changePlanAction(selectedPlan);
    if (result.success) {
      await simulatePaymentAction(subscriptionId);
      router.refresh();
    }
    setIsPending(false);
    setSelectedPlan("");
  }

  async function handleCancel() {
    setIsPending(true);
    const result = await cancelSubscriptionAction();
    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedPlan}
        onValueChange={(value) => setSelectedPlan(value as SubscriptionPlan)}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <ArrowUpDown className="mr-1 size-3" />
          <SelectValue placeholder="Change plan" />
        </SelectTrigger>
        <SelectContent>
          {PLANS.filter((p) => p.id !== currentPlan).map((plan) => (
            <SelectItem key={plan.id} value={plan.id} className="text-xs">
              {plan.name} ({formatPrice(plan.monthlyPrice)}/mo)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPlan && selectedPlan !== currentPlan && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="sm" variant="default" className="h-8 text-xs">
                {isPending ? (
                  <Loader2 className="mr-1 size-3 animate-spin" />
                ) : (
                  <CreditCard className="mr-1 size-3" />
                )}
                Apply
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change subscription plan?</AlertDialogTitle>
              <AlertDialogDescription>
                This will change the user&apos;s plan from {currentPlan} to {selectedPlan}. A
                payment will be simulated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleChangePlan}>
                Confirm change
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
                period.
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
  );
}
