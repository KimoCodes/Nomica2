"use client";

import { useState, useEffect, useCallback } from "react";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SessionCard } from "@/components/sessions/session-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { listSessionsAction, getSessionStatsAction } from "@/actions/session.actions";
import { Skeleton } from "@/components/ui/skeleton";

type Session = {
  id: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  sessionType: string;
  notes: string | null;
  cancellationReason: string | null;
  meetingUrl: string | null;
  location: string | null;
  coachNotes: string | null;
  clientProfile: {
    user: { id: string; name: string; email: string; avatar?: string | null };
  };
  coachProfile: {
    user: { id: string; name: string; email: string; avatar?: string | null };
  };
};

export default function ClientSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, cancelled: 0, missed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const [upcomingResult, historyResult, statsResult] = await Promise.all([
        listSessionsAction({ from: now, limit: 50 }),
        listSessionsAction({ to: now, limit: 50 }),
        getSessionStatsAction(),
      ]);

      if (upcomingResult.success && upcomingResult.data) {
        setSessions(upcomingResult.data.sessions as Session[]);
      }
      if (historyResult.success && historyResult.data) {
        setSessions((prev) => {
          const existing = new Set(prev.map((s) => s.id));
          const newSessions = (historyResult.data!.sessions as Session[]).filter((s) => !existing.has(s.id));
          return [...prev, ...newSessions];
        });
      }
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const now = new Date();
  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) >= now && !["CANCELLED", "COMPLETED", "MISSED"].includes(s.status)
  );
  const pastSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) < now || ["CANCELLED", "COMPLETED", "MISSED"].includes(s.status)
  );
  const pendingSessions = upcomingSessions.filter((s) => s.status === "PENDING");
  const confirmedSessions = upcomingSessions.filter((s) => s.status === "CONFIRMED");

  const displaySessions = activeTab === "upcoming" ? upcomingSessions :
    activeTab === "pending" ? pendingSessions :
    activeTab === "confirmed" ? confirmedSessions :
    pastSessions;

  return (
    <DashboardLayout
      title="My Sessions"
      navItems={[...CLIENT_NAV]}
      userName=""
      userRole="Client"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Sessions</h2>
          <p className="mt-1 text-muted-foreground">
            View and manage your coaching sessions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="animate-slide-up stagger-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.upcoming}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/10 p-2">
                  <Clock className="size-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <CheckCircle2 className="size-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2">
                  <CalendarX className="size-4 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.cancelled + stats.missed}</p>
                  <p className="text-xs text-muted-foreground">Cancelled/Missed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingSessions.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingSessions.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed ({confirmedSessions.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  History ({pastSessions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                  </div>
                ) : displaySessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                    <Calendar className="mb-3 size-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium">
                      {activeTab === "upcoming" ? "No upcoming sessions" : "No sessions found"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activeTab === "upcoming"
                        ? "Book a session with your coach to get started."
                        : "Your session history will appear here."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displaySessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        role="client"
                        onAction={loadSessions}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
