import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import { BUNDLES, getBundleBySlug, getBundleProducts, formatBundlePrice } from "@/constants/bundles";
import { formatProductPrice } from "@/constants/products";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Package,
  Shield,
} from "lucide-react";

export const runtime = "nodejs";

export function generateStaticParams() {
  return BUNDLES.map((b) => ({ slug: b.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = getBundleBySlug(slug);
  if (!bundle) return { title: "Bundle Not Found" };
  return {
    title: bundle.name,
    description: bundle.tagline,
  };
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;
  const bundle = getBundleBySlug(slug);

  if (!bundle) notFound();

  const products = getBundleProducts(bundle);

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
              href="/bundles"
              className="transition-colors hover:text-foreground"
            >
              Bundles
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{bundle.name}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                  <Package className="size-3.5" />
                  {bundle.badge}
                </div>

                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {bundle.name}
                </h1>

                <p className="mt-2 text-lg text-muted-foreground">
                  {bundle.tagline}
                </p>

                <p className="mt-4 text-muted-foreground">
                  {bundle.description}
                </p>

                {/* Pricing */}
                <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold">
                      {formatBundlePrice(bundle.price)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatBundlePrice(bundle.originalPrice)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-success">
                    Save {formatBundlePrice(bundle.savings)} (
                    {bundle.savingsPercent}% off)
                  </p>

                  <Link
                    href={`/register?bundle=${bundle.slug}`}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "mt-6 w-full group shadow-premium",
                    )}
                  >
                    Get the Bundle
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    <Shield className="mr-1 inline-block size-3" />
                    30-day money-back guarantee
                  </p>
                </div>
              </div>

              {/* Stacked Cards Visual */}
              <div className="relative hidden md:block">
                <div className="relative h-80">
                  {products.map((product, i) => (
                    <div
                      key={product?.id}
                      className="absolute right-0 left-8 rounded-2xl border border-border/50 bg-gradient-to-br from-muted/80 to-muted/40 p-4 shadow-sm transition-all hover:scale-[1.02]"
                      style={{
                        top: `${i * 24}px`,
                        height: "120px",
                        width: `${100 - i * 8}%`,
                        zIndex: products.length - i,
                      }}
                    >
                      <p className="font-semibold">{product?.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product?.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Included */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-3xl font-bold tracking-tight">
              What&apos;s Inside
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <div
                  key={product?.id}
                  className={`animate-slide-up stagger-${index + 1} rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Dumbbell className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">{product?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product?.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {product?.duration}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">
                      {product?.commitment}
                    </span>
                  </div>

                  <div className="mt-3 text-sm font-medium text-primary">
                    Value: {formatProductPrice(product?.originalPrice ?? 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-3xl font-bold tracking-tight">
              Bundle Features
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bundle.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Breakdown */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
              Value Breakdown
            </h2>

            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product?.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4"
                >
                  <span className="font-medium">{product?.name}</span>
                  <span className="text-muted-foreground line-through">
                    {formatProductPrice(product?.originalPrice ?? 0)}
                  </span>
                </div>
              ))}

              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Total Value</span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatBundlePrice(bundle.originalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Bundle Price</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatBundlePrice(bundle.price)}
                  </span>
                </div>
                <div className="mt-2 text-right text-sm font-medium text-success">
                  You Save {formatBundlePrice(bundle.savings)} (
                  {bundle.savingsPercent}% off)
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href={`/register?bundle=${bundle.slug}`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group shadow-premium",
                )}
              >
                Get the Bundle
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Guarantee */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="size-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              30-Day Money-Back Guarantee
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Try any bundle risk-free. If you&apos;re not satisfied within 30
              days, we&apos;ll refund your purchase. No questions asked.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: "Do I get lifetime access to all programs in the bundle?",
                  a: "Yes. Once you purchase a bundle, you own all programs forever. No subscriptions, no recurring fees.",
                },
                {
                  q: "Can I buy a bundle as a gift?",
                  a: "Absolutely. After purchase, you can share the program access with anyone using their email address.",
                },
                {
                  q: "What if I only want one program from a bundle?",
                  a: "You can buy any program individually on the Programs page. Bundles are for when you want multiple programs at a discount.",
                },
                {
                  q: "Are there payment plans available?",
                  a: "Not currently, but we're working on it. For now, bundles are one-time purchases with instant full access.",
                },
                {
                  q: "What equipment do I need?",
                  a: "It varies by program. Most require basic gym equipment (barbell, dumbbells, cable machine). Each program lists specific equipment needs.",
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
              Ready to Transform?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of women who&apos;ve transformed their bodies with
              NOMICA programs.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={`/register?bundle=${bundle.slug}`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group shadow-premium",
                )}
              >
                Get the {bundle.name}
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/quiz"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
              >
                Take the Quiz First
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
