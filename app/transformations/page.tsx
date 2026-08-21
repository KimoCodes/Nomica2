import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import {
  TransformationCard,
  TransformationCarousel,
  StatsBar,
} from "@/components/social-proof";
import {
  TRANSFORMATIONS,
  getFeaturedTransformations,
} from "@/constants/transformations";
import { prisma } from "@/lib/prisma";
import { Star, Award, ArrowRight } from "lucide-react";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Transformations",
  description:
    "See real women's fitness transformations with NOMICA. Before & after results, success stories, and testimonials from our members.",
};

export default async function TransformationsPage() {
  const featured = getFeaturedTransformations();

  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    include: { user: { select: { name: true } }, product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

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
              Member Results
            </div>

            <h1 className="animate-slide-up stagger-1 text-4xl font-bold tracking-tight md:text-5xl">
              See What&apos;s Possible
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-slide-up stagger-2 text-lg text-muted-foreground">
              Every transformation here started with a NOMICA program.
              These are real members who transformed their bodies with NOMICA.
            </p>
          </div>
        </section>

        {/* Stats */}
        <StatsBar />

        {/* Featured Transformations - Carousel */}
        {featured.length > 0 && (
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
        )}

        {/* All Transformations */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
              All Transformations
            </h2>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              These members followed the system and got results.
            </p>

            {TRANSFORMATIONS.length > 0 ? (
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
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Transformation stories will appear here as our members share their journeys.</p>
              </div>
            )}
          </div>
        </section>

        {/* Member Reviews from DB */}
        {reviews.length > 0 && (
          <section className="px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
                What Our Members Say
              </h2>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-col rounded-2xl border border-border/50 bg-card p-6"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                    {review.title && (
                      <h3 className="font-semibold">{review.title}</h3>
                    )}
                    <p className="flex-1 text-muted-foreground">
                      &ldquo;{review.body}&rdquo;
                    </p>
                    <div className="mt-4">
                      <p className="font-semibold">
                        {review.user.name ?? "Anonymous"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {review.product.name}
                        {review.isVerified && " · Verified purchase"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Write Your Story?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join women who&apos;ve transformed their bodies
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
