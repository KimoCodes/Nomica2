"use client";

import { useState, useEffect, useCallback } from "react";
import { COACH_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LiveSession } from "@/components/live-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Phone, Users } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string;
};

export default function CoachLiveSessionPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [status, setStatus] = useState<"none" | "waiting" | "active" | "ended">("none");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    checkActiveSession();
    fetchClients();
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.user?.id) setUserId(data.user.id);
    } catch {
      // Failed to fetch user
    }
  };

  const checkActiveSession = async () => {
    try {
      const res = await fetch("/api/coach/live-session");
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setStatus(data.status);
      }
    } catch {
      // No active session
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/coach/clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch {
      // Failed to fetch clients
    }
  };

  const startSession = async () => {
    if (!selectedClient) return;

    try {
      const res = await fetch("/api/coach/live-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient }),
      });
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setStatus("waiting");
      }
    } catch {
      // Failed to start session
    }
  };

  const handleEndSession = useCallback(() => {
    setStatus("ended");
    setSessionId(null);
  }, []);

  return (
    <DashboardLayout
      title="Live Session"
      navItems={[...COACH_NAV]}
      userName="Coach"
      userRole="COACH"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : sessionId ? (
        <LiveSession
          sessionId={sessionId}
          userId={userId}
          isCoach={true}
          onEndSession={handleEndSession}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Start Live Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Start a live coaching session with one of your clients. You can chat in real-time,
              send exercises, and provide form corrections.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Client</label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedClient || ""}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={startSession} disabled={!selectedClient}>
                <Phone className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
