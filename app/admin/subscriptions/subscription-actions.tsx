"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import {
  adminCancelSubscriptionAction,
  adminRevokeSubscriptionAction,
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
import { Ban, Loader2, XCircle } from "lucide-react";
import { trackLoading } from "@/components/ui/loading-bar";

type Props = {
  subscriptionId: string;
  userId: string;
  currentPlan: SubscriptionPlan;
  status: string;
};

export function AdminSubscriptionActions(
  { subscriptionId, userId, currentPlan, status }: Props,
) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isCanceled = status === "canceled";

  async function run(action: () => Promise<{ success: boolean }>) {
    setPending(true);
    const result = await trackLoading(action);
    if (result.success) router.refresh();
    setPending(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="mr-1 text-xs text-muted-foreground">
        {currentPlan.replaceAll("_", " ")} · legacy
      </div>
      <Badge variant="outline" className="capitalize">
        {status.replaceAll("_", " ")}
      </Badge>
      {!isCanceled && (
        <>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="sm" variant="outline" disabled={pending}>
                  <XCircle className="mr-1 size-3" />Cancel renewal
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel recurring billing?</AlertDialogTitle>
                <AlertDialogDescription>
                  The current paid period remains active through its end date.
                  No new renewal will be scheduled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep current billing</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    run(() => adminCancelSubscriptionAction(subscriptionId))}
                >
                  Confirm cancellation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="sm" variant="destructive" disabled={pending}>
                  <Ban className="mr-1 size-3" />Revoke access
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Revoke legacy subscription access?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This ends subscription-based legacy access immediately.
                  Purchased program entitlements are managed separately and are
                  not changed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep access</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    run(() => adminRevokeSubscriptionAction(userId))}
                >
                  Confirm revocation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      {pending && (
        <Loader2 className="size-4 animate-spin" aria-label="Saving" />
      )}
      {isCanceled && (
        <span className="text-xs text-muted-foreground">
          New recurring plans are disabled.
        </span>
      )}
    </div>
  );
}
