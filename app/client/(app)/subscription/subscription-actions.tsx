"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import { cancelSubscriptionAction } from "@/actions/subscription.actions";
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
import { Loader2, XCircle } from "lucide-react";
import { trackLoading } from "@/components/ui/loading-bar";

type SubscriptionActionsProps = {
  currentPlan: SubscriptionPlan;
  isCanceled: boolean;
  subscriptionId: string;
  hasStripeId?: boolean;
};

export function SubscriptionActions({
  currentPlan,
  isCanceled,
}: SubscriptionActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    setIsPending(true);
    try {
      const result = await trackLoading(() => cancelSubscriptionAction());
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error?.message ?? "Could not cancel billing. Please contact support.");
      }
    } catch {
      setError("Could not cancel billing. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold">{currentPlan.replace(/_/g, " ")}</p>
          <p className="text-sm text-muted-foreground">Legacy billing record</p>
        </div>
        <Badge variant="secondary">{isCanceled ? "Cancellation scheduled" : "Active"}</Badge>
      </div>
      {!isCanceled && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <XCircle className="mr-2 size-4" />}
                Cancel recurring billing
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel recurring billing?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current paid period remains active through its end date. No new renewals will be scheduled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep current billing</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel}>Confirm cancellation</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
