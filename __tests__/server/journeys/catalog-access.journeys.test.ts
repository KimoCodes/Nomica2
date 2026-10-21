import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getVideo } from "@/app/api/media/videos/[exerciseId]/route";
import { getProducts, getBundleProducts } from "@/server/services/product.service";
import {
  hasProductEntitlement,
  getOwnedCatalogProductIds,
} from "@/server/services/entitlement.service";

const {
  authMock,
  productFindManyMock,
  clientProgramFindFirstMock,
  exerciseFindUniqueMock,
  entitlementFindFirstMock,
  entitlementFindManyMock,
  purchaseFindFirstMock,
  purchaseFindManyMock,
  siteSettingsFindFirstMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  productFindManyMock: vi.fn(),
  clientProgramFindFirstMock: vi.fn(),
  exerciseFindUniqueMock: vi.fn(),
  entitlementFindFirstMock: vi.fn(),
  entitlementFindManyMock: vi.fn(),
  purchaseFindFirstMock: vi.fn(),
  purchaseFindManyMock: vi.fn(),
  siteSettingsFindFirstMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: productFindManyMock },
    clientProgram: { findFirst: clientProgramFindFirstMock },
    exercise: { findUnique: exerciseFindUniqueMock },
    entitlement: {
      findFirst: entitlementFindFirstMock,
      findMany: entitlementFindManyMock,
    },
    purchase: {
      findFirst: purchaseFindFirstMock,
      findMany: purchaseFindManyMock,
    },
    siteSettings: { findFirst: siteSettingsFindFirstMock },
  },
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn(), info: vi.fn() },
}));

beforeEach(() => {
  vi.resetAllMocks();
  // Admin toggle defaults to enabled unless a test overrides it.
  siteSettingsFindFirstMock.mockResolvedValue({ videoGuidedWorkouts: true });
});

describe("Journey A — free account sees only published catalog", () => {
  it("queries the storefront with the PUBLISHED status filter by default", async () => {
    productFindManyMock.mockResolvedValue([]);

    await getProducts();

    expect(productFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "PUBLISHED" }),
      }),
    );
  });

  it("only lists published bundles", async () => {
    productFindManyMock.mockResolvedValue([]);

    await getBundleProducts();

    expect(productFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          kind: "BUNDLE",
          status: "PUBLISHED",
        }),
      }),
    );
  });
});

describe("Journey C — entitlement-gated access", () => {
  it("grants access through an active entitlement row", async () => {
    entitlementFindFirstMock.mockResolvedValue({ id: "ent-1" });

    await expect(hasProductEntitlement("user-1", "product-1")).resolves.toBe(
      true,
    );
  });

  it("falls back to completed legacy purchases", async () => {
    entitlementFindFirstMock.mockResolvedValue(null);
    purchaseFindFirstMock.mockResolvedValueOnce({ id: "purchase-1" });

    await expect(hasProductEntitlement("user-1", "product-1")).resolves.toBe(
      true,
    );
  });

  it("denies access when no entitlement or purchase exists", async () => {
    entitlementFindFirstMock.mockResolvedValue(null);
    purchaseFindFirstMock.mockResolvedValue(null);

    await expect(hasProductEntitlement("user-1", "product-1")).resolves.toBe(
      false,
    );
  });

  it("expands bundle purchases into owned product ids", async () => {
    entitlementFindManyMock.mockResolvedValue([]);
    purchaseFindManyMock.mockResolvedValue([
      {
        productId: "bundle-1",
        product: {
          kind: "BUNDLE",
          bundleItems: [{ itemId: "child-1" }, { itemId: "child-2" }],
        },
      },
    ]);

    const ids = await getOwnedCatalogProductIds("user-1");

    expect(ids).toEqual(
      expect.arrayContaining(["bundle-1", "child-1", "child-2"]),
    );
  });
});

describe("Journey C — protected video delivery endpoint", () => {
  const EXERCISE_URL =
    "https://res.cloudinary.com/demo/video/upload/v1/sample.mp4";

  function mockRequest(exerciseId = "ex-1") {
    return {
      params: Promise.resolve({ exerciseId }),
    } as unknown as { params: Promise<{ exerciseId: string }> };
  }

  it("returns 401 for signed-out requests", async () => {
    authMock.mockResolvedValue(null);

    const response = await getVideo(
      new Request("http://localhost/api/media/videos/ex-1"),
      mockRequest(),
    );

    expect(response.status).toBe(401);
    expect(exerciseFindUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the exercise has no video", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-1", role: "CLIENT" },
    });
    exerciseFindUniqueMock.mockResolvedValue({ videoUrl: null });

    const response = await getVideo(
      new Request("http://localhost/api/media/videos/ex-1"),
      mockRequest(),
    );

    expect(response.status).toBe(404);
  });

  it("returns 403 for clients without ownership or assignment", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-1", role: "CLIENT" },
    });
    exerciseFindUniqueMock.mockResolvedValue({ videoUrl: EXERCISE_URL });
    clientProgramFindFirstMock.mockResolvedValue(null);
    entitlementFindManyMock.mockResolvedValue([]);
    purchaseFindManyMock.mockResolvedValue([]);

    const response = await getVideo(
      new Request("http://localhost/api/media/videos/ex-1"),
      mockRequest(),
    );

    expect(response.status).toBe(403);
  });

  it("redirects entitled clients to the delivery URL", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-1", role: "CLIENT" },
    });
    exerciseFindUniqueMock.mockResolvedValue({ videoUrl: EXERCISE_URL });
    clientProgramFindFirstMock.mockResolvedValue({ id: "cp-1" });
    entitlementFindManyMock.mockResolvedValue([]);
    purchaseFindManyMock.mockResolvedValue([]);

    const response = await getVideo(
      new Request("http://localhost/api/media/videos/ex-1"),
      mockRequest(),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(EXERCISE_URL);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns 404 for clients when admin disabled video-guided workouts", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-1", role: "CLIENT" },
    });
    exerciseFindUniqueMock.mockResolvedValue({ videoUrl: EXERCISE_URL });
    clientProgramFindFirstMock.mockResolvedValue({ id: "cp-1" });
    entitlementFindManyMock.mockResolvedValue([]);
    purchaseFindManyMock.mockResolvedValue([]);
    siteSettingsFindFirstMock.mockResolvedValue({ videoGuidedWorkouts: false });

    const response = await getVideo(
      new Request("http://localhost/api/media/videos/ex-1"),
      mockRequest(),
    );

    expect(response.status).toBe(404);
  });

  it("still serves staff previews when video-guided workouts are disabled", async () => {
    authMock.mockResolvedValue({
      user: { id: "coach-1", role: "COACH" },
    });
    exerciseFindUniqueMock.mockResolvedValue({ videoUrl: EXERCISE_URL });
    siteSettingsFindFirstMock.mockResolvedValue({ videoGuidedWorkouts: false });

    const response = await getVideo(
      new Request("http://localhost/api/media/videos/ex-1"),
      mockRequest(),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(EXERCISE_URL);
  });

  it("allows coaches without a personal entitlement", async () => {
    authMock.mockResolvedValue({
      user: { id: "coach-1", role: "COACH" },
    });
    exerciseFindUniqueMock.mockResolvedValue({ videoUrl: EXERCISE_URL });

    const response = await getVideo(
      new Request("http://localhost/api/media/videos/ex-1"),
      mockRequest(),
    );

    expect(response.status).toBe(307);
    expect(clientProgramFindFirstMock).not.toHaveBeenCalled();
  });
});
