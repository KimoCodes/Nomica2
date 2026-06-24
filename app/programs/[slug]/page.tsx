import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import { getProductBySlug, PRODUCTS, formatProductPrice } from "@/constants/products";
import {
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Play,
  Star,
  Clock,
  BarChart3,
  Zap,
  Shield,
} from "lucide-react";

export const runtime = "nodejs";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Program Not Found" };

  return {
    title: `${product.name} | NOMICA`,
    description: product.tagline,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id,
  ).slice(0, 3);

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
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="flex size-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/20">
                    <Play className="size-8 text-primary ml-1" />
                  </div>
                  <div>
                    <p className="font-semibold">Preview Workouts</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sampleExercises.length} sample exercises
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Exercises */}
              {product.sampleExercises.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {product.sampleExercises.map((exercise, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center rounded-xl border border-border/50 bg-card p-3 text-center transition-all hover:shadow-premium"
                    >
                      <Play className="mb-1 size-4 text-primary" />
                      <p className="text-xs font-medium">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exercise.duration}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {product.category}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {product.level}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                {product.name}
              </h1>

              <p className="mt-2 text-lg text-muted-foreground">
                {product.tagline}
              </p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-4xl font-bold">
                  {formatProductPrice(product.price)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatProductPrice(product.originalPrice)}
                </span>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  Save {formatProductPrice(product.originalPrice - product.price)}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {product.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="size-4" />
                  {product.commitment}
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="size-4" />
                  {product.equipment}
                </span>
              </div>

              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-8 w-full group shadow-premium",
                )}
              >
                Get Instant Access
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="size-3" />
                  30-day money-back guarantee
                </span>
                <span>\u00B7</span>
                <span>Instant access</span>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-warning text-warning"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">4.9/5</span>
                <span className="text-sm text-muted-foreground">
                  ({product.highlights[0]?.value})
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-12">
          <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6">
            {product.highlights.map((highlight, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {highlight.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {highlight.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What's Inside */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                What&apos;s Inside
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {product.phases.map((phase, index) => (
                <div
                  key={index}
                  className={`animate-slide-up stagger-${index + 1} rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-premium`}
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                    <span className="text-lg font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{phase.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {phase.description}
                  </p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    {phase.workoutCount} workouts
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Everything You Need
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  This isn&apos;t just a workout PDF. It&apos;s a complete
                  system designed to deliver results.
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
                      <Dumbbell className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.duration} \u00B7 {product.commitment}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-muted/50 p-4 text-center">
                      <p className="text-2xl font-bold">
                        {product.phases.reduce(
                          (acc, p) => acc + p.workoutCount,
                          0,
                        ) || "14"}
                      </p>
                      <p className="text-xs text-muted-foreground">Workouts</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4 text-center">
                      <p className="text-2xl font-bold">
                        {product.phases.length || "3"}
                      </p>
                      <p className="text-xs text-muted-foreground">Phases</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4 text-center">
                      <p className="text-2xl font-bold">100%</p>
                      <p className="text-xs text-muted-foreground">Guided</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Start?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of women who transformed their bodies with this
              program.
            </p>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 group shadow-premium",
              )}
            >
              Get {product.name} — {formatProductPrice(product.price)}
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* Related Products */}
        <section className="border-t border-border/50 bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">
              You Might Also Like
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/programs/${p.slug}`}
                  className="group rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg"
                >
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.tagline}
                  </p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {formatProductPrice(p.price)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatProductPrice(p.originalPrice)}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    View Program
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              ))}
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
