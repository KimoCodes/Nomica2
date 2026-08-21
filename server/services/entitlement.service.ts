import { prisma } from "@/lib/prisma";
import { ACTIVE_STATUSES } from "@/constants/subscriptions";
import { hasActiveFreeTrial } from "@/server/services/free-trial.service";

/**
 * Check if a user has access to a specific product.
 * Access is derived (never stored) via:
 * 1. Active All-Access subscription
 * 2. Active free trial
 * 3. Completed purchase of the product
 * 4. Completed purchase of a bundle containing the product
 */
export async function hasEntitlement(
  userId: string,
  productId: string,
): Promise<boolean> {
  // 1. Active subscription unlocks everything
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  if (subscription && ACTIVE_STATUSES.includes(subscription.status)) {
    return true;
  }

  // 2. Active free trial unlocks everything
  if (await hasActiveFreeTrial(userId)) {
    return true;
  }

  // 3. Direct purchase of this product
  const directPurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      productId,
      status: "COMPLETED",
    },
  });

  if (directPurchase) {
    return true;
  }

  // 4. Purchase of a bundle containing this product
  const bundlePurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      status: "COMPLETED",
      product: {
        kind: "BUNDLE",
        bundleItems: {
          some: { itemId: productId },
        },
      },
    },
  });

  if (bundlePurchase) {
    return true;
  }

  return false;
}

/**
 * Get all product IDs a user has access to.
 */
export async function getEntitledProductIds(userId: string): Promise<string[]> {
  // Active subscription = access to everything
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  const isActiveSub = subscription && ACTIVE_STATUSES.includes(subscription.status);
  const isActiveTrial = await hasActiveFreeTrial(userId);

  if (isActiveSub || isActiveTrial) {
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    return allProducts.map((p) => p.id);
  }

  // Direct purchases
  const directPurchases = await prisma.purchase.findMany({
    where: { userId, status: "COMPLETED" },
    select: { productId: true },
  });

  const directIds = new Set(directPurchases.map((p) => p.productId));

  // Bundle purchases — get child product IDs
  const bundlePurchases = await prisma.purchase.findMany({
    where: {
      userId,
      status: "COMPLETED",
      product: { kind: "BUNDLE" },
    },
    include: {
      product: {
        include: {
          bundleItems: { select: { itemId: true } },
        },
      },
    },
  });

  for (const bp of bundlePurchases) {
    for (const item of bp.product.bundleItems) {
      directIds.add(item.itemId);
    }
  }

  return Array.from(directIds);
}

/**
 * Check if a user has an active subscription or free trial.
 */
export async function hasActiveSubscription(
  userId: string,
): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  if (subscription && ACTIVE_STATUSES.includes(subscription.status)) {
    return true;
  }

  return hasActiveFreeTrial(userId);
}
