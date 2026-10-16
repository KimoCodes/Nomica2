import { beforeEach, describe, expect, it, vi } from "vitest";
import { FavoriteType } from "@prisma/client";
import {
  getSavedProductIdsAction,
  listSavedProductsAction,
  toggleSavedProductAction,
} from "@/actions/favorite.actions";

const {
  authMock,
  favoriteFindUniqueMock,
  favoriteCreateMock,
  favoriteDeleteMock,
  favoriteFindManyMock,
  productFindUniqueMock,
  productFindManyMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  favoriteFindUniqueMock: vi.fn(),
  favoriteCreateMock: vi.fn(),
  favoriteDeleteMock: vi.fn(),
  favoriteFindManyMock: vi.fn(),
  productFindUniqueMock: vi.fn(),
  productFindManyMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    favorite: {
      findUnique: favoriteFindUniqueMock,
      create: favoriteCreateMock,
      delete: favoriteDeleteMock,
      findMany: favoriteFindManyMock,
    },
    product: {
      findUnique: productFindUniqueMock,
      findMany: productFindManyMock,
    },
  },
}));

describe("favorite.actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authMock.mockResolvedValue({ user: { id: "client-1", role: "CLIENT" } });
    productFindUniqueMock.mockResolvedValue({ id: "prod-1", status: "PUBLISHED" });
    favoriteFindUniqueMock.mockResolvedValue(null);
    favoriteCreateMock.mockResolvedValue({});
    favoriteDeleteMock.mockResolvedValue({});
    favoriteFindManyMock.mockResolvedValue([]);
    productFindManyMock.mockResolvedValue([]);
  });

  it("requires sign-in to toggle", async () => {
    authMock.mockResolvedValue(null);

    const result = await toggleSavedProductAction("prod-1");

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("UNAUTHORIZED");
  });

  it("creates a favorite when none exists", async () => {
    favoriteFindUniqueMock.mockResolvedValue(null);

    const result = await toggleSavedProductAction("prod-1");

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ saved: true });
    expect(favoriteCreateMock).toHaveBeenCalledWith({
      data: {
        userId: "client-1",
        type: FavoriteType.PROGRAM,
        targetId: "prod-1",
      },
    });
  });

  it("deletes an existing favorite on toggle", async () => {
    favoriteFindUniqueMock.mockResolvedValue({ id: "fav-1" });

    const result = await toggleSavedProductAction("prod-1");

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ saved: false });
    expect(favoriteDeleteMock).toHaveBeenCalled();
    expect(favoriteCreateMock).not.toHaveBeenCalled();
  });

  it("lists saved ids for the signed-in user", async () => {
    favoriteFindManyMock.mockResolvedValue([{ targetId: "a" }, { targetId: "b" }]);

    const result = await getSavedProductIdsAction();

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ savedIds: ["a", "b"] });
  });

  it("lists saved products in saved order", async () => {
    favoriteFindManyMock.mockResolvedValue([{ targetId: "p2" }, { targetId: "p1" }]);
    productFindManyMock.mockResolvedValue([
      { id: "p1", name: "A", slug: "a", tagline: null, kind: "PROGRAM", priceCents: 1000 },
      { id: "p2", name: "B", slug: "b", tagline: null, kind: "PROGRAM", priceCents: 2000 },
    ]);

    const result = await listSavedProductsAction();

    expect(result.success).toBe(true);
    const products = (result.data as { products: Array<{ id: string; priceLabel: string }> }).products;
    expect(products.map((p) => p.id)).toEqual(["p2", "p1"]);
    expect(products[0].priceLabel).toContain("20");
  });
});
