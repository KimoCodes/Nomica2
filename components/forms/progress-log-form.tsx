"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProgressLogAction } from "@/actions/progress.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Weight, Percent, Ruler, ArrowRight, Loader2 } from "lucide-react";

export function ProgressLogForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const result = await createProgressLogAction(formData);

    if (!result.success) {
      setError(result.error?.message ?? "Failed to save progress log");
      setIsPending(false);
      return;
    }

    setIsPending(false);
    router.refresh();
    (document.getElementById("progress-log-form") as HTMLFormElement)?.reset();
  }

  return (
    <form id="progress-log-form" action={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-sm font-medium">
            Weight (kg)
          </Label>
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              min="1"
              placeholder="72.5"
              className="h-11 pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bodyFat" className="text-sm font-medium">
            Body fat (%)
          </Label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="bodyFat"
              name="bodyFat"
              type="number"
              step="0.1"
              min="1"
              max="100"
              placeholder="18.5"
              className="h-11 pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="waist" className="text-sm font-medium">
            Waist (cm)
          </Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="waist"
              name="waist"
              type="number"
              step="0.1"
              min="1"
              placeholder="80"
              className="h-11 pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chest" className="text-sm font-medium">
            Chest (cm)
          </Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="chest"
              name="chest"
              type="number"
              step="0.1"
              min="1"
              placeholder="100"
              className="h-11 pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hips" className="text-sm font-medium">
            Hips (cm)
          </Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="hips"
              name="hips"
              type="number"
              step="0.1"
              min="1"
              placeholder="95"
              className="h-11 pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Energy, measurements context, wins, or blockers..."
          className="resize-none"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full group">
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Save progress log
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}
