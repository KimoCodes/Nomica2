"use client";

import { useState, useEffect, useCallback } from "react";
import { COACH_NAV } from "@/constants/navigation";
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
import { Input } from "@/components/ui/input";
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  Users,
} from "lucide-react";
import { listSessionsAction, getSessionStatsAction, completeSessionAction, markSessionMissedAction } from "@/actions/session.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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

export default function CoachSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, cancelled: 0, missed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const [allResult, statsResult] = await Promise.all([
        listSessionsAction({ limit: 200 }),
        getSessionStatsAction(),
      ]);

      if (allResult.success && allResult.data) {
        setSessions(allResult.data.sessions as Session[]);
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

  const filteredSessions = displaySessions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = s.clientProfile.user.name?.toLowerCase() ?? "";
    return name.includes(q);
  });

  async function handleComplete(sessionId: string) {
    setActionLoading(sessionId);
    try {
      const result = await completeSessionAction(sessionId);
      if (result.success) {
        toast.success("Session marked as completed");
        loadSessions();
      } else {
        toast.error(result.error?.message ?? "Failed to complete");
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkMissed(sessionId: string) {
    setActionLoading(sessionId);
    try {
      const result = await markSessionMissedAction(sessionId);
      if (result.success) {
        toast.success("Session marked as missed");
        loadSessions();
      } else {
        toast.error(result.error?.message ?? "Failed to mark as missed");
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <DashboardLayout
      title="Sessions"
      navItems={[...COACH_NAV]}
      userName=""
      userRole="Coach"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sessions</h2>
          <p className="mt-1 text-muted-foreground">
            Manage your coaching sessions with clients.
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
                  <p className="text-xs text-muted-foreground">Awaiting Confirmation</p>
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
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <CalendarX className="size-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.missed}</p>
                  <p className="text-xs text-muted-foreground">Missed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">All Sessions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
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
                ) : filteredSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                    <Calendar className="mb-3 size-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium">
                      {activeTab === "upcoming" ? "No upcoming sessions" : "No session history"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activeTab === "upcoming"
                        ? "Sessions booked by clients will appear here."
                        : "Past sessions will appear here."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSessions.map((session) => (
                      <div key={session.id} className="relative">
                        <SessionCard
                          session={session}
                          role="coach"
                          onAction={loadSessions}
                        />
                        {activeTab === "upcoming" && ["PENDING", "CONFIRMED", "RESCHEDULED"].includes(session.status) && (
                          <div className="mt-2 flex gap-2 px-4 pb-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleComplete(session.id)}
                              disabled={actionLoading === session.id}
                            >
                              {actionLoading === session.id ? (
                                <Loader2 className="mr-1 size-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-1 size-3" />
                              )}
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                              onClick={() => handleMarkMissed(session.id)}
                              disabled={actionLoading === session.id}
                            >
                              {actionLoading === session.id ? (
                                <Loader2 className="mr-1 size-3 animate-spin" />
                              ) : (
                                <CalendarX className="mr-1 size-3" />
                              )}
                              Mark Missed
                            </Button>
                          </div>
                        )}
                      </div>
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
