"use client";

import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500/10">
            <svg className="size-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">You&apos;re back online</h1>
          <p className="text-muted-foreground">
            Your connection has been restored.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted/50">
          <svg className="size-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 00-7.072 0m7.072 0l-1.414 1.414M12 12l-1.414-1.414m0 0a5 5 0 01-7.072 0m7.072 0l1.414-1.414"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
          <p className="text-muted-foreground">
            It looks like you&apos;ve lost your internet connection. Don&apos;t worry — your progress is saved locally.
          </p>
        </div>
        <div className="rounded-xl bg-muted/30 p-4 text-left space-y-2">
          <p className="text-sm font-medium">What you can do offline:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• View cached workout data</li>
            <li>• Log exercises and sets</li>
            <li>• Track habit completions</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Changes will sync automatically when you&apos;re back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-all hover:bg-accent/30"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
