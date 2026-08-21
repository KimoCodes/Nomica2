"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeWorkout } from "@/actions/workout.actions";
import type { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";
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

    const result: ApiResponse<{ message: string }> = await trackLoading(() =>
      completeWorkout({
        programDayId,
        notes: (formData.get("notes") as string) || undefined,
      }),
    );

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
        <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
        <LoadingButton type="submit" loading={isPending} loadingText="Saving...">
          Mark workout complete
        </LoadingButton>
        {!showNotes && (
          <Button type="button" variant="outline" onClick={() => setShowNotes(true)}>
            Add notes
          </Button>
        )}
      </div>
    </form>
  );
}
