"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { grantFreeTrialAction, cancelFreeTrialAction } from "@/actions/free-trial.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Gift, Loader2, XCircle } from "lucide-react";
import { trackLoading } from "@/components/ui/loading-bar";

const PRESET_DURATIONS = [3, 7, 14, 30];

type GrantTrialDialogProps = {
  targetUserId: string;
  targetUserName: string;
  hasActiveTrial?: boolean;
  activeTrialId?: string;
};

export function GrantTrialDialog({
  targetUserId,
  targetUserName,
  hasActiveTrial = false,
  activeTrialId,
}: GrantTrialDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [customDuration, setCustomDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const effectiveDuration = customDuration ? parseInt(customDuration, 10) : durationDays;

  async function handleGrant() {
    if (!customDuration && (effectiveDuration < 1 || effectiveDuration > 90)) {
      setError("Duration must be between 1 and 90 days");
      return;
    }
    if (customDuration && (isNaN(effectiveDuration) || effectiveDuration < 1 || effectiveDuration > 90)) {
      setError("Please enter a valid number between 1 and 90");
      return;
    }

    setError(null);
    setIsPending(true);

    const result = await trackLoading(() =>
      grantFreeTrialAction(
        targetUserId,
        effectiveDuration,
        startDate || undefined,
        reason || undefined,
      ),
    );

    if (result.success) {
      setOpen(false);
      setDurationDays(7);
      setCustomDuration("");
      setStartDate("");
      setReason("");
      router.refresh();
    } else {
      setError(result.error?.message ?? "Failed to grant free trial");
    }

    setIsPending(false);
  }

  async function handleCancel() {
    if (!activeTrialId) return;
    setIsPending(true);

    const result = await trackLoading(() => cancelFreeTrialAction(activeTrialId));

    if (result.success) {
      router.refresh();
    }

    setIsPending(false);
  }

  if (hasActiveTrial && activeTrialId) {
    return (
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button size="sm" variant="destructive" className="h-8 text-xs">
              <XCircle className="mr-1 size-3" />
              Cancel Trial
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel free trial?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately cancel {targetUserName}&apos;s free trial.
              They will lose access to premium features unless they have an active
              paid subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep trial</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : (
                <XCircle className="mr-1 size-3" />
              )}
              Cancel trial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Gift className="mr-1 size-3" />
            Grant Trial
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grant Free Trial</DialogTitle>
          <DialogDescription>
            Give {targetUserName} free access to all premium features for a
            limited time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Trial Duration (days)</Label>
            <div className="flex gap-2">
              {PRESET_DURATIONS.map((days) => (
                <Button
                  key={days}
                  size="sm"
                  variant={durationDays === days && !customDuration ? "default" : "outline"}
                  onClick={() => {
                    setDurationDays(days);
                    setCustomDuration("");
                  }}
                  className="flex-1"
                >
                  {days}d
                </Button>
              ))}
            </div>
            <Input
              type="number"
              min={1}
              max={90}
              placeholder="Custom (1-90 days)"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date (optional)</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              Defaults to immediately if not specified.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Onboarding bonus, promotional offer..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleGrant} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : (
              <Gift className="mr-1 size-3" />
            )}
            Grant {effectiveDuration}-day trial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
