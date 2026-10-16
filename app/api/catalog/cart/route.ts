import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedCatalogProductIds } from "@/server/services/entitlement.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ids = [...new Set(new URL(request.url).searchParams.getAll("id"))];
  if (ids.length > 20 || ids.some((id) => !id || id.length > 100)) {
    return NextResponse.json({ error: "Invalid cart selection" }, {
      status: 400,
    });
  }

  const products = ids.length
    ? await prisma.product.findMany({
      where: { id: { in: ids }, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        kind: true,
        priceCents: true,
        bundleItems: { select: { item: { select: { id: true, name: true } } } },
      },
    })
    : [];

  const session = await auth();
  const ownedIds = session?.user?.id
    ? await getOwnedCatalogProductIds(session.user.id)
    : [];

  const bundleSuggestion = ids.length
    ? await findBundleSuggestion(ids, products, ownedIds)
    : null;

  return NextResponse.json({
    products,
    unavailableIds: ids.filter((id) =>
      !products.some((product) => product.id === id)
    ),
    ownedIds,
    bundleSuggestion,
  }, { headers: { "Cache-Control": "private, no-store" } });
}

type CartProduct = {
  id: string;
  name: string;
  slug: string;
  kind: string;
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

/**
 * Server-side bundle savings recommendation (§13). Suggests a published
 * bundle when it covers at least two individual cart products, costs less
 * than those products combined, contains nothing the shopper already owns,
 * and does not overlap a bundle already in the cart.
 */
async function findBundleSuggestion(
  cartIds: string[],
  products: CartProduct[],
  ownedIds: string[],
): Promise<BundleSuggestion | null> {
  const owned = new Set(ownedIds);
  const cartBundles = products.filter((p) => p.kind === "BUNDLE");
  const individualIds = new Set(
    products.filter((p) => p.kind !== "BUNDLE").map((p) => p.id),
  );
  if (individualIds.size < 2 || cartBundles.length > 0) return null;

  const bundles = await prisma.product.findMany({
    where: { kind: "BUNDLE", status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      bundleItems: { select: { itemId: true } },
    },
  });

  let best: BundleSuggestion | null = null;

  for (const bundle of bundles) {
    if (cartIds.includes(bundle.id)) continue;

    const childIds = bundle.bundleItems.map((item) => item.itemId);
    if (childIds.length < 2) continue;
    // Checkout rejects bundles containing products the shopper already owns.
    if (childIds.some((id) => owned.has(id))) continue;

    const coveredIds = childIds.filter((id) => individualIds.has(id));
    if (coveredIds.length < 2) continue;

    const coveredProducts = products.filter((p) => coveredIds.includes(p.id));
    const coveredTotalCents = coveredProducts.reduce(
      (sum, p) => sum + p.priceCents,
      0,
    );
    const savingsCents = coveredTotalCents - bundle.priceCents;
    if (savingsCents <= 0) continue;

    if (!best || savingsCents > best.savingsCents) {
      best = {
        bundle: {
          id: bundle.id,
          name: bundle.name,
          slug: bundle.slug,
          priceCents: bundle.priceCents,
        },
        coveredProductIds: coveredIds,
        coveredNames: coveredProducts.map((p) => p.name),
        coveredTotalCents,
        savingsCents,
      };
    }
  }

  return best;
}
