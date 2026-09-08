"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Moon,
  Zap,
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Bed,
  Activity,
  Flame,
} from "lucide-react";

type Insight = {
  category: string;
  severity: string;
  message: string;
  actionable: boolean;
};

type CheckIn = {
  weekStart: string;
  sleepQuality: number;
  energyLevel: number;
  workoutsCompleted: number;
};

type RecoveryDashboardProps = {
  readiness: {
    score: number;
    recommendation: string;
    factors: {
      sleep: number;
      energy: number;
      habits: number;
      recovery: number;
      consistency: number;
    };
    explanation: string;
  };
  insights: Insight[];
  recentWorkouts: {
    date: string;
    title: string;
    exerciseCount: number;
  }[];
  recentCheckIns: CheckIn[];
  daysSinceLastWorkout: number;
};

function ReadinessGauge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-500"
      : score >= 60
        ? "text-blue-500"
        : score >= 40
          ? "text-yellow-500"
          : "text-red-500";
  const label =
    score >= 80
      ? "High Intensity"
      : score >= 60
        ? "Moderate"
        : score >= 40
          ? "Light"
          : score >= 20
            ? "Recovery"
            : "Rest";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-28">
        <svg className="size-28 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-muted/30"
          />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={`${score} 100`}
            className={color}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
          {score}
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">Readiness Score</p>
      </div>
    </div>
  );
}

function FactorBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const color =
    score >= 7
      ? "bg-green-500"
      : score >= 5
        ? "bg-blue-500"
        : score >= 3
          ? "bg-yellow-500"
          : "bg-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold">{score}/10</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted/30"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label={`${label}: ${score} out of 10`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const config = {
    warning: {
      icon: <AlertTriangle className="size-4 text-yellow-500" />,
      bg: "bg-yellow-500/5",
      border: "border-yellow-500/20",
      badge: "bg-yellow-500/10 text-yellow-500",
    },
    positive: {
      icon: <CheckCircle2 className="size-4 text-green-500" />,
      bg: "bg-green-500/5",
      border: "border-green-500/20",
      badge: "bg-green-500/10 text-green-500",
    },
    info: {
      icon: <Info className="size-4 text-blue-500" />,
      bg: "bg-blue-500/5",
      border: "border-blue-500/20",
      badge: "bg-blue-500/10 text-blue-500",
    },
  };

  const c = config[insight.severity as keyof typeof config] ?? config.info;

  const categoryLabel = {
    sleep: "Sleep",
    training: "Training",
    habits: "Habits",
    nutrition: "Nutrition",
    general: "General",
  };

  return (
    <div className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-3">
        {c.icon}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`text-xs ${c.badge}`}>
              {categoryLabel[insight.category as keyof typeof categoryLabel] ?? insight.category}
            </Badge>
            {insight.actionable && (
              <Badge variant="outline" className="text-xs">
                Action needed
              </Badge>
            )}
          </div>
          <p className="text-sm leading-relaxed">{insight.message}</p>
        </div>
      </div>
    </div>
  );
}

function TrainingLoadChart({ workouts }: { workouts: { date: string; title: string; exerciseCount: number }[] }) {
  const maxExercises = Math.max(...workouts.map((w) => w.exerciseCount), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1.5" style={{ height: 80 }}>
        {workouts.slice(0, 14).map((w, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-primary/60 transition-all duration-300 hover:bg-primary"
            style={{
              height: `${(w.exerciseCount / maxExercises) * 100}%`,
              minHeight: 4,
            }}
            title={`${w.title}: ${w.exerciseCount} exercises`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>14 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function SleepEnergyTrend({ checkIns }: { checkIns: CheckIn[] }) {
  if (checkIns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Submit check-ins to see your sleep and energy trends.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Moon className="size-3" />
          <span>Sleep Quality</span>
        </div>
        <div className="flex items-end gap-1" style={{ height: 48 }}>
          {checkIns.map((ci, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-indigo-500/60 transition-all duration-300 hover:bg-indigo-500"
              style={{
                height: `${((ci.sleepQuality || 0) / 10) * 100}%`,
                minHeight: 2,
              }}
              title={`Sleep: ${ci.sleepQuality}/10`}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="size-3" />
          <span>Energy Level</span>
        </div>
        <div className="flex items-end gap-1" style={{ height: 48 }}>
          {checkIns.map((ci, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-amber-500/60 transition-all duration-300 hover:bg-amber-500"
              style={{
                height: `${((ci.energyLevel || 0) / 10) * 100}%`,
                minHeight: 2,
              }}
              title={`Energy: ${ci.energyLevel}/10`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{checkIns.length} weeks ago</span>
        <span>This week</span>
      </div>
    </div>
  );
}

export function RecoveryDashboard({
  readiness,
  insights,
  recentWorkouts,
  recentCheckIns,
  daysSinceLastWorkout,
}: RecoveryDashboardProps) {
  const actionableCount = insights.filter((i) => i.actionable).length;
  const positiveCount = insights.filter((i) => i.severity === "positive").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center">
            <ReadinessGauge score={readiness.score} />
            <p className="mt-4 text-sm text-muted-foreground text-center max-w-xs">
              {readiness.explanation}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Recovery Factors</h3>
            </div>
            <FactorBar
              label="Sleep"
              score={readiness.factors.sleep}
              icon={<Moon className="size-3.5 text-indigo-400" />}
            />
            <FactorBar
              label="Energy"
              score={readiness.factors.energy}
              icon={<Zap className="size-3.5 text-amber-400" />}
            />
            <FactorBar
              label="Recovery"
              score={readiness.factors.recovery}
              icon={<Dumbbell className="size-3.5 text-green-400" />}
            />
            <FactorBar
              label="Habits"
              score={readiness.factors.habits}
              icon={<Flame className="size-3.5 text-orange-400" />}
            />
            <FactorBar
              label="Consistency"
              score={readiness.factors.consistency}
              icon={<TrendingUp className="size-3.5 text-blue-400" />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Activity Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold">{daysSinceLastWorkout}</p>
                <p className="text-xs text-muted-foreground">Days since last workout</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold">{recentWorkouts.length}</p>
                <p className="text-xs text-muted-foreground">Workouts (14 days)</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold">{actionableCount}</p>
                <p className="text-xs text-muted-foreground">Action items</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold">{positiveCount}</p>
                <p className="text-xs text-muted-foreground">Positive signals</p>
              </div>
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium capitalize">{readiness.recommendation.replace("_", " ")}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Recommended intensity for your next workout
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recovery Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
              <CheckCircle2 className="mb-3 size-8 text-green-500/50" />
              <p className="text-sm font-medium">All clear</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No recovery concerns detected. Keep up the good work.
              </p>
            </div>
          ) : (
            insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Training Load (14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No workouts recorded in the last 14 days.
              </p>
            ) : (
              <TrainingLoadChart workouts={recentWorkouts} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sleep & Energy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SleepEnergyTrend checkIns={recentCheckIns} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
