"use client";

import type { Difficulty, MuscleGroup } from "@prisma/client";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  deleteExerciseAction,
  updateExerciseAction,
} from "@/actions/exercise.actions";
import {
  DIFFICULTY_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
} from "@/constants/exercises";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type ExerciseRowActionsProps = {
  exercise: {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    difficulty: Difficulty;
    instructions: string;
    videoUrl: string | null;
  };
};

export function ExerciseRowActions({ exercise }: ExerciseRowActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleUpdate(formData: FormData) {
    setIsSaving(true);
    setError(null);

    const result = await updateExerciseAction(exercise.id, formData);

    if (!result.success) {
      setError(result.error?.message ?? "Failed to update exercise");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await deleteExerciseAction(exercise.id);

    if (!result.success) {
      setError(result.error?.message ?? "Failed to delete exercise");
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setOpen(true);
      return;
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
        >
          <PencilIcon />
          Edit
        </Button>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit exercise</DialogTitle>
            <DialogDescription>
              Update the custom movement coaches can add to programs.
            </DialogDescription>
          </DialogHeader>

          <form action={handleUpdate} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`name-${exercise.id}`}>Name</Label>
                <Input
                  id={`name-${exercise.id}`}
                  name="name"
                  required
                  defaultValue={exercise.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`muscleGroup-${exercise.id}`}>
                  Muscle group
                </Label>
                <input type="hidden" name="muscleGroup" id={`muscleGroup-hidden-${exercise.id}`} defaultValue={exercise.muscleGroup ?? ""} />
                <Select defaultValue={exercise.muscleGroup ?? ""} onValueChange={(value: string | null) => {
                  const hiddenInput = document.getElementById(`muscleGroup-hidden-${exercise.id}`) as HTMLInputElement;
                  if (hiddenInput && value) hiddenInput.value = value;
                }}>
                  <SelectTrigger id={`muscleGroup-${exercise.id}`}>
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
                <Label htmlFor={`difficulty-${exercise.id}`}>
                  Difficulty
                </Label>
                <input type="hidden" name="difficulty" id={`difficulty-hidden-${exercise.id}`} defaultValue={exercise.difficulty ?? ""} />
                <Select defaultValue={exercise.difficulty ?? ""} onValueChange={(value: string | null) => {
                  const hiddenInput = document.getElementById(`difficulty-hidden-${exercise.id}`) as HTMLInputElement;
                  if (hiddenInput && value) hiddenInput.value = value;
                }}>
                  <SelectTrigger id={`difficulty-${exercise.id}`}>
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
                <Label htmlFor={`videoUrl-${exercise.id}`}>
                  Video URL (optional)
                </Label>
                <Input
                  id={`videoUrl-${exercise.id}`}
                  name="videoUrl"
                  type="url"
                  defaultValue={exercise.videoUrl ?? ""}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`instructions-${exercise.id}`}>
                  Instructions
                </Label>
                <Textarea
                  id={`instructions-${exercise.id}`}
                  name="instructions"
                  required
                  rows={5}
                  defaultValue={exercise.instructions}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isDeleting}
        onClick={handleDelete}
      >
        <Trash2Icon />
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{exercise.name}&quot; from your exercise library? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
