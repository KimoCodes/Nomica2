"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useCallback } from "react";
import {
  addDayAction,
  addExerciseToDayAction,
  addWeekAction,
  deleteDayAction,
  deleteWeekAction,
  removeExerciseFromDayAction,
  updateDayAction,
  updateProgramExerciseAction,
  updateWeekAction,
} from "@/actions/program.actions";
import { DIFFICULTY_LABELS, MUSCLE_GROUP_LABELS } from "@/constants/exercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { trackLoading } from "@/components/ui/loading-bar";
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

type ExerciseOption = {
  id: string;
  name: string;
  muscleGroup: keyof typeof MUSCLE_GROUP_LABELS;
};

type ProgramExercise = {
  id: string;
  order: number;
  sets: number | null;
  reps: number | null;
  duration: number | null;
  restSeconds: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    muscleGroup: keyof typeof MUSCLE_GROUP_LABELS;
    difficulty: keyof typeof DIFFICULTY_LABELS;
  };
};

type ProgramDay = {
  id: string;
  dayNumber: number;
  title: string | null;
  exercises: ProgramExercise[];
};

type ProgramWeek = {
  id: string;
  weekNumber: number;
  title: string | null;
  days: ProgramDay[];
};

type ProgramBuilderProps = {
  programId: string;
  weeks: ProgramWeek[];
  exercises: ExerciseOption[];
};

export function ProgramBuilder({
  programId,
  weeks,
  exercises,
}: ProgramBuilderProps) {
  const router = useRouter();
  const [isPending] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteWeekDialog, setDeleteWeekDialog] = useState<{ open: boolean; weekId: string; label: string }>({ open: false, weekId: "", label: "" });
  const [deleteDayDialog, setDeleteDayDialog] = useState<{ open: boolean; dayId: string; label: string }>({ open: false, dayId: "", label: "" });

  async function refreshFromResult(
    result: { success: boolean; error?: { message: string } },
    fallback: string,
  ) {
    if (!result.success) {
      setError(result.error?.message ?? fallback);
      return;
    }

    setError(null);
    router.refresh();
  }

  async function handleAddWeek(formData: FormData) {
    await refreshFromResult(
      await trackLoading(() => addWeekAction(programId, formData)),
      "Failed to add week",
    );
  }

  async function handleAddDay(weekId: string, formData: FormData) {
    await refreshFromResult(
      await trackLoading(() => addDayAction(weekId, programId, formData)),
      "Failed to add day",
    );
  }

  async function handleUpdateWeek(weekId: string, formData: FormData) {
    await refreshFromResult(
      await trackLoading(() => updateWeekAction(weekId, programId, formData)),
      "Failed to update week",
    );
  }

  async function handleDeleteWeek(weekId: string, label: string) {
    setDeleteWeekDialog({ open: true, weekId, label });
  }

  async function confirmDeleteWeek() {
    await refreshFromResult(
      await trackLoading(() => deleteWeekAction(deleteWeekDialog.weekId, programId)),
      "Failed to delete week",
    );
    setDeleteWeekDialog({ open: false, weekId: "", label: "" });
  }

  async function handleUpdateDay(dayId: string, formData: FormData) {
    await refreshFromResult(
      await trackLoading(() => updateDayAction(dayId, programId, formData)),
      "Failed to update day",
    );
  }

  async function handleDeleteDay(dayId: string, label: string) {
    setDeleteDayDialog({ open: true, dayId, label });
  }

  async function confirmDeleteDay() {
    await refreshFromResult(
      await trackLoading(() => deleteDayAction(deleteDayDialog.dayId, programId)),
      "Failed to delete day",
    );
    setDeleteDayDialog({ open: false, dayId: "", label: "" });
  }

  async function handleAddExercise(dayId: string, formData: FormData) {
    await refreshFromResult(
      await trackLoading(() => addExerciseToDayAction(dayId, programId, formData)),
      "Failed to add exercise",
    );
  }

  async function handleUpdateExercise(
    programExerciseId: string,
    formData: FormData,
  ) {
    await refreshFromResult(
      await trackLoading(() => updateProgramExerciseAction(programExerciseId, programId, formData)),
      "Failed to update exercise",
    );
  }

  async function handleRemoveExercise(programExerciseId: string) {
    await refreshFromResult(
      await trackLoading(() => removeExerciseFromDayAction(programExerciseId, programId)),
      "Failed to remove exercise",
    );
  }

  return (
    <div className="space-y-6">
      {isPending && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary animate-fade-in" role="status" aria-label="Updating program">
          <Spinner size="xs" />
          <span>Updating program...</span>
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form
        action={handleAddWeek}
        className="flex max-w-xl flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1">
          <Label htmlFor="new-week-title">Week title</Label>
          <Input
            id="new-week-title"
            name="title"
            placeholder="Foundation phase"
          />
        </div>
        <Button type="submit" disabled={isPending}>Add week</Button>
      </form>

      {weeks.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add your first week to start building this program.
        </p>
      )}

      {weeks.map((week) => (
        <Card key={week.id}>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>
                  Week {week.weekNumber}
                  {week.title ? `: ${week.title}` : ""}
                </CardTitle>
                <CardDescription>
                  {week.days.length} training day{week.days.length === 1 ? "" : "s"}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() =>
                  handleDeleteWeek(week.id, `Week ${week.weekNumber}`)
                }
              >
                Delete week
              </Button>
            </div>
            <form
              action={(fd) => handleUpdateWeek(week.id, fd)}
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
            >
              <div className="flex-1 space-y-1">
                <Label htmlFor={`week-title-${week.id}`}>Week title</Label>
                <Input
                  id={`week-title-${week.id}`}
                  name="title"
                  defaultValue={week.title ?? ""}
                  placeholder={`Week ${week.weekNumber}`}
                />
              </div>
              <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                Save week
              </Button>
            </form>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={(fd) => handleAddDay(week.id, fd)}
              className="flex max-w-xl flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1 space-y-1">
                <Label htmlFor={`new-day-title-${week.id}`}>Day title</Label>
                <Input
                  id={`new-day-title-${week.id}`}
                  name="title"
                  placeholder="Lower body strength"
                />
              </div>
              <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                Add day
              </Button>
            </form>

            {week.days.map((day) => (
              <div key={day.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-medium">
                      Day {day.dayNumber}
                      {day.title ? `: ${day.title}` : ""}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {day.exercises.length} exercise
                      {day.exercises.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteDay(day.id, `Day ${day.dayNumber}`)
                    }
                  >
                    Delete day
                  </Button>
                </div>

                <form
                  action={(fd) => handleUpdateDay(day.id, fd)}
                  className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
                >
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`day-title-${day.id}`}>Day title</Label>
                    <Input
                      id={`day-title-${day.id}`}
                      name="title"
                      defaultValue={day.title ?? ""}
                      placeholder={`Day ${day.dayNumber}`}
                    />
                  </div>
                  <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                    Save day
                  </Button>
                </form>

                <div className="mt-3 space-y-2">
                  {day.exercises.map((item) => (
                    <form
                      key={item.id}
                      action={(fd) => handleUpdateExercise(item.id, fd)}
                      className="grid gap-3 rounded-md bg-muted/50 px-3 py-3 lg:grid-cols-[minmax(180px,1fr)_90px_90px_100px_minmax(180px,1fr)_auto]"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{item.exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {MUSCLE_GROUP_LABELS[item.exercise.muscleGroup]} ·{" "}
                          {DIFFICULTY_LABELS[item.exercise.difficulty]}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`sets-${item.id}`}>Sets</Label>
                        <Input
                          id={`sets-${item.id}`}
                          name="sets"
                          type="number"
                          min={1}
                          defaultValue={item.sets ?? ""}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`reps-${item.id}`}>Reps</Label>
                        <Input
                          id={`reps-${item.id}`}
                          name="reps"
                          type="number"
                          min={1}
                          defaultValue={item.reps ?? ""}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`rest-${item.id}`}>Rest</Label>
                        <Input
                          id={`rest-${item.id}`}
                          name="restSeconds"
                          type="number"
                          min={0}
                          defaultValue={item.restSeconds ?? ""}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                        <Input
                          id={`notes-${item.id}`}
                          name="notes"
                          defaultValue={item.notes ?? ""}
                          placeholder="Tempo, cues, load"
                        />
                      </div>
                      <div className="flex flex-wrap items-end gap-2">
                        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExercise(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </form>
                  ))}
                </div>

                <AddExerciseForm
                  dayId={day.id}
                  exercises={exercises}
                  isPending={isPending}
                  onAdd={handleAddExercise}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {exercises.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add exercises to your library before building program days.
        </p>
      )}

      <AlertDialog open={deleteWeekDialog.open} onOpenChange={(open) => setDeleteWeekDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete week</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteWeekDialog.label} and all of its days? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWeek}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDayDialog.open} onOpenChange={(open) => setDeleteDayDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete day</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDayDialog.label} and all of its exercises? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDay}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
};

function AddExerciseForm({
  dayId,
  exercises,
  isPending,
  onAdd,
}: {
  dayId: string;
  exercises: Exercise[];
  isPending: boolean;
  onAdd: (dayId: string, formData: FormData) => void;
}) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(
    (fd: FormData) => {
      onAdd(dayId, fd);
      formRef.current?.reset();
      if (hiddenInputRef.current) hiddenInputRef.current.value = "";
    },
    [dayId, onAdd],
  );

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
    >
      <div className="space-y-1 sm:col-span-2">
        <Label htmlFor={`exercise-${dayId}`}>Exercise</Label>
        <input type="hidden" name="exerciseId" ref={hiddenInputRef} />
        <Select
          onValueChange={(value: string | null) => {
            if (hiddenInputRef.current && value) hiddenInputRef.current.value = value;
          }}
        >
          <SelectTrigger id={`exercise-${dayId}`}>
            <SelectValue placeholder="Select exercise" />
          </SelectTrigger>
          <SelectContent>
            {exercises.map((exercise) => (
              <SelectItem key={exercise.id} value={exercise.id}>
                {exercise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`sets-${dayId}`}>Sets</Label>
        <Input id={`sets-${dayId}`} name="sets" type="number" min={1} placeholder="3" />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`reps-${dayId}`}>Reps</Label>
        <Input id={`reps-${dayId}`} name="reps" type="number" min={1} placeholder="10" />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`rest-${dayId}`}>Rest (s)</Label>
        <Input id={`rest-${dayId}`} name="restSeconds" type="number" min={0} placeholder="60" />
      </div>
      <div className="space-y-1 sm:col-span-2 lg:col-span-5">
        <Label htmlFor={`notes-${dayId}`}>Notes</Label>
        <Textarea
          id={`notes-${dayId}`}
          name="notes"
          rows={2}
          placeholder="Tempo, load guidance, substitutions..."
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" size="sm" className="w-full" disabled={isPending}>
          Add
        </Button>
      </div>
    </form>
  );
}
