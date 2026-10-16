import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitProductReviewAction } from "@/actions/review.actions";

const {
  authMock,
  reviewFindUniqueMock,
  reviewUpsertMock,
  productFindUniqueMock,
  entitlementMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  reviewFindUniqueMock: vi.fn(),
  reviewUpsertMock: vi.fn(),
  productFindUniqueMock: vi.fn(),
  entitlementMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findUnique: reviewFindUniqueMock,
      upsert: reviewUpsertMock,
    },
    product: { findUnique: productFindUniqueMock },
  },
}));

vi.mock("@/server/services/entitlement.service", () => ({
  hasProductEntitlement: entitlementMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

describe("submitProductReviewAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authMock.mockResolvedValue({ user: { id: "client-1", role: "CLIENT" } });
    productFindUniqueMock.mockResolvedValue({ id: "prod-1", slug: "glute-builder", kind: "PROGRAM" });
    entitlementMock.mockResolvedValue(true);
    reviewUpsertMock.mockResolvedValue({});
    revalidatePathMock.mockReturnValue(undefined);
  });

  it("rejects unauthenticated users", async () => {
    authMock.mockResolvedValue(null);

    const result = await submitProductReviewAction({
      productId: "prod-1",
      rating: 5,
      body: "Great program, loved every week of it.",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("UNAUTHORIZED");
    expect(reviewUpsertMock).not.toHaveBeenCalled();
  });

  it("rejects invalid ratings and short bodies", async () => {
    const badRating = await submitProductReviewAction({
      productId: "prod-1",
      rating: 7,
      body: "Great program, loved every week of it.",
    });
    expect(badRating.success).toBe(false);
    expect(badRating.error?.code).toBe("VALIDATION_ERROR");

    const shortBody = await submitProductReviewAction({
      productId: "prod-1",
      rating: 5,
      body: "short",
    });
    expect(shortBody.success).toBe(false);
    expect(shortBody.error?.code).toBe("VALIDATION_ERROR");
  });

  it("rejects users who do not own the product", async () => {
    entitlementMock.mockResolvedValue(false);

    const result = await submitProductReviewAction({
      productId: "prod-1",
      rating: 5,
      body: "Great program, loved every week of it.",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_ENTITLED");
    expect(reviewUpsertMock).not.toHaveBeenCalled();
  });

  it("upserts a verified review for owners and revalidates", async () => {
    const result = await submitProductReviewAction({
      productId: "prod-1",
      rating: 4,
      title: "Solid progression",
      body: "Great program, loved every week of it.",
    });

    expect(result.success).toBe(true);
    expect(reviewUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_productId: { userId: "client-1", productId: "prod-1" },
        },
        create: expect.objectContaining({ rating: 4, isVerified: true, isPublished: true }),
        update: expect.objectContaining({ rating: 4, isVerified: true }),
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/programs/glute-builder");
  });
});
