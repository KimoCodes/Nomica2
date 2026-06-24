"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveCoachAction, revokeCoachAction } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type CoachActionsProps = {
  coachProfileId: string;
  isApproved: boolean;
};

export function CoachActions({ coachProfileId, isApproved }: CoachActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleToggle() {
    setIsPending(true);
    const result = isApproved
      ? await revokeCoachAction(coachProfileId)
      : await approveCoachAction(coachProfileId);

    if (result.success) {
      router.refresh();
    }
    setIsPending(false);
  }

  return (
    <Button
      variant={isApproved ? "destructive" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="group"
    >
      {isPending ? (
        <Loader2 className="mr-1 size-3 animate-spin" />
      ) : isApproved ? (
        <XCircle className="mr-1 size-3" />
      ) : (
        <CheckCircle2 className="mr-1 size-3" />
      )}
      {isApproved ? "Revoke" : "Approve"}
    </Button>
  );
}
