import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import { PRODUCTS, formatProductPrice } from "@/constants/products";
import {
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  Star,
  Flame,
  Target,
} from "lucide-react";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Browse NOMICA fitness programs — glute sculpt, beginner guides, stairmaster routines, and more. Science-backed progressive overload programming.",
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  PROGRAM: Dumbbell,
  CHALLENGE: Flame,
  TRACKER: Target,
};

export default function ProgramsPage() {
  return (
    <PublicLayout>
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          </div>

          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-6 inline-flex animate-slide-up items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Dumbbell className="size-3.5" />
              All Programs
            </div>

            <h1 className="animate-slide-up stagger-1 text-4xl font-bold tracking-tight md:text-5xl">
              Choose Your <span className="text-gradient">Path</span>
            </h1>

            <p className="mt-4 animate-slide-up stagger-2 text-lg text-muted-foreground">
              Structured programs designed to deliver real results. Every rep has
              a purpose.
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-8">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Programs", value: PRODUCTS.length.toString() },
              { label: "Workouts", value: "120+" },
              { label: "Women Transformed", value: "2,400+" },
              { label: "Satisfaction", value: "4.9/5" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`animate-slide-up stagger-${index + 1} text-center`}
              >
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {PRODUCTS.map((product, index) => {
                const Icon = categoryIcons[product.category] ?? Dumbbell;

                return (
                  <Link
                    key={product.id}
                    href={`/programs/${product.slug}`}
                    className={`animate-slide-up stagger-${Math.min(index + 1, 8)} group relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg ${
                      product.id === "glute-sculpt-12wk"
                        ? "border-primary shadow-premium scale-[1.02]"
                        : "border-border/50"
                    }`}
                  >
                    {product.id === "glute-sculpt-12wk" && (
                      <div className="absolute -top-3 left-6">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <Icon className="size-6 text-primary" />
                      </div>
                      <div>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {product.category}
                        </span>
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {product.level}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold">{product.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.tagline}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        {formatProductPrice(product.price)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatProductPrice(product.originalPrice)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>\u23F1 {product.duration}</span>
                      <span>\u2699 {product.commitment}</span>
                    </div>

                    <ul className="mt-4 flex-1 space-y-2">
                      {product.features.slice(0, 4).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="size-3.5 fill-warning text-warning" />
                        4.9
                      </span>
                      <span className="text-muted-foreground">\u00B7</span>
                      <span className="text-sm text-muted-foreground">
                        {product.highlights[0]?.value}
                      </span>
                    </div>

                    <div className="mt-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        View Program
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Not Sure Which Program?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Take our 2-minute quiz and we&apos;ll match you to the perfect
              program based on your goals, experience, and setup.
            </p>
            <Link
              href="/quiz"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 group shadow-premium",
              )}
            >
              Take the Quiz
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
