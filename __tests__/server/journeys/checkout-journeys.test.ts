import { beforeEach, describe, expect, it, vi } from "vitest";
import { createOrderCheckout } from "@/actions/checkout.actions";

const {
  authMock,
  productFindManyMock,
  orderCreateMock,
  orderUpdateMock,
  getOwnedCatalogProductIdsMock,
  createCheckoutSessionMock,
  getOrCreateStripeCustomerMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  productFindManyMock: vi.fn(),
  orderCreateMock: vi.fn(),
  orderUpdateMock: vi.fn(),
  getOwnedCatalogProductIdsMock: vi.fn(async (): Promise<string[]> => []),
  createCheckoutSessionMock: vi.fn(),
  getOrCreateStripeCustomerMock: vi.fn(async () => "cus_123"),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: productFindManyMock },
    order: { create: orderCreateMock, update: orderUpdateMock },
  },
}));

vi.mock("@/server/services/entitlement.service", () => ({
  getOwnedCatalogProductIds: getOwnedCatalogProductIdsMock,
  hasProductEntitlement: vi.fn(async () => false),
}));

vi.mock("@/lib/stripe", () => ({
  createCheckoutSession: createCheckoutSessionMock,
  getOrCreateStripeCustomer: getOrCreateStripeCustomerMock,
}));

vi.mock("@/lib/resend", () => ({
  getAppUrl: () => "http://localhost:3000",
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn(), info: vi.fn() },
}));

const PROGRAM = {
  id: "prod-program",
  name: "Glute Builder",
  slug: "glute-builder",
  kind: "PROGRAM",
  status: "PUBLISHED",
  priceCents: 3499,
  programId: "program-1",
  bundleItems: [],
};

const TONED_LEGS = {
  id: "prod-toned",
  name: "Toned Legs",
  slug: "toned-legs",
  kind: "PROGRAM",
  status: "PUBLISHED",
  priceCents: 2499,
  programId: "program-2",
  bundleItems: [],
};

const LOWER_BODY_BUNDLE = {
  id: "prod-bundle",
  name: "Lower-Body Bundle",
  slug: "lower-body-bundle",
  kind: "BUNDLE",
  status: "PUBLISHED",
  priceCents: 5499,
  programId: null,
  bundleItems: [
    { item: { ...PROGRAM, name: "Glute Builder" } },
    { item: { ...TONED_LEGS, name: "Toned Legs" } },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
  authMock.mockResolvedValue({
    user: { id: "user-1", email: "fan@example.com", name: "Fan" },
  });
  getOwnedCatalogProductIdsMock.mockResolvedValue([]);
  orderCreateMock.mockImplementation(async (args: {
    data: {
      idempotencyKey: string;
      currency: string;
      items: { create: Array<Record<string, unknown>> };
    };
  }) => ({
    id: "order-1",
    idempotencyKey: args.data.idempotencyKey,
    currency: args.data.currency,
    items: args.data.items.create.map((item, index) => ({
      id: `item-${index}`,
      ...item,
    })),
  }));
  orderUpdateMock.mockResolvedValue({});
  getOrCreateStripeCustomerMock.mockResolvedValue("cus_123");
  createCheckoutSessionMock.mockResolvedValue({
    id: "cs_123",
    url: "https://stripe.example/checkout",
  });
});

describe("Journey B — guest cart to signed-in one-time checkout", () => {
  it("requires an account before checkout can start", async () => {
    authMock.mockResolvedValue(null);

    const result = await createOrderCheckout(["prod-program"]);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("UNAUTHORIZED");
    expect(orderCreateMock).not.toHaveBeenCalled();
  });

  it("prices the order from the published catalog and creates a pending order", async () => {
    productFindManyMock.mockResolvedValue([PROGRAM]);

    const result = await createOrderCheckout(["prod-program"]);

    expect(result.success).toBe(true);
    expect(result.data?.url).toBe("https://stripe.example/checkout");
    // Server ignores any client-side price and reads the catalog.
    expect(productFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "PUBLISHED" }),
      }),
    );
    expect(orderCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          status: "PENDING",
          currency: "usd",
          subtotalCents: 3499,
          totalCents: 3499,
          items: {
            create: [
              expect.objectContaining({
                productId: "prod-program",
                unitAmountCents: 3499,
                lineTotalCents: 3499,
              }),
            ],
          },
        }),
      }),
    );
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          kind: "order",
          orderId: "order-1",
          userId: "user-1",
        }),
      }),
    );
  });

  it("rejects products that are not part of the published catalog", async () => {
    productFindManyMock.mockResolvedValue([]);

    const result = await createOrderCheckout(["prod-draft-or-archived"]);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("PRODUCT_UNAVAILABLE");
    expect(orderCreateMock).not.toHaveBeenCalled();
  });
});

describe("Journey D — ownership and bundle overlap rules", () => {
  it("blocks re-purchasing an owned product", async () => {
    productFindManyMock.mockResolvedValue([PROGRAM]);
    getOwnedCatalogProductIdsMock.mockResolvedValue(["prod-program"]);

    const result = await createOrderCheckout(["prod-program"]);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("ALREADY_OWNED");
  });

  it("blocks a bundle that contains an owned program", async () => {
    productFindManyMock.mockResolvedValue([LOWER_BODY_BUNDLE]);
    getOwnedCatalogProductIdsMock.mockResolvedValue(["prod-toned"]);

    const result = await createOrderCheckout(["prod-bundle"]);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("BUNDLE_CONTAINS_OWNED_PRODUCT");
  });

  it("blocks a cart containing a program and a bundle that includes it", async () => {
    productFindManyMock.mockResolvedValue([PROGRAM, LOWER_BODY_BUNDLE]);

    const result = await createOrderCheckout(["prod-program", "prod-bundle"]);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("DUPLICATE_BUNDLE_CONTENT");
    expect(orderCreateMock).not.toHaveBeenCalled();
  });

  it("blocks two bundles that share a program", async () => {
    const overlappingBundle = {
      ...LOWER_BODY_BUNDLE,
      id: "prod-bundle-2",
      name: "Overlap Bundle",
    };
    productFindManyMock.mockResolvedValue([LOWER_BODY_BUNDLE, overlappingBundle]);

    const result = await createOrderCheckout(["prod-bundle", "prod-bundle-2"]);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("DUPLICATE_BUNDLE_CONTENT");
  });

  it("prices a multi-item order from catalog totals", async () => {
    productFindManyMock.mockResolvedValue([PROGRAM, TONED_LEGS]);

    const result = await createOrderCheckout(["prod-program", "prod-toned"]);

    expect(result.success).toBe(true);
    expect(orderCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotalCents: 3499 + 2499,
          totalCents: 3499 + 2499,
        }),
      }),
    );
  });
});
