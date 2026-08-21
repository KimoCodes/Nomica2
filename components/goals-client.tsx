"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Plus,
  Trash2,
  Check,
  TrendingUp,
  Trophy,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createGoal, updateGoalProgress, completeGoal, deleteGoal } from "@/actions/goals.actions";

type GoalData = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null;
  status: string;
  deadline: Date | string | null;
  progress: number | null;
};

const CATEGORIES = [
  { value: "LOSE_WEIGHT", label: "Lose Weight" },
  { value: "BUILD_MUSCLE", label: "Build Muscle" },
  { value: "GROW_GLUTES", label: "Grow Glutes" },
  { value: "IMPROVE_FITNESS", label: "Improve Fitness" },
  { value: "STRENGTH", label: "Strength" },
  { value: "FLEXIBILITY", label: "Flexibility" },
  { value: "ENDURANCE", label: "Endurance" },
  { value: "OTHER", label: "Other" },
];

const CATEGORY_COLORS: Record<string, string> = {
  LOSE_WEIGHT: "bg-pink-500/10 text-pink-500",
  BUILD_MUSCLE: "bg-red-500/10 text-red-500",
  GROW_GLUTES: "bg-purple-500/10 text-purple-500",
  IMPROVE_FITNESS: "bg-blue-500/10 text-blue-500",
  STRENGTH: "bg-orange-500/10 text-orange-500",
  FLEXIBILITY: "bg-green-500/10 text-green-500",
  ENDURANCE: "bg-cyan-500/10 text-cyan-500",
  OTHER: "bg-gray-500/10 text-gray-500",
};

export function GoalsClient({ goals }: { goals: GoalData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    targetValue: "",
    unit: "",
    deadline: "",
  });

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");

  function handleAdd() {
    if (!newGoal.title || !newGoal.category) return;
    startTransition(async () => {
      await createGoal({
        title: newGoal.title,
        description: newGoal.description || undefined,
        category: newGoal.category,
        targetValue: newGoal.targetValue ? parseFloat(newGoal.targetValue) : undefined,
        unit: newGoal.unit || undefined,
        deadline: newGoal.deadline || undefined,
      });
      setAddDialogOpen(false);
      setNewGoal({ title: "", description: "", category: "", targetValue: "", unit: "", deadline: "" });
      router.refresh();
    });
  }

  function handleUpdateProgress(goalId: string) {
    const value = parseFloat(editValue);
    if (isNaN(value)) return;
    startTransition(async () => {
      await updateGoalProgress(goalId, value);
      setEditingGoal(null);
      setEditValue("");
      router.refresh();
    });
  }

  function handleComplete(goalId: string) {
    startTransition(async () => {
      await completeGoal(goalId);
      router.refresh();
    });
  }

  function handleDelete(goalId: string) {
    startTransition(async () => {
      await deleteGoal(goalId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
          <p className="text-sm text-muted-foreground">Set targets and track your progress</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Add Goal
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input
                  placeholder="e.g., Lose 5kg"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Why is this goal important to you?"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newGoal.category} onValueChange={(v) => setNewGoal({ ...newGoal, category: v ?? "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Value (optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit (optional)</Label>
                  <Input
                    placeholder="e.g., kg, reps"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deadline (optional)</Label>
                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <Button onClick={handleAdd} disabled={!newGoal.title || !newGoal.category || isPending} className="w-full">
                {isPending ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Target className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-xs text-muted-foreground">Active Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10">
                <Trophy className="size-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10">
                <TrendingUp className="size-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {activeGoals.length
                    ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress ?? 0), 0) / activeGoals.length)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Active Goals</h3>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{goal.title}</h4>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", CATEGORY_COLORS[goal.category] ?? "bg-gray-500/10 text-gray-500")}>
                          {CATEGORIES.find((c) => c.value === goal.category)?.label ?? goal.category}
                        </span>
                      </div>
                      {goal.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        {goal.targetValue && (
                          <span>
                            {goal.currentValue ?? 0} / {goal.targetValue} {goal.unit ?? ""}
                          </span>
                        )}
                        {goal.deadline && (
                          <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setEditingGoal(goal.id);
                          setEditValue(String(goal.currentValue ?? 0));
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-green-500 hover:text-green-600"
                        onClick={() => handleComplete(goal.id)}
                        disabled={isPending}
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(goal.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {goal.progress !== null && (
                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {editingGoal === goal.id && (
                    <div className="mt-4 flex items-center gap-2">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-9 w-32"
                        placeholder="New value"
                      />
                      <Button size="sm" onClick={() => handleUpdateProgress(goal.id)} disabled={isPending}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingGoal(null)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Completed</h3>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="opacity-70">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-green-500/10">
                      <Trophy className="size-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium line-through">{goal.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORIES.find((c) => c.value === goal.category)?.label}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(goal.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Target className="size-7 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No goals yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Set your first goal and start tracking your progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
