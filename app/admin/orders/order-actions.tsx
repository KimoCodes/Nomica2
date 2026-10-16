"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markOrderRefundedAction } from "@/actions/order-admin.actions";
import { trackLoading } from "@/components/ui/loading-bar";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";

export function RefundOrderButton({
  orderId,
  disabled,
}: {
  orderId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRefund() {
    setLoading(true);
    const result = await trackLoading(() =>
      markOrderRefundedAction(orderId, "Marked refunded by admin"),
    );
    if (result.success) {
      toast.success("Order refunded and access revoked");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error?.message ?? "Failed to refund order");
    }
    setLoading(false);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? "Only paid orders can be refunded" : "Mark as refunded"}
      >
        <Undo2 className="size-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark order as refunded?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the full order as refunded and immediately revokes
              every entitlement it granted. This cannot be undone here — grant
              access again from Entitlements if this was a mistake.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Refunding..." : "Refund and revoke access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
