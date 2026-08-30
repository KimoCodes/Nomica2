"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";

type ClientSummary = {
  id: string;
  name: string;
  lastActive: string;
  status: "active" | "at_risk" | "inactive";
  workoutCount: number;
  streak: number;
};

type CoachAlert = {
  id: string;
  type: "missed_workout" | "low_energy" | "payment_issue" | "goal_achieved";
  message: string;
  clientId: string;
  clientName: string;
  createdAt: string;
};

type CoachDashboardProps = {
  coachName: string;
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  clients: ClientSummary[];
  alerts: CoachAlert[];
  onClientClick?: (id: string) => void;
  onAlertClick?: (id: string) => void;
  onViewAllClients?: () => void;
};

export function CoachDashboard({
  coachName,
  totalClients,
  activeClients,
  atRiskClients,
  clients,
  alerts,
  onClientClick,
  onAlertClick,
  onViewAllClients,
}: CoachDashboardProps) {
  const greeting = getGreeting();

  const statusColors = {
    active: "bg-green-100 text-green-800",
    at_risk: "bg-yellow-100 text-yellow-800",
    inactive: "bg-red-100 text-red-800",
  };

  const alertIcons = {
    missed_workout: AlertTriangle,
    low_energy: AlertTriangle,
    payment_issue: AlertTriangle,
    goal_achieved: TrendingUp,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{greeting}, Coach {coachName}</h1>
        <p className="text-muted-foreground">
          You have {alerts.length} new alerts
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto h-6 w-6 text-blue-500" />
            <p className="mt-2 text-2xl font-bold">{totalClients}</p>
            <p className="text-xs text-muted-foreground">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto h-6 w-6 text-green-500" />
            <p className="mt-2 text-2xl font-bold">{activeClients}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-yellow-500" />
            <p className="mt-2 text-2xl font-bold">{atRiskClients}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 5).map((alert) => {
              const Icon = alertIcons[alert.type];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => onAlertClick?.(alert.id)}
                >
                  <Icon className="mt-0.5 h-4 w-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.clientName} · {alert.createdAt}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Your Clients</CardTitle>
          {onViewAllClients && (
            <Button variant="ghost" size="sm" onClick={onViewAllClients}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {clients.slice(0, 5).map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
              onClick={() => onClientClick?.(client.id)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">{client.name[0]}</span>
                </div>
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.workoutCount} workouts · {client.streak}-day streak
                  </p>
                </div>
              </div>
              <Badge className={statusColors[client.status]}>
                {client.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
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

export type { CoachDashboardProps, ClientSummary, CoachAlert };
