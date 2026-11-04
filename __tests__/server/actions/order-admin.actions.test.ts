import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  archivePaidOrdersAction,
  grantEntitlementAction,
  markOrderRefundedAction,
  revokeEntitlementAction,
  restorePaidOrdersAction,
} from "@/actions/order-admin.actions";

const {
  requireRoleMock,
  orderFindUniqueMock,
  orderUpdateMock,
  orderUpdateManyMock,
  orderPaymentUpdateManyMock,
  entitlementFindUniqueMock,
  entitlementUpdateManyMock,
  entitlementUpdateMock,
  entitlementCreateMock,
  userFindUniqueMock,
  productFindUniqueMock,
  clientProfileFindUniqueMock,
  clientProgramUpsertMock,
  orderItemFindManyMock,
  transactionMock,
} = vi.hoisted(() => ({
  requireRoleMock: vi.fn(async () => ({ user: { id: "admin-1", role: "ADMIN" } })),
  orderFindUniqueMock: vi.fn(),
  orderUpdateMock: vi.fn(),
  orderUpdateManyMock: vi.fn(),
  orderPaymentUpdateManyMock: vi.fn(),
  entitlementFindUniqueMock: vi.fn(),
  entitlementUpdateManyMock: vi.fn(),
  entitlementUpdateMock: vi.fn(),
  entitlementCreateMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  productFindUniqueMock: vi.fn(),
  clientProfileFindUniqueMock: vi.fn(),
  clientProgramUpsertMock: vi.fn(),
  orderItemFindManyMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireRole: requireRoleMock,
}));

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      $transaction: transactionMock,
      order: {
        findUnique: orderFindUniqueMock,
        updateMany: orderUpdateManyMock,
      },
      entitlement: {
        findUnique: entitlementFindUniqueMock,
        update: entitlementUpdateMock,
      },
      user: { findUnique: userFindUniqueMock },
      product: { findUnique: productFindUniqueMock },
    },
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn(), info: vi.fn() },
}));

function mockTransactionPassthrough() {
  transactionMock.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      order: { update: orderUpdateMock },
      orderPayment: { updateMany: orderPaymentUpdateManyMock },
      orderItem: { findMany: orderItemFindManyMock },
      entitlement: {
        findUnique: entitlementFindUniqueMock,
        update: entitlementUpdateMock,
        updateMany: entitlementUpdateManyMock,
        create: entitlementCreateMock,
      },
      clientProfile: { findUnique: clientProfileFindUniqueMock },
      clientProgram: { upsert: clientProgramUpsertMock },
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  requireRoleMock.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
  mockTransactionPassthrough();
});

describe("markOrderRefundedAction", () => {
  it("refunds a paid order and revokes its entitlements", async () => {
    orderFindUniqueMock.mockResolvedValue({ id: "order-1", status: "PAID" });
    orderUpdateMock.mockResolvedValue({});
    orderPaymentUpdateManyMock.mockResolvedValue({ count: 1 });
    orderItemFindManyMock.mockResolvedValue([
      { id: "item-1" },
      { id: "item-2" },
    ]);
    entitlementUpdateManyMock.mockResolvedValue({ count: 2 });

    const result = await markOrderRefundedAction("order-1", "Offline refund");

    expect(result.success).toBe(true);
    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "REFUNDED" },
    });
    expect(entitlementUpdateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "ACTIVE" }),
        data: expect.objectContaining({
          status: "REVOKED",
          reason: "Offline refund",
        }),
      }),
    );
  });

  it("is idempotent for already-refunded orders", async () => {
    orderFindUniqueMock.mockResolvedValue({ id: "order-1", status: "REFUNDED" });

    const result = await markOrderRefundedAction("order-1");

    expect(result.success).toBe(true);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("rejects orders that were never paid", async () => {
    orderFindUniqueMock.mockResolvedValue({ id: "order-1", status: "PENDING" });

    const result = await markOrderRefundedAction("order-1");

    expect(result.success).toBe(false);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("fails when the caller is not an admin", async () => {
    requireRoleMock.mockRejectedValue(new Error("Forbidden"));

    const result = await markOrderRefundedAction("order-1");

    expect(result.success).toBe(false);
    expect(orderFindUniqueMock).not.toHaveBeenCalled();
  });
});

describe("archivePaidOrdersAction", () => {
  it("archives only eligible paid orders and records the admin", async () => {
    orderUpdateManyMock.mockResolvedValue({ count: 2 });

    const result = await archivePaidOrdersAction(["order-1", "order-1", "order-2"]);

    expect(result).toEqual({ success: true, data: { archivedCount: 2 } });
    expect(orderUpdateManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["order-1", "order-2"] },
        status: "PAID",
        archivedAt: null,
      },
      data: {
        archivedAt: expect.any(Date),
        archivedById: "admin-1",
      },
    });
  });

  it("rejects empty or oversized archive selections", async () => {
    const emptyResult = await archivePaidOrdersAction([]);
    const oversizedResult = await archivePaidOrdersAction(
      Array.from({ length: 101 }, (_, index) => `order-${index}`),
    );

    expect(emptyResult.success).toBe(false);
    expect(oversizedResult.success).toBe(false);
    expect(orderUpdateManyMock).not.toHaveBeenCalled();
  });

  it("requires an admin", async () => {
    requireRoleMock.mockRejectedValue(new Error("Forbidden"));

    const result = await archivePaidOrdersAction(["order-1"]);

    expect(result.success).toBe(false);
    expect(orderUpdateManyMock).not.toHaveBeenCalled();
  });

  it("allows a coach to archive only assigned clients' paid orders", async () => {
    requireRoleMock.mockResolvedValue({
      user: { id: "coach-1", role: "COACH" },
    });
    orderUpdateManyMock.mockResolvedValue({ count: 1 });

    const result = await archivePaidOrdersAction(["order-1"]);

    expect(result).toEqual({ success: true, data: { archivedCount: 1 } });
    expect(orderUpdateManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["order-1"] },
        status: "PAID",
        archivedAt: null,
        user: { clientProfile: { is: { coachId: "coach-1" } } },
      },
      data: {
        archivedAt: expect.any(Date),
        archivedById: "coach-1",
      },
    });
  });
});

describe("restorePaidOrdersAction", () => {
  it("restores archived paid orders without changing their payment records", async () => {
    orderUpdateManyMock.mockResolvedValue({ count: 1 });

    const result = await restorePaidOrdersAction(["order-1"]);

    expect(result).toEqual({ success: true, data: { restoredCount: 1 } });
    expect(orderUpdateManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["order-1"] },
        status: "PAID",
        archivedAt: { not: null },
      },
      data: { archivedAt: null, archivedById: null },
    });
  });

  it("allows a coach to restore only assigned clients' archived orders", async () => {
    requireRoleMock.mockResolvedValue({
      user: { id: "coach-1", role: "COACH" },
    });
    orderUpdateManyMock.mockResolvedValue({ count: 1 });

    const result = await restorePaidOrdersAction(["order-1"]);

    expect(result).toEqual({ success: true, data: { restoredCount: 1 } });
    expect(orderUpdateManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["order-1"] },
        status: "PAID",
        archivedAt: { not: null },
        user: { clientProfile: { is: { coachId: "coach-1" } } },
      },
      data: { archivedAt: null, archivedById: null },
    });
  });
});

describe("grantEntitlementAction", () => {
  it("creates a MANUAL entitlement with a stable idempotency key", async () => {
    userFindUniqueMock.mockResolvedValue({ id: "user-1" });
    productFindUniqueMock.mockResolvedValue({
      id: "product-1",
      programId: "program-1",
      status: "PUBLISHED",
    });
    entitlementFindUniqueMock.mockResolvedValue(null);
    entitlementCreateMock.mockResolvedValue({ id: "ent-1" });
    clientProfileFindUniqueMock.mockResolvedValue({ id: "profile-1" });
    clientProgramUpsertMock.mockResolvedValue({});

    const result = await grantEntitlementAction({
      userEmail: "  Fan@Example.com ",
      productSlug: "glute-builder",
      reason: "Support comp",
    });

    expect(result.success).toBe(true);
    expect(userFindUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "fan@example.com" } }),
    );
    expect(entitlementCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        productId: "product-1",
        grantType: "MANUAL",
        status: "ACTIVE",
        idempotencyKey: "manual:user:user-1:product:product-1",
      }),
    });
    expect(clientProgramUpsertMock).toHaveBeenCalled();
  });

  it("reactivates a previously revoked entitlement", async () => {
    userFindUniqueMock.mockResolvedValue({ id: "user-1" });
    productFindUniqueMock.mockResolvedValue({
      id: "product-1",
      programId: null,
      status: "PUBLISHED",
    });
    entitlementFindUniqueMock.mockResolvedValue({
      id: "ent-1",
      status: "REVOKED",
    });
    entitlementUpdateMock.mockResolvedValue({ id: "ent-1", status: "ACTIVE" });

    const result = await grantEntitlementAction({
      userId: "user-1",
      productId: "product-1",
    });

    expect(result.success).toBe(true);
    expect(entitlementUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ACTIVE" }),
      }),
    );
    expect(entitlementCreateMock).not.toHaveBeenCalled();
  });

  it("rejects draft products", async () => {
    userFindUniqueMock.mockResolvedValue({ id: "user-1" });
    productFindUniqueMock.mockResolvedValue({
      id: "product-1",
      programId: null,
      status: "DRAFT",
    });

    const result = await grantEntitlementAction({
      userId: "user-1",
      productId: "product-1",
    });

    expect(result.success).toBe(false);
    expect(entitlementCreateMock).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND for unknown users", async () => {
    userFindUniqueMock.mockResolvedValue(null);

    const result = await grantEntitlementAction({
      userEmail: "missing@example.com",
      productId: "product-1",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_FOUND");
  });
});

describe("revokeEntitlementAction", () => {
  it("revokes an active entitlement", async () => {
    entitlementFindUniqueMock.mockResolvedValue({
      id: "ent-1",
      status: "ACTIVE",
    });
    entitlementUpdateMock.mockResolvedValue({ id: "ent-1", status: "REVOKED" });

    const result = await revokeEntitlementAction("ent-1", "Chargeback");

    expect(result.success).toBe(true);
    expect(entitlementUpdateMock).toHaveBeenCalledWith({
      where: { id: "ent-1" },
      data: expect.objectContaining({
        status: "REVOKED",
        reason: "Chargeback",
      }),
    });
  });

  it("is a no-op for already-revoked entitlements", async () => {
    entitlementFindUniqueMock.mockResolvedValue({
      id: "ent-1",
      status: "REVOKED",
    });

    const result = await revokeEntitlementAction("ent-1");

    expect(result.success).toBe(true);
    expect(entitlementUpdateMock).not.toHaveBeenCalled();
  });
});
