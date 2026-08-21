"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeWorkout } from "@/actions/workout.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/ui/loading-button";
import { CheckCircle2, Dumbbell, Clock, Play } from "lucide-react";

type Exercise = {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  difficulty: string;
  videoUrl: string | null;
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string | null;
  order: number;
};

type SetLog = {
  programExerciseId: string;
  setNumber: number;
  actualReps: number | null | undefined;
  actualWeight: number | null | undefined;
  completed: boolean;
};

type Props = {
  programDayId: string;
  clientProgramId: string;
  exercises: Exercise[];
  isCompleted: boolean;
  existingSetLogs: SetLog[];
  existingNotes: string;
};

export function WorkoutTracker({
  programDayId,
  clientProgramId,
  exercises,
  isCompleted,
  existingSetLogs,
  existingNotes,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(existingNotes);
  const [setData, setSetData] = useState<Record<string, SetLog[]>>(() => {
    const initial: Record<string, SetLog[]> = {};
    for (const ex of exercises) {
      initial[ex.id] = [];
      for (let s = 1; s <= ex.sets; s++) {
        const existing = existingSetLogs.find(
          (sl) => sl.programExerciseId === ex.id && sl.setNumber === s,
        );
        initial[ex.id].push({
          programExerciseId: ex.id,
          setNumber: s,
          actualReps: existing?.actualReps ?? ex.reps,
          actualWeight: existing?.actualWeight ?? null,
          completed: existing?.completed ?? false,
        });
      }
    }
    return initial;
  });

  function updateSet(
    exerciseId: string,
    setNumber: number,
    field: "actualReps" | "actualWeight" | "completed",
    value: number | boolean,
  ) {
    setSetData((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] ?? []).map((s) =>
        s.setNumber === setNumber ? { ...s, [field]: value } : s,
      ),
    }));
  }

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = Object.values(setData).flat().filter((s) => s.completed).length;

  async function handleSubmit() {
    const allSetLogs = Object.values(setData).flat().map((s) => ({
      programExerciseId: s.programExerciseId,
      setNumber: s.setNumber,
      actualReps: s.actualReps ?? undefined,
      actualWeight: s.actualWeight ?? undefined,
      completed: s.completed,
    }));

    startTransition(async () => {
      const result = await completeWorkout({
        programDayId,
        notes: notes || undefined,
        setLogs: allSetLogs,
      });

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Dumbbell className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {exercises.length} exercises &middot; {totalSets} sets
            </p>
            <p className="text-sm text-muted-foreground">
              {completedSets}/{totalSets} sets completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {exercises.map((ex) => (
        <Card key={ex.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{ex.name}</CardTitle>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {ex.muscleGroup}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {ex.difficulty}
                  </Badge>
                  {ex.restSeconds > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {ex.restSeconds}s rest
                    </span>
                  )}
                </div>
              </div>
              {ex.videoUrl && (
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border/50 p-2 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Play className="size-4" />
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground">
              <span className="w-12">Set</span>
              <span>Reps</span>
              <span>Weight (kg)</span>
              <span className="w-10 text-center">Done</span>
            </div>
            {(setData[ex.id] ?? []).map((set) => (
              <div
                key={set.setNumber}
                className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2"
              >
                <span className="w-12 text-sm font-medium">
                  {set.setNumber}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={set.actualReps ?? ""}
                  onChange={(e) =>
                    updateSet(
                      ex.id,
                      set.setNumber,
                      "actualReps",
                      e.target.value ? parseInt(e.target.value) : 0,
                    )
                  }
                  disabled={isCompleted}
                  className="h-9"
                  placeholder={String(ex.reps)}
                />
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={set.actualWeight ?? ""}
                  onChange={(e) =>
                    updateSet(
                      ex.id,
                      set.setNumber,
                      "actualWeight",
                      e.target.value ? parseFloat(e.target.value) : 0,
                    )
                  }
                  disabled={isCompleted}
                  className="h-9"
                  placeholder="--"
                />
                <Checkbox
                  checked={set.completed}
                  onCheckedChange={(checked) =>
                    updateSet(ex.id, set.setNumber, "completed", !!checked)
                  }
                  disabled={isCompleted}
                />
              </div>
            ))}
            {ex.notes && (
              <p className="text-xs text-muted-foreground italic">
                {ex.notes}
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did the workout feel? Any observations..."
            disabled={isCompleted}
            rows={3}
          />
        </CardContent>
      </Card>

      {!isCompleted && (
        <div className="flex justify-end">
          <LoadingButton
            onClick={handleSubmit}
            loading={isPending}
            loadingText="Saving..."
            size="lg"
          >
            <CheckCircle2 className="mr-2 size-4" />
            Complete Workout
          </LoadingButton>
        </div>
      )}
    </div>
  );
}
