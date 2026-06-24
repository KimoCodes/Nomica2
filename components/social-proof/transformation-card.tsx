import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { Transformation } from "@/constants/transformations";

type TransformationCardProps = {
  transformation: Transformation;
  variant?: "featured" | "compact" | "detailed";
};

export function TransformationCard({
  transformation,
  variant = "featured",
}: TransformationCardProps) {
  const t = transformation;

  if (variant === "compact") {
    return (
      <Link
        href={`/transformations/${t.id}`}
        className="group flex flex-col rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
      >
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
              {t.age} · {t.location}
            </p>
          </div>
        </div>

        <blockquote className="mt-3 flex-1 text-sm text-muted-foreground">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {t.duration} · {t.program}
          </span>
          <span className="font-medium text-primary group-hover:underline">
            Read →
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "detailed") {
    return (
      <Link
        href={`/transformations/${t.id}`}
        className="group flex flex-col rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg"
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

        <div className="mt-3">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {t.program}
          </span>
        </div>

        <blockquote className="mt-3 flex-1 text-sm text-muted-foreground">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        {/* Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-lg font-bold text-primary">+{t.gluteIncrease}&quot;</p>
            <p className="text-xs text-muted-foreground">Glute Growth</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-lg font-bold text-success">
              -{t.beforeWeight - t.afterWeight} lbs
            </p>
            <p className="text-xs text-muted-foreground">Weight Lost</p>
          </div>
        </div>

        <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
          Read Full Story →
        </span>
      </Link>
    );
  }

  // Default: featured
  return (
    <Link
      href={`/transformations/${t.id}`}
      className="group flex flex-col rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
        {t.name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>

      <h3 className="text-lg font-bold">{t.name}</h3>
      <p className="text-sm text-muted-foreground">
        {t.age} years old · {t.location}
      </p>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {t.program}
        </span>
      </div>

      <blockquote className="mt-4 flex-1 text-sm text-muted-foreground">
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-lg font-bold text-primary">+{t.gluteIncrease}&quot;</p>
          <p className="text-xs text-muted-foreground">Glute Growth</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-lg font-bold text-success">
            -{t.beforeWeight - t.afterWeight} lbs
          </p>
          <p className="text-xs text-muted-foreground">Weight Lost</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BadgeCheck className="size-3.5 text-primary" />
          Verified transformation
        </div>
        <span className="text-sm font-medium text-primary group-hover:underline">
          Read →
        </span>
      </div>
    </Link>
  );
}
