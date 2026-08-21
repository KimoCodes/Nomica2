"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExerciseAction } from "@/actions/exercise.actions";
import {
  DIFFICULTY_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
} from "@/constants/exercises";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function CreateExerciseForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const result = await trackLoading(() => createExerciseAction(formData));

    if (!result.success) {
      setError(result.error?.message ?? "Failed to create exercise");
      setIsPending(false);
      return;
    }

    toast.success("Exercise created", {
      description: "Your new exercise has been added to the library.",
    });
    router.refresh();
    setIsPending(false);
    (document.getElementById("create-exercise-form") as HTMLFormElement)?.reset();
  }

  return (
    <form id="create-exercise-form" action={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Barbell bench press" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="muscleGroup">Muscle group</Label>
          <input type="hidden" name="muscleGroup" id="muscleGroup-hidden" />
          <Select onValueChange={(value: string | null) => {
            const hiddenInput = document.getElementById("muscleGroup-hidden") as HTMLInputElement;
            if (hiddenInput && value) hiddenInput.value = value;
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select muscle group" />
            </SelectTrigger>
            <SelectContent>
              {MUSCLE_GROUP_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <input type="hidden" name="difficulty" id="difficulty-hidden" />
          <Select onValueChange={(value: string | null) => {
            const hiddenInput = document.getElementById("difficulty-hidden") as HTMLInputElement;
            if (hiddenInput && value) hiddenInput.value = value;
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="videoUrl">Video URL (optional)</Label>
          <Input id="videoUrl" name="videoUrl" type="url" placeholder="https://..." />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            name="instructions"
            required
            rows={4}
            placeholder="Setup, execution, and coaching cues..."
          />
        </div>
      </div>
      <LoadingButton type="submit" loading={isPending} loadingText="Adding...">
        Add exercise
      </LoadingButton>
    </form>
  );
}
