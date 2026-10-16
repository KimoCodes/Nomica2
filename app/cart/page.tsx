"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/shared/public-layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/constants/subscriptions";
import { createOrderCheckout } from "@/actions/checkout.actions";
import {
  cartUpdatedEvent,
  readCartIds,
  writeCartIds,
} from "@/components/cart/cart-storage";
import { ArrowRight, Loader2, ShoppingBag, Trash2 } from "lucide-react";

type CartProduct = {
  id: string;
  name: string;
  slug: string;
  kind: "PROGRAM" | "CHALLENGE" | "BUNDLE";
  priceCents: number;
  bundleItems: { item: { id: string; name: string } }[];
};

type BundleSuggestion = {
  bundle: { id: string; name: string; slug: string; priceCents: number };
  coveredProductIds: string[];
  coveredNames: string[];
  coveredTotalCents: number;
  savingsCents: number;
};

export default function CartPage() {
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [bundleSuggestion, setBundleSuggestion] =
    useState<BundleSuggestion | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const cartIds = readCartIds();
    setIds(cartIds);
    if (!cartIds.length) {
      setProducts([]);
      setOwnedIds([]);
      setBundleSuggestion(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const query = new URLSearchParams();
      cartIds.forEach((id) => query.append("id", id));
      const response = await fetch(`/api/catalog/cart?${query.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Unable to load your cart.");
      const data = await response.json() as {
        products: CartProduct[];
        unavailableIds: string[];
        ownedIds: string[];
        bundleSuggestion: BundleSuggestion | null;
      };
      setProducts(data.products);
      setOwnedIds(data.ownedIds);
      setBundleSuggestion(data.bundleSuggestion ?? null);
      if (data.unavailableIds.length) {
        const remaining = cartIds.filter((id) =>
          !data.unavailableIds.includes(id)
        );
        writeCartIds(remaining);
        setIds(remaining);
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load your cart.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = async () => {
      await refresh();
    };
    void initialLoad();
    window.addEventListener(cartUpdatedEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(cartUpdatedEvent, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const ownedSet = useMemo(() => new Set(ownedIds), [ownedIds]);
  const problems = useMemo(() => {
    const selectedIds = new Set(ids);
    const messages: string[] = [];
    for (const product of products) {
      if (ownedSet.has(product.id)) {
        messages.push(
          `You already own ${product.name}. Remove it to continue.`,
        );
      }
      if (product.kind === "BUNDLE") {
        const ownedChild = product.bundleItems.find(({ item }) =>
          ownedSet.has(item.id)
        );
        if (ownedChild) {
          messages.push(
            `You already own ${ownedChild.item.name}, included in ${product.name}.`,
          );
        }
        const selectedChild = product.bundleItems.find(({ item }) =>
          selectedIds.has(item.id)
        );
        if (selectedChild) {
          messages.push(
            `${product.name} overlaps with ${selectedChild.item.name} in your cart.`,
          );
        }
      }
    }
    const includedByBundle = new Map<string, string[]>();
    for (const product of products.filter((item) => item.kind === "BUNDLE")) {
      for (const { item } of product.bundleItems) {
        includedByBundle.set(item.id, [
          ...(includedByBundle.get(item.id) ?? []),
          product.name,
        ]);
      }
    }
    for (const [productId, bundleNames] of includedByBundle) {
      if (bundleNames.length > 1) {
        messages.push(
          `Selected bundles overlap on ${
            products.find((product) =>
              product.bundleItems.some(({ item }) => item.id === productId)
            )?.bundleItems.find(({ item }) => item.id === productId)?.item
              .name ?? "a program"
          }.`,
        );
      }
    }
    return [...new Set(messages)];
  }, [ids, ownedSet, products]);

  const totalCents = products.reduce(
    (sum, product) => sum + product.priceCents,
    0,
  );

  function removeProduct(productId: string) {
    const remaining = ids.filter((id) => id !== productId);
    writeCartIds(remaining);
    setIds(remaining);
    setProducts((current) =>
      current.filter((product) => product.id !== productId)
    );
    setError(null);
  }

  function swapToBundle(suggestion: BundleSuggestion) {
    const covered = new Set(suggestion.coveredProductIds);
    const remaining = ids.filter((id) => !covered.has(id));
    writeCartIds([...remaining, suggestion.bundle.id]);
    setError(null);
  }

  async function checkout() {
    setCheckingOut(true);
    setError(null);
    try {
      const result = await createOrderCheckout(ids);
      if (result.success && result.data?.url) {
        window.location.assign(result.data.url);
        return;
      }
      setError(
        result.error?.code === "UNAUTHORIZED"
          ? "Sign in or create a free account to continue to checkout. Your cart will stay on this device."
          : result.error?.message ??
            "Checkout could not start. Please try again.",
      );
    } catch {
      setError("Checkout could not start. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <PublicLayout>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 md:py-16">
        <div className="mb-8 flex items-center gap-3">
          <ShoppingBag className="size-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Your cart</h1>
            <p className="text-sm text-muted-foreground">
              Review your programs before one-time checkout.
            </p>
          </div>
        </div>

        {loading
          ? (
            <p
              role="status"
              className="py-12 text-center text-muted-foreground"
            >
              Loading your cart…
            </p>
          )
          : products.length === 0
          ? (
            <section className="rounded-2xl border border-dashed p-10 text-center">
              <ShoppingBag className="mx-auto mb-4 size-10 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore the catalog and add programs or bundles that fit your
                goals.
              </p>
              <Link href="/programs" className={cn(buttonVariants(), "mt-5")}>
                Browse programs
              </Link>
            </section>
          )
          : (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <section aria-label="Cart items" className="space-y-3">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4 sm:p-5"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {product.kind === "BUNDLE" ? "Bundle" : "Program"}
                      </p>
                      <Link
                        href={product.kind === "BUNDLE"
                          ? `/bundles/${product.slug}`
                          : `/programs/${product.slug}`}
                        className="mt-1 inline-block font-semibold hover:underline"
                      >
                        {product.name}
                      </Link>
                      {product.kind === "BUNDLE" && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Includes {product.bundleItems.map(({ item }) =>
                            item.name
                          ).join(", ")}
                        </p>
                      )}
                      {ownedSet.has(product.id) && (
                        <p className="mt-2 text-sm text-destructive">
                          Already in your library
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-3">
                      <span className="font-semibold">
                        {formatPrice(product.priceCents)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="size-4" /> Remove
                      </button>
                    </div>
                  </article>
                ))}
                {bundleSuggestion && (
                  <article className="rounded-xl border border-primary/40 bg-primary/5 p-4 sm:p-5">
                    <p className="text-xs uppercase tracking-wide text-primary">
                      Bundle &amp; save
                    </p>
                    <p className="mt-1 font-semibold">
                      Get {bundleSuggestion.bundle.name} and save{" "}
                      {formatPrice(bundleSuggestion.savingsCents)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Replaces {bundleSuggestion.coveredNames.join(", ")} —
                      and includes everything else in the bundle for{" "}
                      {formatPrice(bundleSuggestion.bundle.priceCents)}, one
                      time.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => swapToBundle(bundleSuggestion)}
                        className={cn(buttonVariants({ size: "sm" }))}
                      >
                        Swap for the bundle
                      </button>
                      <Link
                        href={`/bundles/${bundleSuggestion.bundle.slug}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                        )}
                      >
                        See what&apos;s included
                      </Link>
                    </div>
                  </article>
                )}
              </section>

              <aside className="h-fit rounded-xl border bg-card p-5">
                <h2 className="font-semibold">Order summary</h2>
                <div className="mt-4 flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalCents)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-3 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(totalCents)}</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  One-time payment. No automatic renewal.
                </p>
                {problems.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-destructive">
                    {problems.map((problem) => (
                      <li key={problem}>{problem}</li>
                    ))}
                  </ul>
                )}
                {error && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={checkout}
                  disabled={checkingOut || problems.length > 0}
                  className={cn(buttonVariants(), "mt-5 w-full")}
                >
                  {checkingOut
                    ? <Loader2 className="mr-2 size-4 animate-spin" />
                    : null}
                  Continue to secure checkout{" "}
                  {!checkingOut && <ArrowRight className="ml-2 size-4" />}
                </button>
                {error?.includes("Sign in") && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href="/login?callbackUrl=%2Fcart"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full",
                      )}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register?callbackUrl=%2Fcart"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full",
                      )}
                    >
                      Create free account
                    </Link>
                  </div>
                )}
              </aside>
            </div>
          )}
      </main>
    </PublicLayout>
  );
}
