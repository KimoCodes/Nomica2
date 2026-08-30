"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const COOKIE_CONSENT_KEY = "nomitips-cookie-consent";

function hasConsent(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(COOKIE_CONSENT_KEY) !== null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(() => !hasConsent());

  const accept = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }, []);

  const decline = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-2xl border shadow-lg">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">We use cookies</p>
            <p className="text-xs text-muted-foreground">
              NomiTips uses cookies to remember your preferences and improve your experience.
              We do not sell your data. By continuing, you agree to our use of cookies.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={decline}>
              Decline
            </Button>
            <Button size="sm" onClick={accept}>
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
