"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type LoadingOverlayProps = {
  loading?: boolean;
  text?: string;
  children?: React.ReactNode;
  className?: string;
};

export function LoadingOverlay({
  loading = false,
  text = "Processing...",
  children,
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-md animate-fade-in"
          role="status"
          aria-label={text}
        >
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse-subtle" />
              <div className="relative rounded-2xl bg-card/80 p-4 shadow-premium border border-border/50">
                <Spinner size="xl" className="text-primary" />
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground animate-pulse">
              {text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
