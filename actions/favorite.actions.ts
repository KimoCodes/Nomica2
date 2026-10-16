"use server";

import { FavoriteType, Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import { formatPrice } from "@/constants/subscriptions";

/** Toggle a product in the signed-in client's saved list. */
export async function toggleSavedProductAction(productId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== Role.CLIENT) {
      return createErrorResponse("Sign in to save programs", "UNAUTHORIZED");
    }
    if (!productId || productId.length > 100) {
      return createErrorResponse("Invalid product", "VALIDATION_ERROR");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true },
    });
    if (!product || (product.status !== "PUBLISHED" && product.status !== "ARCHIVED")) {
      return createErrorResponse("Product not found", "NOT_FOUND");
    }

    const where = {
      userId_type_targetId: {
        userId: session.user.id,
        type: FavoriteType.PROGRAM,
        targetId: productId,
      },
    };
    const existing = await prisma.favorite.findUnique({ where });

    if (existing) {
      await prisma.favorite.delete({ where });
      return createSuccessResponse({ saved: false });
    }

    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        type: FavoriteType.PROGRAM,
        targetId: productId,
      },
    });
    return createSuccessResponse({ saved: true });
  } catch {
    return createErrorResponse("Could not update saved items", "INTERNAL_ERROR");
  }
}

export async function getSavedProductIdsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createSuccessResponse({ savedIds: [] });
    }
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id, type: FavoriteType.PROGRAM },
      select: { targetId: true },
    });
    return createSuccessResponse({ savedIds: favorites.map((f) => f.targetId) });
  } catch {
    return createSuccessResponse({ savedIds: [] });
  }
}

type SavedProduct = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  kind: string;
  priceCents: number;
};

export async function listSavedProductsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== Role.CLIENT) {
      return createErrorResponse("Sign in to view saved programs", "UNAUTHORIZED");
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id, type: FavoriteType.PROGRAM },
      orderBy: { createdAt: "desc" },
      select: { targetId: true },
    });

    const products = favorites.length
      ? await prisma.product.findMany({
        where: { id: { in: favorites.map((f) => f.targetId) } },
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          kind: true,
          priceCents: true,
        },
      })
      : [];

    const order = new Map(favorites.map((f, i) => [f.targetId, i]));
    const sorted: SavedProduct[] = products.sort(
      (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
    );

    return createSuccessResponse({
      products: sorted.map((p) => ({
        ...p,
        priceLabel: formatPrice(p.priceCents),
      })),
    });
  } catch {
    return createErrorResponse("Could not load saved programs", "INTERNAL_ERROR");
  }
}
