"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import { sendFreeGuideAction } from "@/actions/free-guide.actions";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Mail,
  Target,
  Dumbbell,
  Heart,
  Zap,
  Loader2,
} from "lucide-react";

export default function FreeGuidePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("email", email);

    const result = await sendFreeGuideAction(formData);

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <PublicLayout>
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex animate-slide-up items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                  <Download className="size-3.5" />
                  Free Guide
                </div>

                <h1 className="animate-slide-up stagger-1 text-4xl font-bold tracking-tight md:text-5xl">
                  5-Day Glute{" "}
                  <span className="text-gradient">Activation Guide</span>
                </h1>

                <p className="mt-6 animate-slide-up stagger-2 text-lg text-muted-foreground">
                  The perfect starting point for building stronger, rounder
                  glutes. 5 days of targeted exercises to wake up your muscles
                  and build a foundation.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    "5 days of guided glute activation exercises",
                    "Video tutorials for every movement",
                    "Progress tracking worksheet",
                    "Nutrition tips for muscle growth",
                    "No equipment needed — bodyweight only",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className={`animate-slide-up stagger-${i + 3} flex items-start gap-3`}
                    >
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 animate-slide-up stagger-8 flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Free download — trusted by our community
                  </p>
                </div>
              </div>

              {/* Form Card */}
              <div className="animate-slide-up stagger-2">
                <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-premium">
                  {submitted ? (
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle2 className="size-8 text-success" />
                      </div>
                      <h3 className="text-xl font-bold">
                        Check Your Inbox!
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        We&apos;ve sent the 5-Day Glute Guide to{" "}
                        <span className="font-medium">{email}</span>
                      </p>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Don&apos;t see it? Check your spam folder or promotions
                        tab.
                      </p>
                      <Link
                        href="/quiz"
                        className={cn(
                          buttonVariants({ size: "lg" }),
                          "mt-6 w-full group",
                        )}
                      >
                        Take the Quiz While You Wait
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                          <Download className="size-7 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">
                          Get the Free Guide
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Enter your email and we&apos;ll send it instantly
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                          <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                          </div>
                        )}
                        <div>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            aria-label="Email address"
                            className="h-12 text-center"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className={cn(
                            buttonVariants({ size: "lg" }),
                            "w-full group shadow-premium",
                          )}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Me the Guide
                              <Mail className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                            </>
                          )}
                        </button>
                      </form>

                      <p className="mt-4 text-center text-xs text-muted-foreground">
                        Free. No spam. Unsubscribe anytime.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Inside */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
              What&apos;s Inside the Guide
            </h2>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              Everything you need to start building stronger glutes
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Target,
                  title: "Day 1-2: Activation",
                  description:
                    "Wake up dormant glute muscles with targeted isolation exercises",
                },
                {
                  icon: Dumbbell,
                  title: "Day 3-4: Building",
                  description:
                    "Progress to compound movements that build strength and size",
                },
                {
                  icon: Zap,
                  title: "Day 5: Challenge",
                  description:
                    "Put it all together with a high-intensity glute workout",
                },
                {
                  icon: Heart,
                  title: "Bonus: Recovery",
                  description:
                    "Stretching and mobility routines to keep your glutes healthy",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={`animate-slide-up stagger-${index + 1} rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium`}
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
              This Guide Is Perfect If You...
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                "Want to build your glutes but don't know where to start",
                "Have been training but your glutes aren't growing",
                "Feel like your glutes are \"asleep\" during workouts",
                "Want a structured plan before investing in a full program",
                "Prefer bodyweight exercises you can do at home",
                "Want to learn proper form before hitting the gym",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Start?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get the free guide and start building stronger glutes today.
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
                View All Programs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
