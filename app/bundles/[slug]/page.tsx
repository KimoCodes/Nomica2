import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import { getProductBySlug } from "@/server/services/product.service";
import { formatPrice } from "@/constants/subscriptions";
import { CartProductButton } from "@/components/cart/cart-product-button";
import { auth } from "@/lib/auth";
import { getOwnedCatalogProductIds } from "@/server/services/entitlement.service";
import { CheckCircle2, ChevronRight, Dumbbell, Package } from "lucide-react";

export const runtime = "nodejs";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getProductBySlug(slug);
  if (!bundle || bundle.kind !== "BUNDLE" || bundle.status !== "PUBLISHED") {
    return { title: "Bundle Not Found" };
  }
  return {
    title: bundle.name,
    description: bundle.tagline ?? undefined,
  };
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;
  const bundle = await getProductBySlug(slug);

  if (!bundle || bundle.kind !== "BUNDLE") notFound();

  const products = bundle.bundleItems.map((bi) => bi.item);
  const session = await auth();
  const ownedIds = session?.user?.id
    ? new Set(await getOwnedCatalogProductIds(session.user.id))
    : new Set<string>();
  if (
    bundle.status !== "PUBLISHED" &&
    !ownedIds.has(bundle.id) &&
    session?.user?.role !== "ADMIN"
  ) {
    notFound();
  }
  const ownedCount =
    products.filter((product) => ownedIds.has(product.id)).length;
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
                  Bundle
                </div>

                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {bundle.name}
                </h1>

                <p className="mt-2 text-lg text-muted-foreground">
                  {bundle.tagline}
                </p>

                {bundle.description && (
                  <p className="mt-4 text-muted-foreground">
                    {bundle.description}
                  </p>
                )}

                {/* Pricing */}
                <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold">
                      {formatPrice(bundle.priceCents)}
                    </span>
                    {bundle.compareAtCents && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(bundle.compareAtCents)}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="mt-1 text-sm font-medium text-success">
                      Save {formatPrice(savings)} ({savingsPercent}% off)
                    </p>
                  )}

                  <div className="mt-6">
                    <CartProductButton
                      productId={bundle.id}
                      owned={ownedIds.has(bundle.id)}
                      disabledMessage={ownedCount > 0
                        ? `You already own ${ownedCount} of ${products.length} included programs. Incremental bundle pricing is not available yet.`
                        : undefined}
                    />
                  </div>

                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    One-time payment · no automatic renewal
                  </p>
                </div>
              </div>

              {/* Stacked Cards Visual */}
              <div className="relative hidden md:block">
                <div className="relative h-80">
                  {products.map((product, i) => (
                    <div
                      key={product.id}
                      className="absolute right-0 left-8 rounded-2xl border border-border/50 bg-gradient-to-br from-muted/80 to-muted/40 p-4 shadow-sm transition-all hover:scale-[1.02]"
                      style={{
                        top: `${i * 24}px`,
                        height: "120px",
                        width: `${100 - i * 8}%`,
                        zIndex: products.length - i,
                      }}
                    >
                      <p className="font-semibold">{product.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.tagline}
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
                  key={product.id}
                  className={`animate-slide-up stagger-${
                    index + 1
                  } rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Dumbbell className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {product.durationLabel}
                    </span>
                  </div>

                  <div className="mt-3 text-sm font-medium text-primary">
                    Value: {formatPrice(product.priceCents)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        {bundle.features.length > 0 && (
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
        )}

        {/* Value Breakdown */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
              Value Breakdown
            </h2>

            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-muted-foreground line-through">
                    {formatPrice(product.priceCents)}
                  </span>
                </div>
              ))}

              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Total Value</span>
                  <span className="text-lg text-muted-foreground line-through">
                    {bundle.compareAtCents
                      ? formatPrice(bundle.compareAtCents)
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Bundle Price</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(bundle.priceCents)}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="mt-2 text-right text-sm font-medium text-success">
                    You Save {formatPrice(savings)} ({savingsPercent}% off)
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <CartProductButton
                productId={bundle.id}
                owned={ownedIds.has(bundle.id)}
                disabledMessage={ownedCount > 0
                  ? `You already own ${ownedCount} included program(s). Incremental bundle pricing is not available yet.`
                  : undefined}
              />
            </div>
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
                  q: "How does access work after I buy?",
                  a: "The bundle is a one-time purchase with no automatic renewal. Its included programs will appear in My Programs after payment is confirmed, under the access terms shown at checkout.",
                },
                {
                  q: "Can I buy a bundle as a gift?",
                  a: "Purchases are linked to the account used at checkout. Program access cannot currently be transferred to another account.",
                },
                {
                  q: "What if I only want one program from a bundle?",
                  a: "You can buy any program individually on the Programs page. Bundles are for when you want multiple programs at a discount.",
                },
                {
                  q: "Are there payment plans available?",
                  a: "Checkout is a one-time payment. Payment plans and installments are not currently offered.",
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
              Join women who&apos;ve transformed their bodies with NomiTips
              programs.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <CartProductButton
                productId={bundle.id}
                owned={ownedIds.has(bundle.id)}
                disabledMessage={ownedCount > 0
                  ? `You already own ${ownedCount} included program(s). Incremental bundle pricing is not available yet.`
                  : undefined}
              />
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
