"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminApprovePaymentAction,
  adminRejectPaymentAction,
  adminRequestProofAction,
  coachApprovePaymentAction,
  coachRejectPaymentAction,
  coachRequestProofAction,
} from "@/actions/payment-request.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle2,
  XCircle,
  FileImage,
  Loader2,
} from "lucide-react";
import { trackLoading } from "@/components/ui/loading-bar";

type PaymentRequest = {
  id: string;
  status: string;
  clientUser: { name: string | null; email: string };
};

type Props = {
  paymentRequest: PaymentRequest;
  role: "ADMIN" | "COACH";
};

export function PaymentReviewActions({ paymentRequest, role }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);

  const isReviewable = paymentRequest.status === "PENDING" || paymentRequest.status === "PROOF_REQUESTED";

  const approveAction = role === "ADMIN" ? adminApprovePaymentAction : coachApprovePaymentAction;
  const rejectAction = role === "ADMIN" ? adminRejectPaymentAction : coachRejectPaymentAction;
  const requestProofAction = role === "ADMIN" ? adminRequestProofAction : coachRequestProofAction;

  async function handleApprove() {
    setIsPending(true);
    try {
      const result = await trackLoading(() =>
        approveAction(paymentRequest.id, "Payment approved"),
      );
      if (result.success) {
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleReject() {
    if (!rejectNote.trim()) return;
    setIsPending(true);
    try {
      const result = await trackLoading(() =>
        rejectAction(paymentRequest.id, rejectNote),
      );
      if (result.success) {
        setShowRejectDialog(false);
        setRejectNote("");
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleRequestProof() {
    if (!proofNote.trim()) return;
    setIsPending(true);
    try {
      const result = await trackLoading(() =>
        requestProofAction(paymentRequest.id, proofNote),
      );
      if (result.success) {
        setShowProofDialog(false);
        setProofNote("");
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  }

  if (!isReviewable) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button size="sm" variant="default" className="h-8 text-xs" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1 size-3" />
              )}
              Approve
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will activate the subscription for {paymentRequest.clientUser.name ?? "this client"}.
              The client will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              Confirm approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogTrigger
          render={
            <Button size="sm" variant="destructive" className="h-8 text-xs" disabled={isPending}>
              <XCircle className="mr-1 size-3" />
              Reject
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this payment?</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejection. The client will be notified and can resubmit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2">
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              aria-label="Rejection reason"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectNote("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={!rejectNote.trim()}>
              Confirm rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <AlertDialogTrigger
          render={
            <Button size="sm" variant="outline" className="h-8 text-xs" disabled={isPending}>
              <FileImage className="mr-1 size-3" />
              Request Proof
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request updated proof?</AlertDialogTitle>
            <AlertDialogDescription>
              Ask the client to upload a clearer or more complete payment proof.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2">
            <Textarea
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="What needs to be updated..."
              rows={3}
              aria-label="Message to client"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProofNote("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRequestProof} disabled={!proofNote.trim()}>
              Send request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
