import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import {
  TRANSFORMATIONS,
  getTransformationById,
} from "@/constants/transformations";
import {
  ArrowRight,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  Dumbbell,
} from "lucide-react";

export const runtime = "nodejs";

export function generateStaticParams() {
  return TRANSFORMATIONS.map((t) => ({ id: t.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const transformation = getTransformationById(id);
  if (!transformation) return { title: "Transformation Not Found" };
  return {
    title: `${transformation.name}'s Transformation`,
    description: transformation.quote,
  };
}

export default async function TransformationDetailPage({ params }: Props) {
  const { id } = await params;
  const transformation = getTransformationById(id);

  if (!transformation) notFound();

  const t = transformation;

  return (
    <PublicLayout>
      <main className="flex flex-1 flex-col">
        {/* Breadcrumb */}
        <div className="border-b border-border/50 px-4 py-3">
          <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <Link
              href="/transformations"
              className="transition-colors hover:text-foreground"
            >
              Transformations
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{t.name}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {t.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            <h1 className="animate-slide-up text-4xl font-bold tracking-tight md:text-5xl">
              {t.name}&apos;s Transformation
            </h1>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {t.age} years old
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {t.location}
              </span>
              <span className="flex items-center gap-1">
                <Dumbbell className="size-4" />
                {t.program}
              </span>
            </div>

            <blockquote className="mx-auto mt-8 max-w-2xl text-xl text-muted-foreground italic">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-12">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {t.stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`animate-slide-up stagger-${index + 1} rounded-xl border border-border/50 bg-card p-4 text-center`}
              >
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Before/After Visual */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
              The Numbers
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Before */}
              <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Before
                </p>
                <p className="mt-4 text-5xl font-bold">{t.beforeWeight} lbs</p>
                <p className="mt-2 text-muted-foreground">Starting weight</p>
              </div>

              {/* After */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  After {t.duration}
                </p>
                <p className="mt-4 text-5xl font-bold text-primary">
                  {t.afterWeight} lbs
                </p>
                <p className="mt-2 text-muted-foreground">Current weight</p>
              </div>
            </div>

            {/* Glute Growth Highlight */}
            <div className="mt-8 rounded-2xl border border-border/50 bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="size-8 text-success" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Glute Growth
              </p>
              <p className="mt-4 text-6xl font-bold text-success">
                +{t.gluteIncrease}&quot;
              </p>
              <p className="mt-2 text-muted-foreground">
                Measured at the widest point
              </p>
            </div>
          </div>
        </section>

        {/* Full Story */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
              The Full Story
            </h2>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-lg leading-relaxed">{t.story}</p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
              {t.name}&apos;s Top Tips
            </h2>

            <div className="space-y-4">
              {t.tips.map((tip, i) => (
                <div
                  key={i}
                  className={`animate-slide-up stagger-${i + 1} flex items-start gap-4 rounded-xl border border-border/50 bg-card p-5`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Program Used */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Program Used
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              {t.program}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start the same program that helped {t.name.split(" ")[0]} achieve
              these results.
            </p>
            <Link
              href="/programs"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 group shadow-premium",
              )}
            >
              View Programs
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Start Your Transformation?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Take our quiz to find the perfect program for your goals.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/quiz"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group shadow-premium",
                )}
              >
                Take the Quiz
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/transformations"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
              >
                More Transformations
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
