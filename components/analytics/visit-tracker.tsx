"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

function generateSessionId(): string {
  if (typeof window === "undefined") return "";

  const cryptoObj = window.crypto;

  // Preferred: modern browsers / secure contexts
  if (typeof cryptoObj?.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }

  // Fallback: generate a UUID-like value using Web Crypto
  if (typeof cryptoObj?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);

    // Set UUID version 4 and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return [
      Array.from(bytes.slice(0, 4), (b) =>
        b.toString(16).padStart(2, "0")
      ).join(""),
      Array.from(bytes.slice(4, 6), (b) =>
        b.toString(16).padStart(2, "0")
      ).join(""),
      Array.from(bytes.slice(6, 8), (b) =>
        b.toString(16).padStart(2, "0")
      ).join(""),
      Array.from(bytes.slice(8, 10), (b) =>
        b.toString(16).padStart(2, "0")
      ).join(""),
      Array.from(bytes.slice(10, 16), (b) =>
        b.toString(16).padStart(2, "0")
      ).join(""),
    ].join("-");
  }

  // Final fallback for very old browsers
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const key = "analytics_session_id";
  let id = sessionStorage.getItem(key);

  if (!id) {
    id = generateSessionId();
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
