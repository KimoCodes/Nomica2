"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

let pendingCount = 0;
let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((l) => l());
}

export function startLoading() {
  if (pendingCount === 0) emitChange();
  pendingCount++;
  emitChange();
}

export function stopLoading() {
  pendingCount = Math.max(0, pendingCount - 1);
  emitChange();
}

export async function trackLoading<T>(fn: () => Promise<T>): Promise<T> {
  startLoading();
  try {
    return await fn();
  } finally {
    stopLoading();
  }
}

function useGlobalLoading() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const listener = () => setLoading(pendingCount > 0);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);
  return loading;
}

function CenterSpinner() {
  const loading = useGlobalLoading();
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (loading) {
      timerRef.current = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => setEntering(true));
      }, 150);
    } else if (visible) {
      timerRef.current = setTimeout(() => {
        setEntering(false);
        timerRef.current = setTimeout(() => setVisible(false), 300);
      }, 0);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loading, visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
      role="status"
      aria-label="Loading"
    >
      <div
        className={cn(
          "absolute inset-0 transition-all duration-300",
          entering
            ? "bg-background/60 backdrop-blur-md"
            : "bg-background/0 backdrop-blur-none",
        )}
      />

      <div
        className={cn(
          "relative z-10 flex flex-col items-center gap-5 transition-all duration-500 ease-out",
          entering
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-3 scale-95",
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse-subtle" />
          <div className="relative rounded-2xl bg-card/80 p-5 shadow-premium-lg border border-border/50">
            <Spinner size="2xl" className="text-primary" />
          </div>
        </div>

        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
}

function RouteLoadingDetector() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      prevPath.current = pathname;
      return;
    }
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      stopLoading();
    }
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) return;
      if ((anchor as HTMLAnchorElement).target === "_blank") return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
        startLoading();
      } catch { /* ignore */ }
    }
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

function useFetchInterceptor() {
  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (...args) => {
      startLoading();
      try {
        return await original.apply(window, args);
      } finally {
        stopLoading();
      }
    };
    return () => { window.fetch = original; };
  }, []);
}

export function LoadingBarProvider({ children }: { children: React.ReactNode }) {
  useFetchInterceptor();
  return (
    <>
      <CenterSpinner />
      <Suspense fallback={null}>
        <RouteLoadingDetector />
      </Suspense>
      {children}
    </>
  );
}

export function PageLoader({ text = "Loading" }: { text?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse-subtle" />
          <div className="relative rounded-2xl bg-card/80 p-4 shadow-premium border border-border/50">
            <Spinner size="xl" className="text-primary" />
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}...
        </p>
      </div>
    </div>
  );
}
