"use client";

import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type PullToRefreshProps = {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
};

export function PullToRefresh({ onRefresh, children, className, threshold = 80 }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0]!.clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return;

    const currentY = e.touches[0]!.clientY;
    const distance = Math.max(0, currentY - startY.current);
    setPullDistance(Math.min(distance * 0.5, threshold + 20));
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch {
        // Refresh failed
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  return (
    <div
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="overflow-hidden transition-transform"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>

      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute left-0 right-0 flex justify-center overflow-hidden"
          style={{ top: 0, height: pullDistance }}
        >
          <RefreshCw
            className={cn(
              "h-6 w-6 text-muted-foreground transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
