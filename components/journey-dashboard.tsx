"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Dumbbell, Moon, Target, Trophy, TrendingUp } from "lucide-react";

type JourneyData = {
  day: number;
  streak: number;
  totalWorkouts: number;
  strengthChange: number;
  avgSleep: number;
  goalProgress: number;
  nextMilestone: {
    title: string;
    workoutsNeeded: number;
  } | null;
  recentAchievements: { title: string; date: string }[];
};

type JourneyDashboardProps = {
  data?: JourneyData;
  loading?: boolean;
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className={`rounded-full p-2 ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function JourneyDashboard({ data, loading = false }: JourneyDashboardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Journey</CardTitle>
          <Badge variant="outline" className="text-lg font-bold">
            Day {data.day}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${data.streak} days`}
            color="bg-orange-500"
          />
          <StatCard
            icon={Dumbbell}
            label="Workouts"
            value={`${data.totalWorkouts}`}
            color="bg-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Strength"
            value={`${data.strengthChange > 0 ? "+" : ""}${data.strengthChange}%`}
            color="bg-green-500"
          />
          <StatCard
            icon={Moon}
            label="Avg Sleep"
            value={`${data.avgSleep}h`}
            color="bg-purple-500"
          />
          <StatCard
            icon={Target}
            label="Goal Progress"
            value={`${data.goalProgress}%`}
            color="bg-red-500"
          />
        </div>

        {data.nextMilestone && (
          <div className="rounded-lg border border-dashed p-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <p className="text-sm font-medium">Next Milestone</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-semibold">{data.nextMilestone.workoutsNeeded} more workouts</span>{" "}
              to unlock &quot;{data.nextMilestone.title}&quot;
            </p>
          </div>
        )}

        {data.recentAchievements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Achievements</p>
            {data.recentAchievements.map((achievement, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span>{achievement.title}</span>
                <span className="text-muted-foreground">{achievement.date}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
