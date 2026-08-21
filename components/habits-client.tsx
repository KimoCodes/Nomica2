"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Droplets,
  Moon,
  Beef,
  StretchHorizontal,
  Footprints,
  Pill,
  Plus,
  Trash2,
  Check,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toggleHabit, createHabit, deleteHabit } from "@/actions/habits.actions";

type HabitData = {
  id: string;
  type: string;
  target: number;
  completedToday: number;
  loggedToday: boolean;
};

type HabitStats = {
  type: string;
  target: number;
  streak: number;
  completionRate: number;
}[];

const HABIT_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; unit: string }> = {
  WATER: { label: "Water", icon: Droplets, color: "text-blue-500", unit: "glasses" },
  SLEEP: { label: "Sleep", icon: Moon, color: "text-indigo-500", unit: "hours" },
  PROTEIN: { label: "Protein", icon: Beef, color: "text-red-500", unit: "meals" },
  STRETCHING: { label: "Stretching", icon: StretchHorizontal, color: "text-green-500", unit: "sessions" },
  STEPS: { label: "Steps", icon: Footprints, color: "text-orange-500", unit: "k steps" },
  VITAMINS: { label: "Vitamins", icon: Pill, color: "text-purple-500", unit: "taken" },
};

const ALL_TYPES = ["WATER", "SLEEP", "PROTEIN", "STRETCHING", "STEPS", "VITAMINS"] as const;

export function HabitsClient({ habits, stats }: { habits: HabitData[]; stats: HabitStats }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newType, setNewType] = useState<string>("");

  const activeTypes = habits.map((h) => h.type);
  const availableTypes = ALL_TYPES.filter((t) => !activeTypes.includes(t));

  function handleToggle(habitId: string) {
    startTransition(async () => {
      await toggleHabit(habitId);
      router.refresh();
    });
  }

  function handleAdd() {
    if (!newType) return;
    startTransition(async () => {
      await createHabit(newType as "WATER" | "SLEEP" | "PROTEIN" | "STRETCHING" | "STEPS" | "VITAMINS");
      setAddDialogOpen(false);
      setNewType("");
      router.refresh();
    });
  }

  function handleDelete(habitId: string) {
    startTransition(async () => {
      await deleteHabit(habitId);
      router.refresh();
    });
  }

  const totalStreak = stats.reduce((max, s) => Math.max(max, s.streak), 0);
  const avgCompletion = stats.length
    ? Math.round(stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Habits</h2>
          <p className="text-sm text-muted-foreground">Track your daily habits and build consistency</p>
        </div>
        {availableTypes.length > 0 && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-2">
                  <Plus className="size-4" />
                  Add Habit
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select value={newType} onValueChange={(v) => setNewType(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a habit" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => {
                      const config = HABIT_CONFIG[type];
                      return (
                        <SelectItem key={type} value={type}>
                          <span className="flex items-center gap-2">
                            <config.icon className={cn("size-4", config.color)} />
                            {config.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button onClick={handleAdd} disabled={!newType || isPending} className="w-full">
                  {isPending ? "Adding..." : "Add Habit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Flame className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10">
                <Check className="size-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgCompletion}%</p>
                <p className="text-xs text-muted-foreground">7-Day Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10">
                <Plus className="size-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{habits.length}</p>
                <p className="text-xs text-muted-foreground">Active Habits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Plus className="size-7 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No habits yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start building consistency by adding your first habit
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => {
            const config = HABIT_CONFIG[habit.type] ?? HABIT_CONFIG.WATER;
            const stat = stats.find((s) => s.type === habit.type);
            const Icon = config.icon;
            const progress = Math.min(100, (habit.completedToday / habit.target) * 100);

            return (
              <Card
                key={habit.id}
                className={cn(
                  "transition-all duration-200",
                  habit.loggedToday && "border-green-500/30 bg-green-500/5"
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex size-10 items-center justify-center rounded-xl bg-muted")}>
                        <Icon className={cn("size-5", config.color)} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{config.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          {habit.completedToday}/{habit.target} {config.unit}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(habit.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Today</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          habit.loggedToday ? "bg-green-500" : "bg-primary"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="size-3" />
                      {stat?.streak ?? 0} day streak
                    </div>
                    <Button
                      size="sm"
                      variant={habit.loggedToday ? "outline" : "default"}
                      onClick={() => handleToggle(habit.id)}
                      disabled={isPending}
                      className="gap-1.5"
                    >
                      {habit.loggedToday ? (
                        <>
                          <Check className="size-3.5" />
                          Done
                        </>
                      ) : (
                        "Log"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
