import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import { getBundleProducts } from "@/server/services/product.service";
import { formatPrice } from "@/constants/subscriptions";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Bundles",
  description:
    "Save big with NOMICA program bundles. Get multiple fitness programs at a discounted price — up to 30% off.",
};

export default async function BundlesPage() {
  const bundles = await getBundleProducts();

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
              <Package className="size-3.5" />
              Bundle & Save
            </div>

            <h1 className="animate-slide-up stagger-1 text-4xl font-bold tracking-tight md:text-5xl">
              More Programs.{" "}
              <span className="text-gradient">Better Price.</span>
            </h1>

            <p className="mt-4 animate-slide-up stagger-2 text-lg text-muted-foreground">
              Save up to 30% when you bundle programs together. Get everything
              you need in one purchase.
            </p>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                title: "Save Up to 30%",
                description: "Bundles cost less than buying programs separately",
              },
              {
                icon: Package,
                title: "Everything Included",
                description: "All programs, all workouts, all features included",
              },
              {
                icon: Sparkles,
                title: "Instant Access",
                description: "Start immediately after purchase. No waiting.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`animate-slide-up stagger-${index + 1} flex items-center gap-4`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bundle Grid */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            {bundles.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-3">
                {bundles.map((bundle, index) => {
                const savings = bundle.compareAtCents
                  ? bundle.compareAtCents - bundle.priceCents
                  : 0;
                const savingsPercent = bundle.compareAtCents
                  ? Math.round(
                      ((bundle.compareAtCents - bundle.priceCents) /
                        bundle.compareAtCents) *
                        100,
                    )
                  : 0;

                return (
                  <Link
                    key={bundle.id}
                    href={`/bundles/${bundle.slug}`}
                    className={`animate-slide-up stagger-${index + 1} group relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg ${
                      index === 0
                        ? "border-primary shadow-premium scale-[1.02]"
                        : "border-border/50"
                    }`}
                  >
                    <div className="mb-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          index === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index === 0 ? "BEST VALUE" : "BUNDLE"}
                      </span>
                    </div>

                    {/* Stacked Cards Visual */}
                    <div className="relative mb-6 h-24">
                      {(bundle.bundleItems ?? [])
                        .slice(0, 3)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="absolute left-0 right-4 rounded-xl border border-border/50 bg-muted/50"
                            style={{
                              top: `${i * 12}px`,
                              height: "48px",
                              zIndex: 3 - i,
                            }}
                          />
                        ))}
                    </div>

                    <h2 className="text-xl font-bold">{bundle.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {bundle.tagline}
                    </p>

                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {bundle.description}
                    </p>

                    <div className="mt-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                          {formatPrice(bundle.priceCents)}
                        </span>
                        {bundle.compareAtCents && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(bundle.compareAtCents)}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <p className="mt-1 text-sm font-medium text-success">
                          Save {formatPrice(savings)} ({savingsPercent}% off)
                        </p>
                      )}
                    </div>

                    {/* Products Included */}
                    <div className="mt-6 flex-1">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Includes:
                      </p>
                      <ul className="space-y-2">
                        {(bundle.bundleItems ?? []).map((bi) => (
                          <li
                            key={bi.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                            {bi.item.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6">
                      <span
                        className={cn(
                          buttonVariants({
                            variant: index === 0 ? "default" : "outline",
                          }),
                          "w-full group/btn",
                        )}
                      >
                        Get the Bundle
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover/btn:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Package className="mx-auto mb-4 size-12 text-muted-foreground/30" />
                <p>Bundles will appear here once they are published.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Not Sure Which Bundle?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Take our 2-minute quiz and we&apos;ll match you to the perfect
              bundle based on your goals and experience.
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
