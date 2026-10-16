import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedCatalogProductIds } from "@/server/services/entitlement.service";
import logger from "@/lib/logger";

export const runtime = "nodejs";

type CrossSellBundle = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  compareAtCents: number | null;
  itemCount: number;
  savingsCents: number;
};

/**
 * Published bundles that are fully un-owned (purchaseable right now), sorted
 * by savings. Partially owned bundles are excluded because incremental
 * pricing is not available — showing them would dead-end at checkout.
 */
async function getCrossSellBundles(
  userId: string,
  purchasedProductIds: string[],
): Promise<CrossSellBundle[]> {
  const ownedIds = new Set(await getOwnedCatalogProductIds(userId));
  for (const id of purchasedProductIds) ownedIds.add(id);

  const bundles = await prisma.product.findMany({
    where: { kind: "BUNDLE", status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      compareAtCents: true,
      bundleItems: { select: { itemId: true } },
    },
    take: 30,
  });

  return bundles
    .filter((bundle) => bundle.bundleItems.length >= 2)
    .filter((bundle) => bundle.bundleItems.every((item) => !ownedIds.has(item.itemId)))
    .map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      priceCents: bundle.priceCents,
      compareAtCents: bundle.compareAtCents,
      itemCount: bundle.bundleItems.length,
      savingsCents: bundle.compareAtCents
        ? Math.max(0, bundle.compareAtCents - bundle.priceCents)
        : 0,
    }))
    .sort((a, b) => b.savingsCents - a.savingsCents)
    .slice(0, 2);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        status: true,
        currency: true,
        subtotalCents: true,
        discountCents: true,
        totalCents: true,
        paidAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            productSlug: true,
            productKind: true,
            unitAmountCents: true,
            quantity: true,
            lineTotalCents: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const crossSellBundles = order.status === "PAID"
      ? await getCrossSellBundles(
        session.user.id,
        order.items.map((item) => item.productId),
      )
      : [];

    return NextResponse.json(
      { order: { ...order, crossSellBundles } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    logger.error({ err: error, route: "orders/[id]", userId: session.user.id }, "Failed to load order status");
    return NextResponse.json({ error: "Unable to load order" }, { status: 500 });
  }
}
