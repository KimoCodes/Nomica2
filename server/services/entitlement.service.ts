import { prisma } from "@/lib/prisma";

/**
 * Catalog-only authorization. Access is derived from durable Entitlement
 * rows (one-time orders) plus completed legacy purchases until their
 * entitlement backfill has been reviewed and applied. Subscriptions and
 * trials never grant catalog access.
 */
export async function hasProductEntitlement(
  userId: string,
  productId: string,
): Promise<boolean> {
  const explicit = await prisma.entitlement.findFirst({
    where: { userId, productId, status: "ACTIVE" },
    select: { id: true },
  });
  if (explicit) return true;

  const legacyDirect = await prisma.purchase.findFirst({
    where: { userId, productId, status: "COMPLETED" },
    select: { id: true },
  });
  if (legacyDirect) return true;

  const legacyBundle = await prisma.purchase.findFirst({
    where: {
      userId,
      status: "COMPLETED",
      product: {
        kind: "BUNDLE",
        bundleItems: { some: { itemId: productId } },
      },
    },
    select: { id: true },
  });
  return Boolean(legacyBundle);
}

/** Product IDs for the authenticated user's paid library, without broad
 * subscription/trial access. Legacy completed purchases remain readable until
 * a reviewed migration converts them into durable Entitlement rows. */
export async function getOwnedCatalogProductIds(
  userId: string,
): Promise<string[]> {
  const ids = new Set<string>();
  const [entitlements, purchases] = await Promise.all([
    prisma.entitlement.findMany({
      where: { userId, status: "ACTIVE" },
      select: { productId: true, orderItem: { select: { productId: true } } },
    }),
    prisma.purchase.findMany({
      where: { userId, status: "COMPLETED" },
      select: {
        productId: true,
        product: {
          select: {
            kind: true,
            bundleItems: { select: { itemId: true } },
          },
        },
      },
    }),
  ]);

  for (const entitlement of entitlements) {
    ids.add(entitlement.productId);
    if (entitlement.orderItem) ids.add(entitlement.orderItem.productId);
  }
  for (const purchase of purchases) {
    ids.add(purchase.productId);
    if (purchase.product.kind === "BUNDLE") {
      for (const item of purchase.product.bundleItems) ids.add(item.itemId);
    } else {
      ids.add(purchase.productId);
    }
  }
  return [...ids];
}
