"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deactivateAssignmentAction } from "@/actions/assignment.actions";
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
import { toast } from "sonner";

type DeactivateAssignmentButtonProps = {
  assignmentId: string;
  programTitle: string;
};

export function DeactivateAssignmentButton({
  assignmentId,
  programTitle,
}: DeactivateAssignmentButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleDeactivate() {
    const formData = new FormData();
    formData.set("clientProgramId", assignmentId);
    setIsPending(true);
    setError(null);

    const result = await deactivateAssignmentAction(formData);

    if (!result.success) {
      setError(result.error?.message ?? "Failed to deactivate assignment");
      setIsPending(false);
      return;
    }

    toast.success("Program deactivated", {
      description: "The program has been deactivated for this client.",
    });
    setIsPending(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <AlertDialog>
        <AlertDialogTrigger render={<Button type="button" variant="outline" size="sm" disabled={isPending} />}>
          {isPending ? "Deactivating..." : "Deactivate"}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate &quot;{programTitle}&quot; for this client? They will lose access to this program&apos;s workouts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
