"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "analytics_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function VisitTracker() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const sessionId = getOrCreateSessionId();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        userId: session?.user?.id ?? null,
        sessionId,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, session?.user?.id]);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        userId: session?.user?.id ?? null,
        sessionId,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
