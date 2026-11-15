import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { PublicLayout } from "@/components/shared/public-layout";
import {
  getProductBySlug,
  getProducts,
  getPublishedBundlesContaining,
} from "@/server/services/product.service";
import { formatPrice } from "@/constants/subscriptions";
import { getProductImage } from "@/constants/coach-images";
import { CartProductButton } from "@/components/cart/cart-product-button";
import { SaveProductButton } from "@/components/favorites/save-product-button";
import { auth } from "@/lib/auth";
import { getOwnedCatalogProductIds } from "@/server/services/entitlement.service";
import { STRIPE_PAYMENT_TEST_PRODUCT_SLUG } from "@/constants/product-catalog";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Dumbbell,
  Play,
  Star,
  Zap,
} from "lucide-react";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "PUBLISHED") {
    return { title: "Program Not Found" };
  }

  return {
    title: `${product.name} | NomiTips`,
    description: product.tagline ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    redirect("/programs?missing=1");
  }

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);
  const session = await auth();
  const ownedIds = session?.user?.id
    ? new Set(await getOwnedCatalogProductIds(session.user.id))
    : new Set<string>();
  const isOwned = ownedIds.has(product.id);
  const isAdmin = session?.user?.role === "ADMIN";
  if (product.status !== "PUBLISHED" && !isOwned && !isAdmin) {
    notFound();
  }

  const totalWorkouts = product.program?.weeks?.reduce(
    (acc, week) => acc + week.days.length,
    0,
  ) ?? 0;
  const isPaymentTest = product.slug === STRIPE_PAYMENT_TEST_PRODUCT_SLUG;
  const cover = getProductImage(product);

  const containingBundles = !isOwned && product.kind === "PROGRAM"
    ? await getPublishedBundlesContaining(product.id)
    : [];

  const avgRating = product.reviews.length
    ? (
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length
    ).toFixed(1)
    : null;

  return (
    <PublicLayout>
      <main className="flex flex-1 flex-col">
        {/* Breadcrumb */}
        <div className="border-b border-border/50 px-4 py-3">
          <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/programs" className="hover:text-foreground">
              Programs
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>

        {/* Product Hero */}
        <section className="px-4 py-12 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            {/* Left: Media Preview */}
            <div className="relative">
              {isPaymentTest
                ? (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-3xl border border-border/50 bg-muted/40 p-8 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="size-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Payment test only</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        No workouts or training materials are included.
                      </p>
                    </div>
                  </div>
                )
                : (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border/50 bg-muted">
                    {product.previewVideoUrl ? (
                      <>
                        <video
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="absolute inset-0 h-full w-full object-cover"
                          poster={cover?.poster}
                        >
                          <source src={product.previewVideoUrl} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 text-center">
                          <div className="flex size-16 items-center justify-center rounded-full bg-primary/30 backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer">
                            <Play className="size-8 text-white ml-1" />
                          </div>
                          <div>
                            <p className="font-semibold text-white drop-shadow-lg">
                              Preview Workouts
                            </p>
                            <p className="text-sm text-white/80 drop-shadow-lg">
                              {totalWorkouts || "Sample"} exercises
                            </p>
                          </div>
                        </div>
                      </>
                    ) : cover ? (
                      <>
                        <Image
                          src={cover.src}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          alt={cover.alt}
                          fill
                          className="object-cover"
                          style={{ objectPosition: cover.position }}
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <p className="font-semibold text-white drop-shadow-lg">
                            {product.name}
                          </p>
                          <p className="text-sm text-white/80 drop-shadow-lg">
                            {totalWorkouts || "Sample"} workouts
                            {product.program?.weeks &&
                              ` · ${product.program.weeks.length} weeks`}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Dumbbell className="size-12 text-primary/40" />
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Right: Product Info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {isPaymentTest ? "PAYMENT TEST" : product.kind}
                </span>
                {(product.focus || !isPaymentTest) && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {product.focus ?? "All levels"}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                {product.name}
              </h1>

              <p className="mt-2 text-lg text-muted-foreground">
                {product.tagline}
              </p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-4xl font-bold">
                  {formatPrice(product.priceCents)}
                </span>
                {product.compareAtCents && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.compareAtCents)}
                    </span>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      Save{" "}
                      {formatPrice(product.compareAtCents - product.priceCents)}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {product.durationLabel}
                </span>
                {product.daysPerWeek && (
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="size-4" />
                    {product.daysPerWeek} days/week
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Zap className="size-4" />
                  {product.focus ?? "All levels"}
                </span>
              </div>

              {product.equipment.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Dumbbell className="size-4" />
                    Equipment
                  </span>
                  {product.equipment.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-muted px-3 py-1 text-xs text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8">
                {isOwned && isPaymentTest
                  ? (
                    <p className="rounded-xl border border-border/50 bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                      Payment test already completed. No workout access is included.
                    </p>
                  )
                  : isOwned && product.kind !== "BUNDLE"
                  ? (
                    <Link
                      href={`/client/programs/${product.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
                    >
                      Owned — Open Program
                    </Link>
                  )
                  : (
                    <div className="space-y-2">
                      <CartProductButton
                        productId={product.id}
                        owned={isOwned}
                      />
                      <SaveProductButton
                        productId={product.id}
                        className="w-full"
                      />
                    </div>
                  )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  One-time payment
                </span>
                <span>·</span>
                <span>No automatic renewal</span>
              </div>

              {containingBundles.length > 0 && (
                <div className="mt-6 space-y-2">
                  {containingBundles.map((bundle) => (
                    <Link
                      key={bundle.id}
                      href={`/bundles/${bundle.slug}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm transition-colors hover:bg-primary/10"
                    >
                      <span>
                        Also in{" "}
                        <span className="font-semibold">{bundle.name}</span>
                        {bundle.compareAtCents && bundle.compareAtCents > bundle.priceCents && (
                          <span className="ml-1 text-success">
                            — save{" "}
                            {formatPrice(bundle.compareAtCents - bundle.priceCents)}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-primary">
                        {formatPrice(bundle.priceCents)}
                        <ArrowRight className="size-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center gap-2">
                {avgRating && (
                  <>
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-warning text-warning"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{avgRating}/5</span>
                    <span className="text-sm text-muted-foreground">
                      ({product._count.reviews} reviews)
                    </span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">
                  · {product._count.purchases} purchased
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* What's Inside - Program Structure */}
        {product.program?.weeks && product.program.weeks.length > 0 && (
          <section className="px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Program Structure
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {product.program.weeks.slice(0, 3).map((week, index) => (
                  <div
                    key={week.id}
                    className={`animate-slide-up stagger-${
                      index + 1
                    } rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-premium`}
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <span className="text-lg font-bold text-primary">
                        {String(week.weekNumber).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">
                      {week.title ?? `Week ${week.weekNumber}`}
                    </h3>
                    <p className="mt-4 text-sm font-medium text-primary">
                      {week.days.length} training days
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {isPaymentTest ? "Payment Test Details" : "Everything You Need"}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {isPaymentTest
                    ? "This product is only for verifying payment processing. It includes no workouts or training materials."
                    : "This isn't just a workout PDF. It's a complete system designed to deliver results."}
                </p>
                <ul className="mt-8 space-y-4">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-primary" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
                <div className="relative rounded-3xl border border-border/50 bg-card p-8 shadow-premium-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                      {isPaymentTest
                        ? <CreditCard className="size-6 text-primary" />
                        : <Dumbbell className="size-6 text-primary" />}
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.durationLabel}
                        {product.daysPerWeek &&
                          ` · ${product.daysPerWeek} days/week`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {isPaymentTest
                      ? (
                        <>
                          <div className="rounded-xl bg-muted/50 p-4 text-center">
                            <p className="text-2xl font-bold">$0.50</p>
                            <p className="text-xs text-muted-foreground">Charge</p>
                          </div>
                          <div className="rounded-xl bg-muted/50 p-4 text-center">
                            <p className="text-2xl font-bold">Once</p>
                            <p className="text-xs text-muted-foreground">Payment</p>
                          </div>
                          <div className="rounded-xl bg-muted/50 p-4 text-center">
                            <p className="text-2xl font-bold">None</p>
                            <p className="text-xs text-muted-foreground">Content</p>
                          </div>
                        </>
                      )
                      : (
                        <>
                          <div className="rounded-xl bg-muted/50 p-4 text-center">
                            <p className="text-2xl font-bold">
                              {totalWorkouts || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">Workouts</p>
                          </div>
                          <div className="rounded-xl bg-muted/50 p-4 text-center">
                            <p className="text-2xl font-bold">
                              {product.program?.weeks?.length ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">Weeks</p>
                          </div>
                          <div className="rounded-xl bg-muted/50 p-4 text-center">
                            <p className="text-2xl font-bold">100%</p>
                            <p className="text-xs text-muted-foreground">Guided</p>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section className="px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Member Reviews
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {product.reviews.slice(0, 6).map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-border/50 bg-card p-6"
                  >
                    <div className="mb-3 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < review.rating
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    {review.title && (
                      <h3 className="font-semibold">{review.title}</h3>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.body}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {review.user.name?.charAt(0) ?? "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {review.user.name ?? "Anonymous"}
                        </p>
                        {review.isVerified && (
                          <p className="text-xs text-success">
                            Verified purchase
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {isPaymentTest ? "Run a Payment Test" : "Ready to Start?"}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {isPaymentTest
                ? "Complete the one-time $0.50 checkout to test payment processing. No workouts or training materials are provided."
                : "Join women who transformed their bodies with this program."}
            </p>
            <div className="mt-8">
              {isOwned && isPaymentTest
                ? (
                  <p className="rounded-xl border border-border/50 bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                    Payment test already completed. No workout access is included.
                  </p>
                )
                : isOwned && product.kind !== "BUNDLE"
                ? (
                  <Link
                    href={`/client/programs/${product.slug}`}
                    className="inline-flex w-full max-w-md items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
                  >
                    Owned — Open Program
                  </Link>
                )
                : <CartProductButton productId={product.id} owned={isOwned} />}
            </div>
          </div>
        </section>

        {/* Related Products */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">
              You Might Also Like
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedProducts.map((p) => {
                const pCover = getProductImage(p);
                return (
                  <Link
                    key={p.id}
                    href={`/programs/${p.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {pCover ? (
                        <Image
                          src={pCover.src}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          alt={pCover.alt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: pCover.position }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Dumbbell className="size-8 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                      <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/15 backdrop-blur-sm">
                          {p.kind}
                        </span>
                        {p.focus && (
                          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/15 backdrop-blur-sm">
                            {p.focus}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold tracking-tight">{p.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {p.tagline}
                      </p>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          {formatPrice(p.priceCents)}
                        </span>
                        {p.compareAtCents && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(p.compareAtCents)}
                          </span>
                        )}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        View Program
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Back to Programs */}
        <div className="px-4 py-8 text-center">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to All Programs
          </Link>
        </div>
      </main>
    </PublicLayout>
  );
}
