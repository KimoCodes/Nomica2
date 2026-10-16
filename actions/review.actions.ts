"use server";

import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import { hasProductEntitlement } from "@/server/services/entitlement.service";

export type ExistingReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
};

/** The signed-in client's review for a product, if any. */
export async function getMyProductReviewAction(
  productId: string,
): Promise<
  { success: boolean; data?: { review: ExistingReview | null }; error?: { message: string } }
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createSuccessResponse({ review: null });
    }
    const review = await prisma.review.findUnique({
      where: {
        userId_productId: { userId: session.user.id, productId },
      },
      select: { id: true, rating: true, title: true, body: true },
    });
    return createSuccessResponse({ review });
  } catch {
    return createErrorResponse("Could not load review", "INTERNAL_ERROR");
  }
}

export async function submitProductReviewAction(input: {
  productId: string;
  rating: number;
  title?: string;
  body: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== Role.CLIENT) {
      return createErrorResponse("Sign in to leave a review", "UNAUTHORIZED");
    }

    const rating = Number(input.rating);
    const body = (input.body ?? "").trim();
    const title = (input.title ?? "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return createErrorResponse("Rating must be between 1 and 5", "VALIDATION_ERROR");
    }
    if (body.length < 10 || body.length > 2000) {
      return createErrorResponse(
        "Review must be between 10 and 2000 characters",
        "VALIDATION_ERROR",
      );
    }
    if (title.length > 100) {
      return createErrorResponse("Title must be 100 characters or fewer", "VALIDATION_ERROR");
    }

    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      select: { id: true, slug: true, kind: true },
    });
    if (!product) {
      return createErrorResponse("Product not found", "NOT_FOUND");
    }

    const ownsProduct = await hasProductEntitlement(session.user.id, input.productId);
    if (!ownsProduct) {
      return createErrorResponse(
        "You can review programs you own",
        "NOT_ENTITLED",
      );
    }

    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: input.productId,
        },
      },
      create: {
        userId: session.user.id,
        productId: input.productId,
        rating,
        title: title || null,
        body,
        isVerified: true,
        isPublished: true,
      },
      update: {
        rating,
        title: title || null,
        body,
        isVerified: true,
        isPublished: true,
      },
    });

    revalidatePath(`/programs/${product.slug}`);
    revalidatePath("/programs");
    return createSuccessResponse({ saved: true });
  } catch {
    return createErrorResponse("Could not save your review", "INTERNAL_ERROR");
  }
}
