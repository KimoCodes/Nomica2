import { describe, expect, it } from "vitest";
import {
  calculateOneTimeOrderTotal,
  resolveEntitledProductIds,
} from "@/server/services/order-pricing";

describe("calculateOneTimeOrderTotal", () => {
  it("calculates the server-authoritative total for multiple products", () => {
    expect(calculateOneTimeOrderTotal([
      { priceCents: 3999 },
      { priceCents: 2999 },
    ])).toEqual({
      currency: "usd",
      subtotalCents: 6998,
      discountCents: 0,
      totalCents: 6998,
    });
  });

  it("rejects empty orders and invalid or overflowing prices", () => {
    expect(() => calculateOneTimeOrderTotal([])).toThrow("EMPTY_ORDER");
    expect(() => calculateOneTimeOrderTotal([{ priceCents: -1 }])).toThrow("INVALID_PRODUCT_PRICE");
    expect(() => calculateOneTimeOrderTotal([{ priceCents: 1.5 }])).toThrow("INVALID_PRODUCT_PRICE");
    expect(() => calculateOneTimeOrderTotal([
      { priceCents: Number.MAX_SAFE_INTEGER },
      { priceCents: 1 },
    ])).toThrow("ORDER_TOTAL_OUT_OF_RANGE");
  });
});

describe("resolveEntitledProductIds", () => {
  it("grants one product for an individual purchase", () => {
    expect(resolveEntitledProductIds({
      productId: "program-1",
      productKind: "PROGRAM",
      bundleProductIds: [],
    })).toEqual(["program-1"]);
  });

  it("grants the snapshotted products for a bundle and removes duplicates", () => {
    expect(resolveEntitledProductIds({
      productId: "bundle-1",
      productKind: "BUNDLE",
      bundleProductIds: ["program-1", "program-2", "program-1"],
    })).toEqual(["program-1", "program-2"]);
  });

  it("rejects bundles without snapshotted contents", () => {
    expect(() => resolveEntitledProductIds({
      productId: "bundle-1",
      productKind: "BUNDLE",
      bundleProductIds: [],
    })).toThrow("BUNDLE_ORDER_ITEM_HAS_NO_CONTENTS");
  });
});
