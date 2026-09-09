"use server";

import { Role, ProductKind, ProductFocus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

type ProductInput = {
  name: string;
  slug: string;
  kind: ProductKind;
  tagline?: string;
  description?: string;
  priceCents: number;
  compareAtCents?: number;
  durationLabel?: string;
  durationWeeks?: number;
  durationDays?: number;
  daysPerWeek?: number;
  focus?: ProductFocus;
  features: string[];
  imageUrl?: string;
  isActive: boolean;
  sortOrder?: number;
  programId?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProductAction(
  input: ProductInput,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.ADMIN]);

    const slug = input.slug || slugify(input.name);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return createErrorResponse("A product with this slug already exists", "VALIDATION_ERROR");
    }

    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug,
        kind: input.kind,
        tagline: input.tagline || null,
        description: input.description || null,
        priceCents: input.priceCents,
        compareAtCents: input.compareAtCents || null,
        durationLabel: input.durationLabel || "Self-paced",
        durationWeeks: input.durationWeeks || null,
        durationDays: input.durationDays || null,
        daysPerWeek: input.daysPerWeek || null,
        focus: input.focus || null,
        features: input.features,
        imageUrl: input.imageUrl || null,
        isActive: input.isActive,
        sortOrder: input.sortOrder || 0,
        programId: input.programId || null,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/programs");
    revalidatePath("/pricing");
    return createSuccessResponse({ id: product.id });
  } catch (error) {
    logger.error({ err: error, action: "createProductAction" }, "Failed to create product");
    return createErrorResponse("Failed to create product", "INTERNAL_ERROR");
  }
}

export async function updateProductAction(
  productId: string,
  input: ProductInput,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.ADMIN]);

    const slug = input.slug || slugify(input.name);

    const existing = await prisma.product.findFirst({
      where: { slug, id: { not: productId } },
    });
    if (existing) {
      return createErrorResponse("A product with this slug already exists", "VALIDATION_ERROR");
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        slug,
        kind: input.kind,
        tagline: input.tagline || null,
        description: input.description || null,
        priceCents: input.priceCents,
        compareAtCents: input.compareAtCents || null,
        durationLabel: input.durationLabel || "Self-paced",
        durationWeeks: input.durationWeeks || null,
        durationDays: input.durationDays || null,
        daysPerWeek: input.daysPerWeek || null,
        focus: input.focus || null,
        features: input.features,
        imageUrl: input.imageUrl || null,
        isActive: input.isActive,
        sortOrder: input.sortOrder || 0,
        programId: input.programId || null,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/programs");
    revalidatePath(`/programs/${product.slug}`);
    revalidatePath("/pricing");
    return createSuccessResponse({ id: product.id });
  } catch (error) {
    logger.error({ err: error, action: "updateProductAction" }, "Failed to update product");
    return createErrorResponse("Failed to update product", "INTERNAL_ERROR");
  }
}

export async function deleteProductAction(
  productId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.ADMIN]);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { purchases: { take: 1 } },
    });

    if (!product) {
      return createErrorResponse("Product not found", "NOT_FOUND");
    }

    if (product.purchases.length > 0) {
      return createErrorResponse(
        "Cannot delete a product with existing purchases. Deactivate it instead.",
        "VALIDATION_ERROR",
      );
    }

    await prisma.product.delete({ where: { id: productId } });

    revalidatePath("/admin/products");
    revalidatePath("/programs");
    revalidatePath("/pricing");
    return createSuccessResponse({ id: productId });
  } catch (error) {
    logger.error({ err: error, action: "deleteProductAction" }, "Failed to delete product");
    return createErrorResponse("Failed to delete product", "INTERNAL_ERROR");
  }
}

export async function toggleProductActiveAction(
  productId: string,
): Promise<ApiResponse<{ id: string; isActive: boolean }>> {
  try {
    const session = await requireRole([Role.ADMIN]);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return createErrorResponse("Product not found", "NOT_FOUND");
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
    });

    revalidatePath("/admin/products");
    revalidatePath("/programs");
    revalidatePath("/pricing");
    return createSuccessResponse({ id: updated.id, isActive: updated.isActive });
  } catch (error) {
    logger.error({ err: error, action: "toggleProductActiveAction" }, "Failed to toggle product");
    return createErrorResponse("Failed to toggle product", "INTERNAL_ERROR");
  }
}

export async function getAdminProducts() {
  return prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      bundleItems: { select: { id: true } },
      includedIn: { select: { id: true, bundle: { select: { name: true } } } },
      purchases: { select: { id: true } },
      reviews: { select: { id: true } },
      program: { select: { id: true, title: true } },
      _count: { select: { purchases: true, reviews: true } },
    },
  });
}

export async function getAdminProductById(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      bundleItems: { include: { item: { select: { id: true, name: true, slug: true } } } },
      includedIn: { include: { bundle: { select: { id: true, name: true, slug: true } } } },
      program: { select: { id: true, title: true } },
    },
  });
}

export async function getAllPrograms() {
  return prisma.program.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}
