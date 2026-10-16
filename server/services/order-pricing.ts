export type PricedCatalogProduct = { priceCents: number };

export function calculateOneTimeOrderTotal(products: PricedCatalogProduct[]) {
  if (products.length === 0) {
    throw new Error("EMPTY_ORDER");
  }

  const subtotalCents = products.reduce((total, product) => {
    if (!Number.isSafeInteger(product.priceCents) || product.priceCents < 0) {
      throw new Error("INVALID_PRODUCT_PRICE");
    }
    const nextTotal = total + product.priceCents;
    if (!Number.isSafeInteger(nextTotal)) {
      throw new Error("ORDER_TOTAL_OUT_OF_RANGE");
    }
    return nextTotal;
  }, 0);

  return {
    currency: "usd" as const,
    subtotalCents,
    discountCents: 0,
    totalCents: subtotalCents,
  };
}

export function resolveEntitledProductIds(item: {
  productId: string;
  productKind: string;
  bundleProductIds: string[];
}): string[] {
  if (item.productKind !== "BUNDLE") {
    return [item.productId];
  }

  const includedIds = [...new Set(item.bundleProductIds)];
  if (includedIds.length === 0 || includedIds.some((id) => !id)) {
    throw new Error("BUNDLE_ORDER_ITEM_HAS_NO_CONTENTS");
  }
  return includedIds;
}
