"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { respondToCheckInAction } from "@/actions/checkin.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";

type CheckInResponseFormProps = {
  checkInId: string;
};

export function CheckInResponseForm({ checkInId }: CheckInResponseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const feedback = formData.get("feedback") as string;
    if (!feedback.trim()) {
      setError("Please enter feedback");
      setIsPending(false);
      return;
    }

    const result = await respondToCheckInAction(checkInId, feedback);

    if (!result.success) {
      setError(result.error?.message ?? "Failed to send response");
      setIsPending(false);
      return;
    }

    setIsPending(false);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`feedback-${checkInId}`} className="text-sm font-medium">
          Feedback
        </Label>
        <Textarea
          id={`feedback-${checkInId}`}
          name="feedback"
          rows={3}
          placeholder="Great progress this week! Keep up the consistency..."
          className="resize-none"
        />
      </div>

      <Button type="submit" disabled={isPending} className="group">
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send feedback
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}
