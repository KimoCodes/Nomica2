"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Activity, TrendingUp, ArrowRight } from "lucide-react";

type AdminMetric = {
  label: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: string;
};

type RecentActivity = {
  id: string;
  type: "signup" | "purchase" | "workout" | "churn";
  description: string;
  timestamp: string;
};

type AdminDashboardProps = {
  metrics: AdminMetric[];
  recentActivity: RecentActivity[];
  systemHealth: {
    status: "healthy" | "degraded" | "down";
    uptime: string;
    responseTime: string;
  };
  onMetricClick?: (label: string) => void;
  onViewAllActivity?: () => void;
};

export function AdminDashboard({
  metrics,
  recentActivity,
  systemHealth,
  onMetricClick,
  onViewAllActivity,
}: AdminDashboardProps) {
  const healthColors = {
    healthy: "bg-green-100 text-green-800",
    degraded: "bg-yellow-100 text-yellow-800",
    down: "bg-red-100 text-red-800",
  };

  const activityIcons = {
    signup: Users,
    purchase: DollarSign,
    workout: Activity,
    churn: TrendingUp,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>
        <Badge className={healthColors[systemHealth.status]}>
          {systemHealth.status === "healthy" ? "●" : systemHealth.status === "degraded" ? "◐" : "○"}
          {" "}System {systemHealth.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card
            key={i}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => onMetricClick?.(metric.label)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={`text-xs font-medium ${metric.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {metric.change >= 0 ? "+" : ""}{metric.change}% from last month
                  </p>
                </div>
                <div className={`rounded-full p-3 ${metric.color}`}>
                  <metric.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Recent Activity</CardTitle>
            {onViewAllActivity && (
              <Button variant="ghost" size="sm" onClick={onViewAllActivity}>
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.slice(0, 6).map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="font-medium">{systemHealth.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Response</span>
              <span className="font-medium">{systemHealth.responseTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={healthColors[systemHealth.status]}>
                {systemHealth.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export type { AdminDashboardProps, AdminMetric, RecentActivity };
