"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import {
  CLUB_TIERS,
  CLUB_FEATURES_HIGHLIGHT,
  formatClubPrice,
} from "@/constants/club";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Video,
  Dumbbell,
  Heart,
  Sparkles,
  Shield,
  Star,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Video,
  Dumbbell,
  Heart,
};

export default function ClubPage() {
  const [annual, setAnnual] = useState(false);

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
              <Sparkles className="size-3.5" />
              Join the Sculpt Club
            </div>

            <h1 className="animate-slide-up stagger-1 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Your Transformation{" "}
              <span className="text-gradient">Starts Here</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-slide-up stagger-2 text-lg text-muted-foreground">
              Join a community of women who are building confidence, sculpting
              their bodies, and supporting each other every step of the way.
            </p>

            <div className="mt-8 animate-slide-up stagger-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="#pricing"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group shadow-premium",
                )}
              >
                Join the Club
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

            {/* Social Proof */}
            <div className="mt-12 animate-slide-up stagger-4 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="size-8 rounded-full border-2 border-background bg-muted"
                    />
                  ))}
                </div>
                <span>2,400+ members</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-primary text-primary" />
                <span>4.9 rating</span>
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

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {CLUB_FEATURES_HIGHLIGHT.map((feature, index) => {
                const Icon = iconMap[feature.icon] || Dumbbell;
                return (
                  <div
                    key={feature.title}
                    className={`animate-slide-up stagger-${index + 1} rounded-2xl border border-border/50 bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-premium`}
                  >
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="size-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
              What Members Say
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  quote:
                    "I've tried so many programs, but Sculpt Club is the first time I actually stuck with it. The community keeps me accountable.",
                  name: "Sarah K.",
                  role: "Member for 8 months",
                },
                {
                  quote:
                    "The 1-on-1 coaching calls are incredible. Having someone check in on my form and adjust my program made all the difference.",
                  name: "Jasmine M.",
                  role: "Sculpt Pro member",
                },
                {
                  quote:
                    "I went from barely doing a bodyweight squat to deadlifting 200lbs. The progressive programming actually works.",
                  name: "Michelle R.",
                  role: "Member for 1 year",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className={`animate-slide-up stagger-${index + 1} rounded-2xl border border-border/50 bg-card p-6`}
                >
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="size-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Toggle */}
        <section
          id="pricing"
          className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
              Choose Your Plan
            </h2>
            <p className="mb-8 text-center text-lg text-muted-foreground">
              Cancel anytime. No long-term commitments.
            </p>

            {/* Annual/Monthly Toggle */}
            <div className="mb-12 flex items-center justify-center gap-3">
              <span
                className={`text-sm ${!annual ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setAnnual(!annual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  annual ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white transition-transform ${
                    annual ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm ${annual ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                Annual
              </span>
              {annual && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                  Save 2 months
                </span>
              )}
            </div>

            {/* Tier Cards */}
            <div className="grid gap-8 md:grid-cols-2">
              {CLUB_TIERS.map((tier, index) => (
                <div
                  key={tier.id}
                  className={`animate-slide-up stagger-${index + 1} relative flex flex-col rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium ${
                    tier.highlight
                      ? "border-primary shadow-premium-lg scale-[1.02]"
                      : "border-border/50"
                  }`}
                >
                  <div className="mb-6">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        tier.highlight
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="mt-1 text-muted-foreground">{tier.tagline}</p>

                  <div className="mt-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {formatClubPrice(
                          annual ? tier.yearlyMonthly : tier.monthlyPrice,
                        )}
                      </span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    {annual && (
                      <p className="mt-1 text-sm text-success">
                        Billed {formatClubPrice(tier.yearlyPrice)}/year (save{" "}
                        {formatClubPrice(tier.yearlySavings)})
                      </p>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    {tier.description}
                  </p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {tier.features
                      .filter((f) => f.included)
                      .map((feature) => (
                        <li
                          key={feature.name}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          <div>
                            <span className="text-sm">{feature.name}</span>
                            <p className="text-xs text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </li>
                      ))}
                  </ul>

                  <Link
                    href={`/register?club=${tier.id}&annual=${annual}`}
                    className={cn(
                      buttonVariants({
                        variant: tier.highlight ? "default" : "outline",
                        size: "lg",
                      }),
                      "mt-8 w-full group",
                    )}
                  >
                    Join {tier.name}
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
              Compare Plans
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="pb-4 text-left font-medium text-muted-foreground">
                      Feature
                    </th>
                    <th className="pb-4 text-center font-medium text-muted-foreground">
                      Sculpt
                    </th>
                    <th className="pb-4 text-center font-medium text-muted-foreground">
                      Sculpt Pro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Private community",
                      sculpt: true,
                      pro: true,
                    },
                    {
                      name: "Weekly live Q&A",
                      sculpt: true,
                      pro: true,
                    },
                    {
                      name: "Monthly workout drops",
                      sculpt: true,
                      pro: true,
                    },
                    {
                      name: "Form check library",
                      sculpt: true,
                      pro: true,
                    },
                    {
                      name: "Community challenges",
                      sculpt: true,
                      pro: true,
                    },
                    {
                      name: "Coach feedback on check-ins",
                      sculpt: false,
                      pro: true,
                    },
                    {
                      name: "1-on-1 video calls",
                      sculpt: false,
                      pro: true,
                    },
                    {
                      name: "Custom programming",
                      sculpt: false,
                      pro: true,
                    },
                    {
                      name: "Nutrition guidance",
                      sculpt: false,
                      pro: true,
                    },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-3 font-medium">{row.name}</td>
                      <td className="py-3 text-center">
                        {row.sculpt ? (
                          <CheckCircle2 className="mx-auto size-4 text-primary" />
                        ) : (
                          <span className="text-muted-foreground/30">\u2014</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {row.pro ? (
                          <CheckCircle2 className="mx-auto size-4 text-primary" />
                        ) : (
                          <span className="text-muted-foreground/30">\u2014</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Guarantee */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="size-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              30-Day Money-Back Guarantee
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Try the Sculpt Club risk-free. If you&apos;re not satisfied within
              30 days, we&apos;ll refund your membership. No questions asked.
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
              {[
                {
                  q: "Can I switch between Sculpt and Sculpt Pro?",
                  a: "Yes. You can upgrade or downgrade anytime. If you upgrade, you'll get immediate access to Pro features. If you downgrade, it takes effect at the end of your billing cycle.",
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
                  q: "How do the 1-on-1 coaching calls work?",
                  a: "Sculpt Pro members get one 30-minute video call per month with a certified coach. We'll review your progress, discuss your goals, and adjust your programming as needed.",
                },
                {
                  q: "What if I'm a complete beginner?",
                  a: "The Sculpt Club is perfect for beginners. Our community is welcoming, our coaches are patient, and our programming scales from beginner to advanced.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-card p-5"
                >
                  <h3 className="font-semibold">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Join the Club?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of women who are transforming their bodies and
              building confidence with the Sculpt Club.
            </p>
            <Link
              href="#pricing"
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
