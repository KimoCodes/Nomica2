import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { PublicLayout } from "@/components/shared/public-layout";
import { PLANS, formatPrice } from "@/constants/subscriptions";
import { BUNDLES, formatBundlePrice } from "@/constants/bundles";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose your NOMICA transformation path. Starter, Premium, or Elite — cancel anytime. Plans from $29/mo.",
};

export default function PricingPage() {
  return (
    <PublicLayout>
      <main className="flex-1 mx-auto max-w-6xl px-4 py-12">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            Pricing
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that matches your coaching needs
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <Card
              key={plan.id}
              className={cn(
                `animate-slide-up stagger-${index + 1} relative flex flex-col transition-all duration-300`,
                plan.highlighted
                  ? "border-primary shadow-premium-lg scale-[1.02]"
                  : "hover:shadow-premium hover:-translate-y-1",
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    {plan.badge}
                  </span>
                </div>
              )}

              <CardHeader className="pb-4 pt-8">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="pt-4">
                  <span className="text-4xl font-bold tracking-tight">
                    {formatPrice(plan.monthlyPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <ul className="space-y-3">
                  {plan.features.filter(f => f.included).map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      <span className="text-sm">{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-8">
                <Link
                  href={`/register?plan=${plan.id}`}
                  className={cn(
                    buttonVariants({
                      variant: plan.highlighted ? "default" : "outline",
                    }),
                    "w-full group",
                  )}
                >
                  Get started
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Bundles Section */}
        <div className="mt-24 mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-sm font-medium text-secondary">
            <Package className="size-3.5" />
            Save with Bundles
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Want Programs Instead?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One-time purchase. Lifetime access. No subscriptions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {BUNDLES.map((bundle, index) => (
            <Link
              key={bundle.id}
              href={`/bundles/${bundle.slug}`}
              className={cn(
                `animate-slide-up stagger-${index + 1} group relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium`,
                bundle.highlight
                  ? "border-primary shadow-premium scale-[1.02]"
                  : "border-border/50",
              )}
            >
              {bundle.badge && (
                <div className="mb-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      bundle.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {bundle.badge}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold">{bundle.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {bundle.tagline}
              </p>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {formatBundlePrice(bundle.price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatBundlePrice(bundle.originalPrice)}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-success">
                  Save {formatBundlePrice(bundle.savings)} (
                  {bundle.savingsPercent}% off)
                </p>
              </div>

              <ul className="mt-4 flex-1 space-y-2">
                {bundle.features.slice(0, 3).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <span
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-4 w-full group/btn",
                )}
              >
                View Bundle
                <ArrowRight className="ml-2 size-4 transition-transform group-hover/btn:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/bundles"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "group",
            )}
          >
            View All Bundles
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </main>
    </PublicLayout>
  );
}
