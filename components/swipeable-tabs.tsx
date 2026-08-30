"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

type SwipeableTabsProps = {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  className?: string;
  onTabChange?: (tabId: string) => void;
};

export function SwipeableTabs({ tabs, className, onTabChange }: SwipeableTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0]!.clientX;
    isSwiping.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;

    const currentX = e.touches[0]!.clientX;
    const diff = currentX - startX.current;
    setOffset(diff * 0.3);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    isSwiping.current = false;

    const currentIndex = tabs.findIndex((t) => t.id === activeTab);

    if (offset > 50 && currentIndex > 0) {
      const newTab = tabs[currentIndex - 1]!.id;
      setActiveTab(newTab);
      onTabChange?.(newTab);
    } else if (offset < -50 && currentIndex < tabs.length - 1) {
      const newTab = tabs[currentIndex + 1]!.id;
      setActiveTab(newTab);
      onTabChange?.(newTab);
    }

    setOffset(0);
  }, [offset, activeTab, tabs, onTabChange]);

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              onTabChange?.(tab.id);
            }}
            className={cn(
              "whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="touch-pan-y"
      >
        <div
          className="transition-transform"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {activeContent}
        </div>
      </div>
    </div>
  );
}
