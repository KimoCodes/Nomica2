"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeWorkout } from "@/actions/workout.actions";
import type { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, PartyPopper } from "lucide-react";
import { toast } from "sonner";

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
  const [personalRecords, setPersonalRecords] = useState<
    { exerciseName: string; detail: string }[] | null
  >(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const result: ApiResponse<{
      message: string;
      personalRecords?: { exerciseName: string; detail: string }[];
    }> = await trackLoading(() =>
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

    if (result.data?.personalRecords && result.data.personalRecords.length > 0) {
      setPersonalRecords(result.data.personalRecords);
    } else {
      toast.success("Workout completed!");
    }

    router.refresh();
    setIsPending(false);
  }

  if (personalRecords) {
    return (
      <div className="space-y-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6 text-center" role="alert" aria-live="assertive">
        <div className="flex justify-center">
          <div className="rounded-full bg-yellow-500/10 p-3">
            <Trophy className="size-8 text-yellow-500" aria-hidden="true" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold">New Personal Record!</h3>
          <p className="text-sm text-muted-foreground">
            Amazing work — you just hit a new PR!
          </p>
        </div>
        <div className="space-y-2">
          {personalRecords.map((pr, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm"
            >
              <PartyPopper className="size-4 text-yellow-500" aria-hidden="true" />
              <span className="font-medium">{pr.exerciseName}</span>
              <span className="text-muted-foreground">— {pr.detail}</span>
            </div>
          ))}
        </div>
        <Button onClick={() => setPersonalRecords(null)} variant="outline" autoFocus>
          Continue
        </Button>
      </div>
    );
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
