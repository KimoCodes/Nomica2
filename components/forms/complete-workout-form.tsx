"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeWorkoutAction } from "@/actions/workout.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CompleteWorkoutFormProps = {
  programDayId: string;
  disabled?: boolean;
};

export function CompleteWorkoutForm({
  programDayId,
  disabled,
}: CompleteWorkoutFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    formData.set("programDayId", programDayId);

    const result = await completeWorkoutAction(formData);

    if (!result.success) {
      setError(result.error?.message ?? "Failed to complete workout");
      setIsPending(false);
      return;
    }

    router.refresh();
    setIsPending(false);
  }

  if (disabled) {
    return (
      <Button disabled className="w-full sm:w-auto">
        Completed today
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {showNotes && (
        <Textarea
          name="notes"
          rows={2}
          placeholder="Optional notes about this session..."
        />
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Mark workout complete"}
        </Button>
        {!showNotes && (
          <Button type="button" variant="outline" onClick={() => setShowNotes(true)}>
            Add notes
          </Button>
        )}
      </div>
    </form>
  );
}
