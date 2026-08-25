import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import { LeadMagnetForm } from "@/components/shared/lead-magnet-form";
import { TestimonialCard } from "@/components/social-proof";
import { getProducts, getPublishedReviews } from "@/server/services/product.service";
import { getApprovedTransformations } from "@/server/services/transformation.service";
import { formatPrice } from "@/constants/subscriptions";
import {
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  TrendingUp,
  Play,
  Star,
  ChevronDown,
  Sparkles,
  Users,
  Flame,
} from "lucide-react";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "NOMICA — Premium Feminine Transformation Fitness",
  description:
    "The only fitness platform built around progressive overload science, glute-focused programming, and the confidence you deserve.",
  openGraph: {
    title: "NOMICA — Stop Scrolling. Start Sculpting.",
    description:
      "Personalized fitness coaching with progressive overload science, video demos, and real coach support.",
  },
};

const painPoints = [
  {
    emoji: "\uD83D\uDE29",
    text: '"I work out but nothing changes"',
  },
  {
    emoji: "\uD83D\uDE24",
    text: '"I see other women getting results and I\'m stuck"',
  },
  {
    emoji: "\uD83D\uDE14",
    text: '"I don\'t know what to do in the gym"',
  },
  {
    emoji: "\uD83D\uDE24",
    text: '"I\'ve tried so many programs that don\'t work"',
  },
  {
    emoji: "\uD83D\uDE29",
    text: '"I\'m scared of getting bulky"',
  },
  {
    emoji: "\uD83E\uDD37",
    text: '"I don\'t have time for this"',
  },
];

const steps = [
  {
    number: "01",
    icon: Target,
    title: "ASSESS",
    description:
      "Take the quiz \u2192 get matched to the right program for YOUR goals, level, and setup.",
  },
  {
    number: "02",
    icon: Dumbbell,
    title: "SCULPT",
    description:
      "Follow your personalized program with video demos, progressive overload, and coach support.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "TRANSFORM",
    description:
      "Track progress, upload photos, get real feedback \u2014 see the body you're building week by week.",
  },
];

const whyItWorks = [
  {
    icon: Zap,
    title: "Science-Backed Progressive Overload",
    description:
      "Every program follows proven strength & hypertrophy principles. No guessing.",
  },
  {
    icon: TrendingUp,
    title: "Progressive Overload Tracking",
    description:
      "Your weights, reps, and sets increase systematically. No plateaus.",
  },
  {
    icon: Target,
    title: "No Random Workouts",
    description:
      "Every session has a purpose. Every week builds on the last.",
  },
  {
    icon: Users,
    title: "Coach Feedback",
    description:
      "Real coaches review your form, celebrate wins, and keep you accountable.",
  },
];

const faqs = [
  {
    question: "I'm a complete beginner. Is this for me?",
    answer:
      "Yes. Every program includes beginner modifications and video demos for every exercise. You'll never feel lost.",
  },
  {
    question: "I don't have much time. How long are the workouts?",
    answer:
      "Most workouts are 30-50 minutes. We focus on quality over quantity. You'll do more in 45 focused minutes than 2 hours of random gym time.",
  },
  {
    question: "Do I need a gym membership?",
    answer:
      "Some programs require a gym, others are home-based. The quiz matches you to programs that fit YOUR setup \u2014 gym, home, or hybrid.",
  },
  {
    question: "What if I don't see results?",
    answer:
      "The system is built on progressive overload science \u2014 it's designed to produce results. Plus, with coach support, we'll troubleshoot anything that isn't working.",
  },
  {
    question: "Can I cancel my membership anytime?",
    answer:
      "Yes. No contracts. No guilt. Cancel from your dashboard with one click. Your access continues until the end of your billing period.",
  },
  {
    question: "How is this different from YouTube workouts?",
    answer:
      "YouTube gives you random workouts. NOMICA gives you a SYSTEM \u2014 progressive programming, structured overload, form feedback, and a clear path from where you are to where you want to be.",
  },
];


export default async function HomePage() {
  const products = await getProducts({ kind: "PROGRAM", take: 3 });
  const reviews = await getPublishedReviews(4);
  const transformations = await getApprovedTransformations(4);

  return (
    <PublicLayout>
      <main className="flex flex-1 flex-col">
        {/* ═══════════════════════════════════════════
            SECTION 1: HERO
            ═══════════════════════════════════════════ */}
        <section className="relative overflow-hidden px-4 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex animate-slide-up items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                  <Sparkles className="size-3.5" />
                  Built for women who want results
                </div>

                <h1 className="animate-slide-up stagger-1 text-4xl font-bold tracking-tight leading-[1.1] md:text-5xl lg:text-6xl">
                  Stop Scrolling.{" "}
                  <span className="text-gradient">Start Sculpting.</span>
                </h1>

                <p className="mt-6 max-w-lg animate-slide-up stagger-2 text-lg leading-relaxed text-muted-foreground">
                  The only fitness platform built around progressive overload
                  science, glute-focused programming, and the confidence you
                  deserve.
                </p>

                <p className="mt-2 animate-slide-up stagger-2 text-sm text-muted-foreground">
                  No random workouts. No guessing. Just a clear path to the body
                  you want.
                </p>

                <div className="mt-10 flex animate-slide-up stagger-3 flex-wrap gap-4">
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "group shadow-premium",
                    )}
                  >
                    Start My Transformation
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/quiz"
                    className={cn(
                      buttonVariants({ size: "lg", variant: "outline" }),
                    )}
                  >
                    Take the 2-Minute Quiz
                  </Link>
                </div>

                <div className="mt-8 flex animate-slide-up stagger-4 items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-warning text-warning"
                      />
                    ))}
                  </div>
                  <span>
                    Rated highly by our members
                  </span>
                </div>
              </div>

              <div className="relative animate-slide-up stagger-2">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
                <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-premium-lg">
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="flex size-16 items-center justify-center rounded-full bg-primary/20">
                        <Play className="size-8 text-primary ml-1" />
                      </div>
                      <div>
                        <p className="font-semibold">NOMICA Method Preview</p>
                        <p className="text-sm text-muted-foreground">
                          See the NOMICA method in action
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                        <Dumbbell className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Glute Sculpt Program</p>
                        <p className="text-sm text-muted-foreground">
                          12 weeks \u00B7 48 workouts \u00B7 Coach support
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 2: PROBLEM / AGITATION
            ═══════════════════════════════════════════ */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Sound Familiar?
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {painPoints.map((point, index) => (
                <div
                  key={index}
                  className={`animate-slide-up stagger-${Math.min(index + 1, 8)} rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-premium`}
                >
                  <span className="text-3xl">{point.emoji}</span>
                  <p className="mt-3 font-medium">{point.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg font-semibold text-primary">
                \u2191 This is why NOMICA exists.
              </p>
              <p className="mt-2 text-muted-foreground">
                You&apos;ve tried the random YouTube workouts. You&apos;ve
                downloaded the PDFs that collect dust. You&apos;ve watched other
                women transform while you&apos;re stuck in the same loop.
              </p>
              <p className="mt-2 font-medium">
                It&apos;s not your fault. You just never had a SYSTEM.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 3: HOW IT WORKS
            ═══════════════════════════════════════════ */}
        <section className="border-t border-border/50 px-4 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                The NOMICA Method
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                3 Steps to Start Your Transformation
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`animate-slide-up stagger-${index + 1} relative text-center`}
                >
                  <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="size-8 text-primary" />
                  </div>
                  <p className="mb-2 text-sm font-bold text-primary">
                    {step.number}
                  </p>
                  <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>

                  {index < steps.length - 1 && (
                    <div className="absolute right-0 top-8 hidden h-0.5 w-16 bg-border md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 4: PRODUCT SHOWCASE
            ═══════════════════════════════════════════ */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                Programs
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Choose Your Path
              </h2>
            </div>

            {products.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={`animate-slide-up stagger-${Math.min(index + 1, 8)} group relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg ${
                      index === 0
                        ? "border-primary shadow-premium scale-[1.02]"
                        : "border-border/50"
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute -top-3 left-6">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Dumbbell className="size-6 text-primary" />
                    </div>

                    <h3 className="text-lg font-bold">{product.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.tagline}
                    </p>

                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        {formatPrice(product.priceCents)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {" "}one-time
                      </span>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {product.features.slice(0, 4).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="size-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/programs/${product.slug}`}
                      className={cn(
                        buttonVariants({
                          variant: index === 0 ? "default" : "outline",
                        }),
                        "mt-6 w-full group/btn",
                      )}
                    >
                      Get Instant Access
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Programs coming soon. Stay tuned!
              </p>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 5: SOCIAL PROOF / TRANSFORMATIONS
            ═══════════════════════════════════════════ */}
        <section className="border-t border-border/50 px-4 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                Real Results
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Real Women. Real Transformations.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Not filtered. Not faked. Just hard work and structure.
              </p>
            </div>

            {transformations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {transformations.map((t) => (
                  <div
                    key={t.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      <div className="relative aspect-[3/4] bg-muted">
                        {t.beforePhoto ? (
                          <img
                            src={t.beforePhoto.thumbnailUrl ?? t.beforePhoto.url}
                            alt="Before"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Before
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                          Before
                        </span>
                      </div>
                      <div className="relative aspect-[3/4] bg-muted">
                        {t.afterPhoto ? (
                          <img
                            src={t.afterPhoto.thumbnailUrl ?? t.afterPhoto.url}
                            alt="After"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            After
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 rounded-full bg-primary/80 px-2 py-0.5 text-xs text-primary-foreground">
                          After
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-lg font-semibold">
                        {t.clientProfile.user.name}
                      </p>
                      {t.duration && (
                        <p className="text-sm text-muted-foreground">
                          {t.duration}
                          {t.programName ? ` · ${t.programName}` : ""}
                        </p>
                      )}

                      <blockquote className="mt-3 flex-1 text-sm text-muted-foreground">
                        &ldquo;{t.quote}&rdquo;
                      </blockquote>

                      {(t.beforeWeight || t.afterWeight) && (
                        <div className="mt-4 flex gap-4 text-sm">
                          {t.beforeWeight && (
                            <span>
                              <span className="text-muted-foreground">Start: </span>
                              <span className="font-medium">{t.beforeWeight} kg</span>
                            </span>
                          )}
                          {t.afterWeight && (
                            <span>
                              <span className="text-muted-foreground">End: </span>
                              <span className="font-medium">{t.afterWeight} kg</span>
                            </span>
                          )}
                          {t.beforeWeight && t.afterWeight && (
                            <span className="font-medium text-success">
                              -{(t.beforeWeight - t.afterWeight).toFixed(1)} kg
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {reviews.map((review) => (
                  <TestimonialCard
                    key={review.id}
                    quote={review.body}
                    name={review.user.name}
                    role={review.product.name}
                    rating={review.rating}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Transformation stories coming soon from our members.</p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 6: WHY THIS WORKS
            ═══════════════════════════════════════════ */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                Why NOMICA Works
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                When Everything Else Didn&apos;t
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {whyItWorks.map((item, index) => (
                <div
                  key={item.title}
                  className={`animate-slide-up stagger-${index + 1} flex gap-4 rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-premium`}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 7: LEAD MAGNET
            ═══════════════════════════════════════════ */}
        <section className="border-t border-border/50 px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-8 md:p-12">
              <div className="text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Flame className="size-4" />
                  FREE
                </div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  5-Day Glute Guide
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  5 days. 5 workouts. Zero commitment. Experience the NOMICA
                  method before you invest a single dollar.
                </p>

                <div className="mt-8">
                  <LeadMagnetForm />
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  \u2713 No spam \u00B7 \u2713 Unsubscribe anytime \u00B7 \u2713
                  Instant access
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 8: FAQ
            ═══════════════════════════════════════════ */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Common Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className={`animate-slide-up stagger-${Math.min(index + 1, 8)} group rounded-2xl border border-border/50 bg-card`}
                >
                  <summary className="flex cursor-pointer items-center justify-between p-6 font-medium">
                    {faq.question}
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 9: FINAL CTA
            ═══════════════════════════════════════════ */}
        <section className="border-t border-border/50 px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Your Transformation Starts Now
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              &ldquo;The best time to start was yesterday. The second best time
              is right now.&rdquo;
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/quiz"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group shadow-premium",
                )}
              >
                Take the 2-Minute Quiz
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                )}
              >
                View All Programs
              </Link>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              ★★★★★ Join women who stopped
              waiting and started transforming.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
