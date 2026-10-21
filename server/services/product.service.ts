import { ProductFocus, ProductKind, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ProductFilter = {
  kind?: ProductKind;
  focus?: ProductFocus;
  status?: ProductStatus;
  take?: number;
  q?: string;
};

export async function getProducts(filter: ProductFilter = {}) {
  const query = filter.q?.trim();
  return prisma.product.findMany({
    where: {
      status: filter.status ?? ProductStatus.PUBLISHED,
      ...(filter.kind && { kind: filter.kind }),
      ...(filter.focus && { focus: filter.focus }),
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { tagline: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    ...(filter.take && { take: filter.take }),
    include: {
      bundleItems: { select: { itemId: true } },
      _count: {
        select: {
          purchases: { where: { status: "COMPLETED" } },
          reviews: true,
        },
      },
    },
  });
}

/**
 * Catalog payload for /programs. The page only needs the fields selected here.
 * Fetch bundle membership alongside products so the relation read does not
 * have to wait for the product query to return its parent IDs.
 */
export async function getCatalogProducts(
  filter: Pick<ProductFilter, "kind" | "q"> = {},
) {
  const query = filter.q?.trim();
  const where = {
    status: ProductStatus.PUBLISHED,
    ...(filter.kind && { kind: filter.kind }),
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { tagline: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
      ],
    }),
  };

  const [products, bundleItems] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        slug: true,
        kind: true,
        name: true,
        tagline: true,
        description: true,
        priceCents: true,
        compareAtCents: true,
        durationLabel: true,
        daysPerWeek: true,
        focus: true,
        features: true,
        _count: {
          select: {
            purchases: { where: { status: "COMPLETED" } },
            reviews: true,
          },
        },
      },
    }),
    prisma.bundleItem.findMany({
      where: { bundle: { is: where } },
      select: { bundleId: true, itemId: true },
    }),
  ]);

  const bundleItemsByProduct = new Map<string, { itemId: string }[]>();
  for (const item of bundleItems) {
    const items = bundleItemsByProduct.get(item.bundleId) ?? [];
    items.push({ itemId: item.itemId });
    bundleItemsByProduct.set(item.bundleId, items);
  }

  return products.map((product) => ({
    ...product,
    bundleItems: bundleItemsByProduct.get(product.id) ?? [],
  }));
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      program: {
        include: {
          weeks: {
            orderBy: { weekNumber: "asc" },
            include: {
              days: {
                orderBy: { dayNumber: "asc" },
                select: { id: true, dayNumber: true, title: true },
              },
            },
          },
        },
      },
      bundleItems: {
        include: {
          item: true,
        },
      },
      reviews: {
        where: { isPublished: true },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: {
        select: {
          purchases: { where: { status: "COMPLETED" } },
          reviews: true,
        },
      },
    },
  });
}

/** Published bundles that contain the given product (for "also in a bundle" hints). */
export async function getPublishedBundlesContaining(productId: string) {
  return prisma.product.findMany({
    where: {
      kind: "BUNDLE",
      status: "PUBLISHED",
      bundleItems: { some: { itemId: productId } },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      compareAtCents: true,
    },
    orderBy: { sortOrder: "asc" },
    take: 2,
  });
}

/** Full workout structure is only loaded after the caller verifies access. */
export async function getProtectedProductProgram(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      program: {
        include: {
          weeks: {
            orderBy: { weekNumber: "asc" },
            include: {
              days: {
                orderBy: { dayNumber: "asc" },
                include: {
                  exercises: {
                    orderBy: { order: "asc" },
                    include: { exercise: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      program: true,
      bundleItems: { include: { item: true } },
      _count: {
        select: {
          purchases: { where: { status: "COMPLETED" } },
          reviews: true,
        },
      },
    },
  });
}

export async function getBundleProducts() {
  return prisma.product.findMany({
    where: { kind: "BUNDLE", status: ProductStatus.PUBLISHED },
    orderBy: { sortOrder: "asc" },
    include: {
      bundleItems: {
        include: {
          item: {
            select: {
              id: true,
              name: true,
              tagline: true,
              priceCents: true,
              durationLabel: true,
            },
          },
        },
      },
      _count: {
        select: { purchases: { where: { status: "COMPLETED" } } },
      },
    },
  });
}

export async function getPublishedReviews(limit = 4) {
  return prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true } },
      product: { select: { name: true } },
    },
  });
}

export async function getAverageRating(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId, isPublished: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._avg.rating ?? 0,
    count: result._count.rating,
  };
}
