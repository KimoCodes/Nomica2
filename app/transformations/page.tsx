import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import {
  TransformationCard,
  TransformationCarousel,
  StatsBar,
  TestimonialCard,
} from "@/components/social-proof";
import {
  TRANSFORMATIONS,
  TESTIMONIALS,
  getFeaturedTransformations,
} from "@/constants/transformations";
import { ArrowRight, Award } from "lucide-react";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Transformations",
  description:
    "See real women's fitness transformations with NOMICA. Before & after results, success stories, and testimonials from 4,500+ members.",
};

export default function TransformationsPage() {
  const featured = getFeaturedTransformations();

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
              <Award className="size-3.5" />
              Real Results
            </div>

            <h1 className="animate-slide-up stagger-1 text-4xl font-bold tracking-tight md:text-5xl">
              Real Women.{" "}
              <span className="text-gradient">Real Transformations.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-slide-up stagger-2 text-lg text-muted-foreground">
              See what&apos;s possible with the right program and support.
              These are real members who transformed their bodies with NOMICA.
            </p>
          </div>
        </section>

        {/* Stats */}
        <StatsBar />

        {/* Featured Transformations - Carousel */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
              Featured Transformations
            </h2>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              These members achieved incredible results with NOMICA programs
            </p>

            <TransformationCarousel transformations={featured} />
          </div>
        </section>

        {/* All Transformations */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
              All Transformations
            </h2>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              Every transformation is a story of dedication and consistency
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TRANSFORMATIONS.map((t, index) => (
                <div
                  key={t.id}
                  className={`animate-slide-up stagger-${(index % 6) + 1}`}
                >
                  <TransformationCard
                    transformation={t}
                    variant="compact"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
              What Our Members Say
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map((testimonial, index) => (
                <div
                  key={index}
                  className={`animate-slide-up stagger-${(index % 6) + 1}`}
                >
                  <TestimonialCard
                    quote={testimonial.quote}
                    name={testimonial.name}
                    role={testimonial.role}
                    rating={testimonial.rating}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Write Your Story?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of women who&apos;ve transformed their bodies
              with NOMICA. Your transformation starts today.
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
                href="/programs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
              >
                View Programs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
