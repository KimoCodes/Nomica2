"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Users,
  MousePointerClick,
  Activity,
  AlertTriangle,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import type { DeviceType } from "@prisma/client";

type AnalyticsData = {
  visits: { totalVisits: number; uniqueVisitors: number; uniqueSessions: number };
  activities: { totalActions: number; failedActions: number; successRate: number; activeUsers: number };
  topPages: Array<{ path: string; visits: number }>;
  topActions: Array<{ action: string; count: number }>;
  deviceBreakdown: Array<{ deviceType: DeviceType; count: number }>;
  browserBreakdown: Array<{ browser: string | null; count: number }>;
  actionsByDay: Array<{ date: string; count: number }>;
  visitsByDay: Array<{ date: string; count: number }>;
  recentActivity: Array<{
    id: string;
    action: string;
    description: string | null;
    success: boolean;
    createdAt: Date;
    user: { id: string; name: string; email: string; role: string } | null;
  }>;
  categoryBreakdown: Array<{ category: string | null; count: number }>;
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function formatActionName(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "text-primary",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}) {
  return (
    <Card className="animate-slide-up card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`rounded-xl bg-primary/10 p-2.5 icon-hover ${color}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityBadge({ success }: { success: boolean }) {
  return success ? (
    <Badge className="bg-success/10 text-success border-success/20">Success</Badge>
  ) : (
    <Badge variant="destructive">Failed</Badge>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const [dateRange, setDateRange] = useState("30d");

  const visitsChartData = data.visitsByDay.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    visits: d.count,
  }));

  const actionsChartData = data.actionsByDay.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    actions: d.count,
  }));

  const deviceChartData = data.deviceBreakdown.map((d) => ({
    name: d.deviceType === "DESKTOP" ? "Desktop" : d.deviceType === "MOBILE" ? "Mobile" : d.deviceType === "TABLET" ? "Tablet" : "Unknown",
    value: d.count,
  }));

  const categoryChartData = data.categoryBreakdown.map((c) => ({
    name: c.category ?? "Uncategorized",
    value: c.count,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
        <p className="mt-1 text-muted-foreground">
          Website visits, user activity, and platform insights for the last 30 days.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Visits"
          value={data.visits.totalVisits.toLocaleString()}
          icon={Eye}
          description={`${data.visits.uniqueVisitors} unique visitors`}
          color="text-primary"
        />
        <StatCard
          title="Total Actions"
          value={data.activities.totalActions.toLocaleString()}
          icon={Activity}
          description={`${data.activities.activeUsers} active users`}
          color="text-chart-3"
        />
        <StatCard
          title="Success Rate"
          value={`${data.activities.successRate.toFixed(1)}%`}
          icon={TrendingUp}
          description={`${data.activities.failedActions} failed actions`}
          color="text-success"
        />
        <StatCard
          title="Unique Sessions"
          value={data.visits.uniqueSessions.toLocaleString()}
          icon={Users}
          description="Distinct browsing sessions"
          color="text-chart-4"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visits Over Time */}
        <Card className="animate-slide-up stagger-5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="size-4 text-primary" />
              Visits Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visitsChartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={visitsChartData}>
                  <defs>
                    <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#visitGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                Not enough data yet. Visit pages to start tracking.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Over Time */}
        <Card className="animate-slide-up stagger-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="size-4 text-chart-3" />
              Actions Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionsChartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={actionsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="actions" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                No activity recorded yet. Actions will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Device Breakdown */}
        <Card className="animate-slide-up stagger-5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="size-4 text-chart-4" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deviceChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No device data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="animate-slide-up stagger-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPages.length > 0 ? (
              <div className="space-y-3">
                {data.topPages.map((page, i) => (
                  <div key={page.path} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                      <span className="text-sm truncate">{page.path}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {page.visits}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No page data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Actions */}
        <Card className="animate-slide-up stagger-7">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MousePointerClick className="size-4 text-chart-3" />
              Top Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topActions.length > 0 ? (
              <div className="space-y-3">
                {data.topActions.map((action, i) => (
                  <div key={action.action} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                      <span className="text-sm truncate">{formatActionName(action.action)}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {action.count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No action data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Browser Breakdown + Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up stagger-5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="size-4 text-chart-5" />
              Browser Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.browserBreakdown.length > 0 ? (
              <div className="space-y-3">
                {data.browserBreakdown.map((b) => {
                  const total = data.browserBreakdown.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? (b.count / total) * 100 : 0;
                  return (
                    <div key={b.browser} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{b.browser}</span>
                        <span className="text-muted-foreground">{b.count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No browser data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up stagger-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="size-4 text-chart-2" />
              Actions by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No category data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="animate-slide-up stagger-7">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{formatActionName(activity.action)}</p>
                      <ActivityBadge success={activity.success} />
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {activity.user ? `${activity.user.name} (${activity.user.role})` : "System"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <Activity className="mb-3 size-10 text-muted-foreground/30" />
              <p className="text-sm font-medium">No activity yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Activity will appear here as users interact with the platform.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
