import { getClientFitnessIntelligence } from "@/server/services/dashboard.service";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Activity, Trophy, Target } from "lucide-react";

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
          : "Recovery";

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-16">
        <svg className="size-16 -rotate-90" viewBox="0 0 36 36" role="img" aria-label={`Readiness: ${score} out of 100, ${label}`}>
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted/30"
          />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${score} 100`}
            className={color}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" aria-hidden="true">
          {score}
        </span>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Readiness</p>
        <p className={`text-sm font-semibold ${color}`}>{label}</p>
      </div>
    </div>
  );
}

function ConsistencyBar({ score }: { score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Consistency</p>
        <p className="text-sm font-semibold">{score}%</p>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted/30"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Consistency: ${score}%`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

export async function FitnessIntelligenceCards({ userId }: { userId: string }) {
  let data;
  try {
    data = await getClientFitnessIntelligence(userId);
  } catch {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="animate-slide-up stagger-5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Today&apos;s Readiness
              </p>
              <p className="text-lg font-bold">
                {data.readiness.score}/100
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Activity className="size-5 text-primary" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <ReadinessGauge score={data.readiness.score} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.readiness.explanation}
          </p>
        </CardContent>
      </Card>

      <Card className="animate-slide-up stagger-6">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Consistency Score
              </p>
              <p className="text-lg font-bold">{data.consistency.overall}%</p>
            </div>
            <div className="rounded-xl bg-chart-3/10 p-2.5">
              <Target className="size-5 text-chart-3" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <ConsistencyBar score={data.consistency.workout} />
            <ConsistencyBar score={data.consistency.habits} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground capitalize">
            Trend: {data.consistency.trend}
          </p>
        </CardContent>
      </Card>

      <Card className="animate-slide-up stagger-7 sm:col-span-2 lg:col-span-1">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Personal Records
              </p>
              <p className="text-lg font-bold">
                {data.personalRecords.length}
              </p>
            </div>
            <div className="rounded-xl bg-yellow-500/10 p-2.5">
              <Trophy className="size-5 text-yellow-500" aria-hidden="true" />
            </div>
          </div>
          {data.personalRecords.length > 0 ? (
            <div className="mt-3 space-y-1">
              {data.personalRecords.slice(0, 3).map((pr) => (
                <div
                  key={pr.exerciseId}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-2 py-1"
                >
                  <span className="text-xs font-medium truncate">
                    {pr.exerciseName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {pr.maxWeight}kg
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Complete workouts to track your PRs
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
