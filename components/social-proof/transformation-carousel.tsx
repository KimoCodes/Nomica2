"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import type { Transformation } from "@/constants/transformations";

type TransformationCarouselProps = {
  transformations: Transformation[];
};

export function TransformationCarousel({
  transformations,
}: TransformationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    // Update current index based on scroll position
    const cardWidth = 424; // min-w + gap
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(newIndex, transformations.length - 1));
  }, [transformations.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    updateScrollButtons();
    return () => el.removeEventListener("scroll", updateScrollButtons);
  }, [updateScrollButtons]);

  const scrollTo = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstChild
      ? (scrollRef.current.firstChild as HTMLElement).offsetWidth + 24
      : 300;
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scrollTo("left")}
          className="absolute -left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-card shadow-premium transition-all hover:bg-muted"
          aria-label="Previous transformation"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollTo("right")}
          className="absolute -right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-card shadow-premium transition-all hover:bg-muted"
          aria-label="Next transformation"
        >
          <ChevronRight className="size-5" />
        </button>
      )}

      {/* Carousel Scroll Container */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {transformations.map((t) => (
          <Link
            key={t.id}
            href={`/transformations/${t.id}`}
            className="group flex min-w-[320px] max-w-[360px] snap-center flex-col rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg md:min-w-[400px]"
          >
            {/* Before/After Placeholder */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                Before
              </div>
              <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-primary/10 text-sm text-primary">
                After
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {t.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {t.age} years old · {t.location}
                </p>
              </div>
            </div>

            {/* Program Badge */}
            <div className="mt-3">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {t.program}
              </span>
            </div>

            {/* Quote */}
            <blockquote className="mt-4 flex-1 text-sm text-muted-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-lg font-bold text-primary">
                  +{t.gluteIncrease}&quot;
                </p>
                <p className="text-xs text-muted-foreground">Glute Growth</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-lg font-bold text-success">
                  -{t.beforeWeight - t.afterWeight} lbs
                </p>
                <p className="text-xs text-muted-foreground">Weight Lost</p>
              </div>
            </div>

            {/* Verification */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BadgeCheck className="size-3.5 text-primary" />
                Verified transformation
              </div>
              <span className="text-sm font-medium text-primary group-hover:underline">
                Read Story →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="mt-6 flex justify-center gap-2">
        {transformations.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!scrollRef.current) return;
              const cardWidth = 424; // min-w + gap
              scrollRef.current.scrollTo({
                left: index * cardWidth,
                behavior: "smooth",
              });
            }}
            className={`size-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-primary w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to transformation ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
