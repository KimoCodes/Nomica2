"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { listSavedProductsAction, toggleSavedProductAction } from "@/actions/favorite.actions";
import { readCartIds, writeCartIds } from "@/components/cart/cart-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, ShoppingCart, ArrowRight, Trash2 } from "lucide-react";

type SavedProduct = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  kind: string;
  priceCents: number;
  priceLabel: string;
};

export function SavedProductsClient() {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    listSavedProductsAction().then((result) => {
      if (cancelled) return;
      if (result.success && result.data && "products" in result.data) {
        setProducts((result.data as { products: SavedProduct[] }).products);
      } else if (!result.success && result.error?.code === "UNAUTHORIZED") {
        window.location.href = "/login?callbackUrl=/client/saved";
        return;
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function removeItem(productId: string) {
    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    startTransition(async () => {
      const result = await toggleSavedProductAction(productId);
      if (!result.success) {
        setProducts(previous);
        toast.error(result.error?.message ?? "Could not remove item");
      }
    });
  }

  function moveToCart(productId: string) {
    const ids = readCartIds();
    if (!ids.includes(productId)) writeCartIds([...ids, productId]);
    toast.success("Added to cart");
    window.location.href = "/cart";
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Bookmark className="mb-3 size-10 text-muted-foreground/30" />
          <p className="text-lg font-medium">Nothing saved yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Tap Save on any program or bundle to keep it here for later.
          </p>
          <Link href="/programs" className="mt-6">
            <Button>
              Browse Programs
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="transition-all hover:-translate-y-0.5 hover:shadow-premium">
          <CardContent className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {product.kind === "BUNDLE" ? "Bundle" : "Program"}
                </p>
                <h3 className="mt-1 font-bold">{product.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                aria-label={`Remove ${product.name} from saved`}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {product.tagline && (
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                {product.tagline}
              </p>
            )}
            <p className="mt-3 text-xl font-bold">{product.priceLabel}</p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => moveToCart(product.id)}
              >
                <ShoppingCart className="mr-1.5 size-4" />
                Add to cart
              </Button>
              <Link
                href={product.kind === "BUNDLE" ? `/bundles/${product.slug}` : `/programs/${product.slug}`}
                className="flex-1"
              >
                <Button size="sm" className="w-full">
                  View
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
