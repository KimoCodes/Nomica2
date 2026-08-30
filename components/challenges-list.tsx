"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Clock, Zap } from "lucide-react";

type Challenge = {
  id: string;
  title: string;
  description: string;
  type: "workout_count" | "streak" | "strength" | "consistency";
  target: number;
  current: number;
  reward: string;
  daysLeft: number;
};

type ChallengesListProps = {
  challenges: Challenge[];
  loading?: boolean;
};

const typeIcons: Record<string, React.ElementType> = {
  workout_count: Target,
  streak: Zap,
  strength: Trophy,
  consistency: Clock,
};

const typeColors: Record<string, string> = {
  workout_count: "bg-blue-500",
  streak: "bg-orange-500",
  strength: "bg-green-500",
  consistency: "bg-purple-500",
};

export function ChallengesList({ challenges, loading = false }: ChallengesListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active challenges. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Challenges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => {
          const Icon = typeIcons[challenge.type] ?? Target;
          const progress = Math.min(100, Math.round((challenge.current / challenge.target) * 100));
          const completed = progress >= 100;

          return (
            <div key={challenge.id} className={`rounded-lg border p-3 ${completed ? "border-green-300 bg-green-50" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <div className={`rounded-full p-1.5 ${typeColors[challenge.type]}`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{challenge.title}</p>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
                {completed ? (
                  <Badge className="bg-green-500">Complete!</Badge>
                ) : (
                  <Badge variant="outline">{challenge.daysLeft}d left</Badge>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{challenge.current} / {challenge.target}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Reward: <span className="font-medium">{challenge.reward}</span>
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
