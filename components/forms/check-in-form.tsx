"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitCheckInAction } from "@/actions/checkin.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Dumbbell, Battery, Moon, Weight } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";

type CheckInFormProps = {
  alreadySubmitted?: boolean;
};

export function CheckInForm({ alreadySubmitted }: CheckInFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const result = await trackLoading(() => submitCheckInAction(formData));

    if (!result.success) {
      setError(result.error?.message ?? "Failed to submit check-in");
      setIsPending(false);
      return;
    }

    setIsPending(false);
    router.refresh();
  }

  if (alreadySubmitted) {
    return null;
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="workoutsCompleted" className="text-sm font-medium">
            Workouts completed
          </Label>
          <div className="relative">
            <Dumbbell className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="workoutsCompleted"
              name="workoutsCompleted"
              type="number"
              min={0}
              max={14}
              placeholder="4"
              className="h-11 pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="energyLevel" className="text-sm font-medium">
            Energy level (1-10)
          </Label>
          <div className="relative">
            <Battery className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="energyLevel"
              name="energyLevel"
              type="number"
              min={1}
              max={10}
              placeholder="7"
              className="h-11 pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sleepQuality" className="text-sm font-medium">
            Sleep quality (1-10)
          </Label>
          <div className="relative">
            <Moon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="sleepQuality"
              name="sleepQuality"
              type="number"
              min={1}
              max={10}
              placeholder="8"
              className="h-11 pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentWeight" className="text-sm font-medium">
            Current weight (kg)
          </Label>
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="currentWeight"
              name="currentWeight"
              type="number"
              step="0.1"
              min={30}
              max={300}
              placeholder="72.5"
              className="h-11 pl-10"
            />
          </div>
        </div>
      </div>

      <LoadingButton type="submit" loading={isPending} loadingText="Submitting..." className="w-full group">
        Submit check-in
        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
      </LoadingButton>
    </form>
  );
}
