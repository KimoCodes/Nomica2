"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Play, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileWorkoutCardProps = {
  title: string;
  duration: number;
  muscleGroups: string[];
  intensity: "low" | "moderate" | "high";
  completed?: boolean;
  onStart?: () => void;
  className?: string;
};

const intensityIcons = {
  low: Flame,
  moderate: Flame,
  high: Flame,
};

export function MobileWorkoutCard({
  title,
  duration,
  muscleGroups,
  intensity,
  completed = false,
  onStart,
  className,
}: MobileWorkoutCardProps) {
  const IntensityIcon = intensityIcons[intensity];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-4 transition-shadow",
        completed && "opacity-75",
        className
      )}
    >
      {completed && (
        <div className="absolute right-2 top-2">
          <Badge className="bg-green-500">
            <Check className="mr-1 h-3 w-3" />
            Done
          </Badge>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {muscleGroups.slice(0, 3).map((group) => (
              <Badge key={group} variant="secondary" className="text-xs">
                {group}
              </Badge>
            ))}
            {muscleGroups.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{muscleGroups.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <IntensityIcon className="h-4 w-4" />
            <span className="capitalize">{intensity}</span>
          </div>
        </div>

        {!completed && onStart && (
          <Button onClick={onStart} className="w-full" size="lg">
            <Play className="mr-2 h-4 w-4" />
            Start Workout
          </Button>
        )}
      </div>
    </div>
  );
}
