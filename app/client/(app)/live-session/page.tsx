"use client";

import { useState, useEffect } from "react";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LiveSession } from "@/components/live-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Phone, PhoneOff } from "lucide-react";

export default function LiveSessionPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"none" | "waiting" | "active" | "ended">("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const res = await fetch("/api/client/live-session");
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

  const startSession = async () => {
    try {
      const res = await fetch("/api/client/live-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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

  const handleEndSession = () => {
    setStatus("ended");
    setSessionId(null);
  };

  return (
    <DashboardLayout
      title="Live Session"
      navItems={[...CLIENT_NAV]}
      userName="Client"
      userRole="Client"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : sessionId ? (
        <LiveSession
          sessionId={sessionId}
          userId="current"
          isCoach={false}
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
              Start a live coaching session with your coach. You can chat in real-time,
              share your screen, and get instant feedback on your form.
            </p>
            <div className="flex gap-2">
              <Button onClick={startSession}>
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
