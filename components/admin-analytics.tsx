"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Activity, DollarSign } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
};

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <p className={`text-xs font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {change >= 0 ? "+" : ""}{change}% from last month
              </p>
            )}
          </div>
          <div className={`rounded-full p-3 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type ChartBar = {
  label: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  data: ChartBar[];
  title: string;
  maxValue?: number;
};

function BarChart({ data, title, maxValue }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((bar, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-20 text-xs text-muted-foreground truncate">{bar.label}</span>
              <div className="flex-1 h-4 overflow-hidden rounded bg-muted">
                <div
                  className={`h-full ${bar.color ?? "bg-primary"}`}
                  style={{ width: `${(bar.value / max) * 100}%` }}
                />
              </div>
              <span className="w-10 text-xs text-right font-medium">{bar.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type TrendLineProps = {
  data: number[];
  title: string;
  color?: string;
};

function TrendLine({ data, title, color = "bg-primary" }: TrendLineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-20">
          {data.map((value, i) => (
            <div
              key={i}
              className={`flex-1 ${color} rounded-t`}
              style={{ height: `${((value - min) / range) * 100}%`, minHeight: "4px" }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </CardContent>
    </Card>
  );
}

type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  segments: DonutSegment[];
  title: string;
  total: number;
};

function DonutChart({ segments, title, total }: DonutChartProps) {
  const cumulativePercents: number[] = [];
  let cumulative = 0;

  for (const segment of segments) {
    cumulativePercents.push(cumulative);
    cumulative += (segment.value / total) * 100;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24">
            <svg viewBox="0 0 36 36" className="h-full w-full">
              {segments.map((segment, i) => {
                const percent = (segment.value / total) * 100;
                const strokeDasharray = `${percent} ${100 - percent}`;
                const strokeDashoffset = -cumulativePercents[i]!;

                return (
                  <circle
                    key={i}
                    cx="18"
                    cy="18"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </svg>
          </div>
          <div className="space-y-1">
            {segments.map((segment, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                <span className="text-muted-foreground">{segment.label}</span>
                <span className="font-medium">{segment.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminAnalyticsDashboard() {
  const userMetrics = [
    { label: "Jan", value: 120 },
    { label: "Feb", value: 180 },
    { label: "Mar", value: 240 },
    { label: "Apr", value: 310 },
    { label: "May", value: 380 },
    { label: "Jun", value: 450 },
  ];

  const revenueData = [1200, 1800, 2400, 3100, 3800, 4500, 5200, 6100, 7000, 8200, 9100, 10500];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Users" value="1,234" change={12} icon={Users} color="bg-blue-500" />
        <MetricCard title="Active Today" value="89" change={5} icon={Activity} color="bg-green-500" />
        <MetricCard title="Retention Rate" value="78%" change={3} icon={TrendingUp} color="bg-purple-500" />
        <MetricCard title="MRR" value="$12,450" change={15} icon={DollarSign} color="bg-yellow-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BarChart data={userMetrics} title="User Growth" />
        <TrendLine data={revenueData} title="Revenue Trend" color="bg-green-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DonutChart
          title="User Goals"
          total={1234}
          segments={[
            { label: "Lose Fat", value: 450, color: "#3b82f6" },
            { label: "Build Muscle", value: 380, color: "#22c55e" },
            { label: "Get Stronger", value: 250, color: "#f59e0b" },
            { label: "Stay Fit", value: 154, color: "#8b5cf6" },
          ]}
        />
        <DonutChart
          title="Subscription Plans"
          total={1234}
          segments={[
            { label: "Monthly", value: 680, color: "#3b82f6" },
            { label: "Annual", value: 420, color: "#22c55e" },
            { label: "Free Trial", value: 134, color: "#94a3b8" },
          ]}
        />
      </div>
    </div>
  );
}

export { MetricCard, BarChart, TrendLine, DonutChart };
