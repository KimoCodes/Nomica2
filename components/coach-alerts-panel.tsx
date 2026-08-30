"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/ui/skeleton";

type AlertFactor = {
  category: string;
  severity: "low" | "medium" | "high";
  description: string;
};

type ClientAlert = {
  clientId: string;
  clientName: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  factors: AlertFactor[];
  suggestedActions: string[];
};

type CoachSummary = {
  totalClients: number;
  activeClients: number;
  atRiskCount: number;
  needsAttentionCount: number;
};

const riskColors = {
  low: "text-green-500 bg-green-500/10",
  medium: "text-yellow-500 bg-yellow-500/10",
  high: "text-orange-500 bg-orange-500/10",
  critical: "text-red-500 bg-red-500/10",
};

const riskIcons = {
  low: CheckCircle,
  medium: Info,
  high: AlertCircle,
  critical: AlertTriangle,
};

export function CoachAlertsPanel() {
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [summary, setSummary] = useState<CoachSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coach/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.alerts ?? []);
        setSummary(data.summary ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Failed to load client alerts");
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (alerts.length === 0 && !summary) return null;

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.totalClients}</p>
              <p className="text-xs text-muted-foreground">Total Clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">
                {summary.atRiskCount}
              </p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {summary.needsAttentionCount}
              </p>
              <p className="text-xs text-muted-foreground">Needs Attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => {
                const Icon = riskIcons[alert.riskLevel];
                return (
                  <div
                    key={alert.clientId}
                    className="flex items-start gap-3 rounded-xl border border-border/50 p-3"
                  >
                    <div
                      className={`mt-0.5 rounded-lg p-1.5 ${riskColors[alert.riskLevel]}`}
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {alert.clientName}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${riskColors[alert.riskLevel]}`}
                          aria-label={`Risk level: ${alert.riskLevel}`}
                        >
                          {alert.riskLevel}
                        </span>
                      </div>
                      {alert.factors.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {alert.factors[0].description}
                        </p>
                      )}
                      {alert.suggestedActions.length > 0 && (
                        <p className="mt-1 text-xs font-medium text-primary">
                          {alert.suggestedActions[0]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
