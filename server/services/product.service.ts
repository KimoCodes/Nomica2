import { ProductKind, ProductFocus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ProductFilter = {
  kind?: ProductKind;
  focus?: ProductFocus;
  isActive?: boolean;
  take?: number;
};

export async function getProducts(filter: ProductFilter = {}) {
  return prisma.product.findMany({
    where: {
      isActive: filter.isActive ?? true,
      ...(filter.kind && { kind: filter.kind }),
      ...(filter.focus && { focus: filter.focus }),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    ...(filter.take && { take: filter.take }),
    include: {
      _count: {
        select: { purchases: { where: { status: "COMPLETED" } }, reviews: true },
      },
    },
  });
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
        select: { purchases: { where: { status: "COMPLETED" } }, reviews: true },
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
        select: { purchases: { where: { status: "COMPLETED" } }, reviews: true },
      },
    },
  });
}

export async function getBundleProducts() {
  return prisma.product.findMany({
    where: { kind: "BUNDLE", isActive: true },
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
