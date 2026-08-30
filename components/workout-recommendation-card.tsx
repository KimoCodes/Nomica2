"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Timer, Dumbbell, RefreshCw } from "lucide-react";

type WorkoutRecommendation = {
  type: string;
  title: string;
  duration: number;
  intensity: string;
  muscleGroups: string[];
  reason: string;
  exercises: { name: string; sets: number; reps: number; weight: number | null; rest: number }[];
};

type ReadinessScore = {
  score: number;
  recommendation: string;
  explanation: string;
};

export function WorkoutRecommendationCard() {
  const [recommendation, setRecommendation] = useState<WorkoutRecommendation | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const res = await fetch("/api/client/recommendations");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) {
          setRecommendation(data.recommendation);
          setReadiness(data.readiness);
        }
      } catch {
        if (!cancelled) {
          setRecommendation(null);
          setReadiness(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/client/recommendations");
      const data = await res.json();
      setRecommendation(data.recommendation);
      setReadiness(data.readiness);
    } catch {
      // Failed to refresh
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Today&apos;s Workout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) return null;

  const intensityColors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    moderate: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const typeColors: Record<string, string> = {
    rest: "bg-slate-100 text-slate-800",
    recovery: "bg-blue-100 text-blue-800",
    strength: "bg-purple-100 text-purple-800",
    hypertrophy: "bg-orange-100 text-orange-800",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Today&apos;s Workout
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh recommendation"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {readiness && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Readiness:</span>
            <Badge variant="outline">{readiness.score}/100</Badge>
            <Badge className={intensityColors[readiness.recommendation] ?? "bg-gray-100"}>
              {readiness.recommendation}
            </Badge>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{recommendation.title}</h3>
          <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={typeColors[recommendation.type] ?? "bg-gray-100"}>
            {recommendation.type}
          </Badge>
          <Badge className={intensityColors[recommendation.intensity] ?? "bg-gray-100"}>
            {recommendation.intensity} intensity
          </Badge>
          <Badge variant="outline">
            <Timer className="mr-1 h-3 w-3" />
            {recommendation.duration} min
          </Badge>
          {recommendation.muscleGroups.length > 0 && (
            <Badge variant="outline">
              <Dumbbell className="mr-1 h-3 w-3" />
              {recommendation.muscleGroups.join(", ")}
            </Badge>
          )}
        </div>

        {recommendation.exercises.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Exercises</h4>
            <div className="space-y-1">
              {recommendation.exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{ex.name}</span>
                  <span className="text-muted-foreground">
                    {ex.sets}x{ex.reps} {ex.rest > 0 && `(${ex.rest}s rest)`}
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
