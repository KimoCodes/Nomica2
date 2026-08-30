"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Timer } from "lucide-react";

type SurpriseWorkout = {
  title: string;
  duration: number;
  difficulty: string;
  equipment: string;
  exercises: {
    name: string;
    muscleGroup: string;
    sets: number;
    reps: number;
    rest: number;
  }[];
  reason: string;
};

type SurpriseMeWorkoutProps = {
  onGenerate?: (workout: SurpriseWorkout) => void;
};

export function SurpriseMeWorkout({ onGenerate }: SurpriseMeWorkoutProps) {
  const [workout, setWorkout] = useState<SurpriseWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [minutes, setMinutes] = useState(20);
  const [equipment, setEquipment] = useState("none");
  const [level, setLevel] = useState("BEGINNER");

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/client/exercises?action=surprise&minutes=${minutes}&equipment=${equipment}&level=${level}`
      );
      const data = await res.json();
      setWorkout(data.workout);
      onGenerate?.(data.workout);
    } catch {
      // Failed to generate workout
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Surprise Me
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Minutes</label>
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full rounded border px-2 py-1 text-sm"
              aria-label="Available minutes"
            >
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Equipment</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full rounded border px-2 py-1 text-sm"
              aria-label="Available equipment"
            >
              <option value="none">Bodyweight</option>
              <option value="dumbbell">Dumbbells</option>
              <option value="barbell">Barbell</option>
              <option value="kettlebell">Kettlebell</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded border px-2 py-1 text-sm"
              aria-label="Fitness level"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        <Button onClick={generate} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Workout
        </Button>

        {workout && (
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{workout.title}</h3>
              <div className="flex gap-1">
                <Badge variant="outline">
                  <Timer className="mr-1 h-3 w-3" />
                  {workout.duration} min
                </Badge>
                <Badge variant="outline">{workout.difficulty}</Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{workout.reason}</p>

            <div className="space-y-2">
              {workout.exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ex.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {ex.muscleGroup}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">
                    {ex.sets}x{ex.reps} ({ex.rest}s rest)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
