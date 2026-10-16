"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import { coachRevokeSubscriptionAction } from "@/actions/subscription.actions";
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
import { Ban, Loader2 } from "lucide-react";
import { trackLoading } from "@/components/ui/loading-bar";

type Props = {
  targetUserId: string;
  currentPlan: SubscriptionPlan;
  status: string;
};

export function CoachSubscriptionActions(
  { targetUserId, currentPlan, status }: Props,
) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRevoke() {
    setPending(true);
    const result = await trackLoading(() =>
      coachRevokeSubscriptionAction(targetUserId)
    );
    if (result.success) router.refresh();
    setPending(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {currentPlan.replaceAll("_", " ")} · legacy
      </span>
      <Badge variant="outline" className="capitalize">
        {status.replaceAll("_", " ")}
      </Badge>
      {status !== "canceled" && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="sm" variant="destructive" disabled={pending}>
                <Ban className="mr-1 size-3" />Revoke legacy access
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Revoke legacy subscription access?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This ends subscription-based access immediately. Purchased
                program entitlements are managed separately and are not changed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep access</AlertDialogCancel>
              <AlertDialogAction onClick={handleRevoke}>
                Confirm revocation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {pending && (
        <Loader2 className="size-4 animate-spin" aria-label="Saving" />
      )}
      <span className="text-xs text-muted-foreground">
        Plan changes and new approvals are disabled.
      </span>
    </div>
  );
}
