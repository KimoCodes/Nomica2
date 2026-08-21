import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import { PLANS, formatPlanPrice } from "@/constants/subscriptions";
import { CheckCircle2, ArrowRight, Shield, Star } from "lucide-react";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "NOMICA All Access Membership",
  description:
    "Get unlimited access to every NOMICA program, challenge, and workout for one low monthly price. Cancel anytime.",
};

const features = [
  "Every signature program & challenge",
  "New monthly workouts",
  "Workout calendars",
  "Progress trackers",
  "Cancel anytime",
];

const faqs = [
  {
    q: "Can I cancel my membership anytime?",
    a: "Yes. No contracts. No guilt. Cancel from your dashboard with one click. Your access continues until the end of your billing period.",
  },
  {
    q: "What programs are included?",
    a: "All of them. Every signature program, every challenge, every workout. The complete NOMICA catalog.",
  },
  {
    q: "How do the weekly live sessions work?",
    a: "We host live Q&A calls every Tuesday at 7PM EST on Zoom. You can ask questions in real-time, watch other members' questions, or just listen in. All sessions are recorded and available for replay.",
  },
  {
    q: "Is there a contract or commitment?",
    a: "No. You can cancel anytime. Monthly plans cancel at the end of the current month. Annual plans can be cancelled but refunds are prorated after 30 days.",
  },
  {
    q: "What if I'm a complete beginner?",
    a: "The All Access membership is perfect for beginners. Our community is welcoming, our coaches are patient, and our programming scales from beginner to advanced.",
  },
  {
    q: "How is this different from buying individual programs?",
    a: "Individual programs give you lifetime access to that specific program. All Access gives you everything — including new workouts added every month — for one low price.",
  },
];

export default function ClubPage() {
  const monthly = PLANS.find((p) => p.id === "ALL_ACCESS_MONTHLY")!;
  const annual = PLANS.find((p) => p.id === "ALL_ACCESS_ANNUAL")!;

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
              All Access Membership
            </div>

            <h1 className="animate-slide-up stagger-1 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Your Transformation{" "}
              <span className="text-gradient">Starts Here</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-slide-up stagger-2 text-lg text-muted-foreground">
              Every program. Every challenge. Every workout. One membership.
              Cancel anytime.
            </p>

            <div className="mt-8 animate-slide-up stagger-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group shadow-premium",
                )}
              >
                Join All Access
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#features"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
              >
                See What&apos;s Included
              </Link>
            </div>

            <div className="mt-12 animate-slide-up stagger-4 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-primary text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
              What You Get
            </h2>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              Everything you need to transform your body and mindset
            </p>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className={`animate-slide-up stagger-${index + 1} flex items-start gap-4 rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium`}
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">{feature}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
              Choose Your Plan
            </h2>
            <p className="mb-8 text-center text-lg text-muted-foreground">
              Cancel anytime. No long-term commitments.
            </p>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Monthly */}
              <div className="relative flex flex-col rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium">
                <h3 className="text-2xl font-bold">{monthly.name}</h3>
                <p className="mt-1 text-muted-foreground">
                  {monthly.description}
                </p>

                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {formatPlanPrice(monthly)}
                    </span>
                  </div>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {monthly.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${monthly.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "mt-8 w-full group",
                  )}
                >
                  Get Monthly
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Annual (Highlighted) */}
              <div className="relative flex flex-col rounded-2xl border border-primary shadow-premium-lg bg-card p-8 scale-[1.02] transition-all duration-300">
                <div className="absolute -top-3 left-6">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {annual.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-bold">Annual Membership</h3>
                <p className="mt-1 text-muted-foreground">
                  {annual.description}
                </p>

                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {formatPlanPrice(annual)}
                    </span>
                  </div>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {annual.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${annual.id}`}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-8 w-full group shadow-premium",
                  )}
                >
                  Get Annual
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantee */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="size-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              30-Day Money-Back Guarantee
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Try NOMICA risk-free. If you&apos;re not satisfied within 30
              days, we&apos;ll refund your membership. No questions asked.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border/50 bg-card"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold">
                    {item.q}
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Start Your Transformation?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join women who are transforming their bodies and
              building confidence with NOMICA.
            </p>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 group shadow-premium",
              )}
            >
              Get Started Today
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
