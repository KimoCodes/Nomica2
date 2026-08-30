"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

type QuickStat = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: number;
};

type UpcomingWorkout = {
  id: string;
  title: string;
  duration: number;
  muscleGroups: string[];
  scheduledFor: string;
};

type ClientDashboardProps = {
  userName: string;
  stats: QuickStat[];
  weeklyProgress: number;
  upcomingWorkouts: UpcomingWorkout[];
  streak: number;
  onWorkoutClick?: (id: string) => void;
  onViewAll?: () => void;
};

export function ClientDashboard({
  userName,
  stats,
  weeklyProgress,
  upcomingWorkouts,
  streak,
  onWorkoutClick,
  onViewAll,
}: ClientDashboardProps) {
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{greeting}, {userName}</h1>
        <p className="text-muted-foreground">
          {streak > 0 ? `🔥 ${streak}-day streak going!` : "Ready to start your workout?"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                  {stat.trend !== undefined && (
                    <p className={`text-xs ${stat.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stat.trend >= 0 ? "+" : ""}{stat.trend}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Weekly Goal</CardTitle>
          <span className="text-sm font-medium">{weeklyProgress}%</span>
        </CardHeader>
        <CardContent>
          <Progress value={weeklyProgress} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            {Math.round(weeklyProgress / 100 * 5)} of 5 workouts completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Upcoming Workouts</CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingWorkouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workouts scheduled</p>
          ) : (
            upcomingWorkouts.slice(0, 3).map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => onWorkoutClick?.(workout.id)}
              >
                <div className="space-y-1">
                  <p className="font-medium">{workout.title}</p>
                  <div className="flex gap-1">
                    {workout.muscleGroups.slice(0, 2).map((group) => (
                      <Badge key={group} variant="secondary" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{workout.duration} min</p>
                  <p className="text-xs">{workout.scheduledFor}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export type { ClientDashboardProps, QuickStat, UpcomingWorkout };
