"use server";

import { ProductStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

/**
 * Mark a paid order as refunded (offline/comped refunds or missed webhooks).
 * Revokes every entitlement granted by the order's items so catalog access
 * ends immediately. Real Stripe refunds also revoke via the webhook; this
 * action is the admin path and is idempotent for already-refunded orders.
 */
export async function markOrderRefundedAction(
  orderId: string,
  reason?: string,
): Promise<ApiResponse<{ id: string; status: string }>> {
  try {
    await requireRole([Role.ADMIN]);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });
    if (!order) {
      return createErrorResponse("Order not found", "NOT_FOUND");
    }
    if (order.status === "REFUNDED") {
      return createSuccessResponse({ id: order.id, status: order.status });
    }
    if (!["PAID", "PARTIALLY_REFUNDED"].includes(order.status)) {
      return createErrorResponse(
        `Only paid orders can be refunded (current status: ${order.status})`,
        "VALIDATION_ERROR",
      );
    }

    const refundReason = reason?.trim() || "Marked refunded by admin";

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "REFUNDED" },
      });
      await tx.orderPayment.updateMany({
        where: { orderId, status: { not: "refunded" } },
        data: { status: "refunded" },
      });
      const items = await tx.orderItem.findMany({
        where: { orderId },
        select: { id: true },
      });
      await tx.entitlement.updateMany({
        where: {
          orderItemId: { in: items.map((item) => item.id) },
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
          reason: refundReason,
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/entitlements");
    return createSuccessResponse({ id: orderId, status: "REFUNDED" });
  } catch (error) {
    logger.error(
      { err: error, action: "markOrderRefundedAction", orderId },
      "Failed to mark order refunded",
    );
    return createErrorResponse("Failed to refund order", "INTERNAL_ERROR");
  }
}

export type GrantEntitlementInput = {
  userEmail?: string;
  userId?: string;
  productSlug?: string;
  productId?: string;
  reason?: string;
};

/**
 * Manually grant catalog access (support/comp/migration cases). Creates or
 * reactivates a durable Entitlement row and mirrors purchase behavior by
 * linking the customer's ClientProgram when the product has one.
 */
export async function grantEntitlementAction(
  input: GrantEntitlementInput,
): Promise<ApiResponse<{ entitlementId: string; userId: string; productId: string }>> {
  try {
    await requireRole([Role.ADMIN]);

    const email = input.userEmail?.trim().toLowerCase();
    const user = input.userId
      ? await prisma.user.findUnique({ where: { id: input.userId }, select: { id: true } })
      : email
      ? await prisma.user.findUnique({ where: { email }, select: { id: true } })
      : null;
    if (!user) {
      return createErrorResponse("User not found", "NOT_FOUND");
    }

    const product = input.productId
      ? await prisma.product.findUnique({
        where: { id: input.productId },
        select: { id: true, programId: true, status: true },
      })
      : input.productSlug
      ? await prisma.product.findUnique({
        where: { slug: input.productSlug },
        select: { id: true, programId: true, status: true },
      })
      : null;
    if (!product) {
      return createErrorResponse("Product not found", "NOT_FOUND");
    }
    if (product.status === ProductStatus.DRAFT) {
      return createErrorResponse(
        "Cannot grant access to a draft product",
        "VALIDATION_ERROR",
      );
    }

    const grantReason = input.reason?.trim() || "Granted by admin";
    const idempotencyKey = `manual:user:${user.id}:product:${product.id}`;

    const entitlement = await prisma.$transaction(async (tx) => {
      const existing = await tx.entitlement.findUnique({
        where: { idempotencyKey },
      });
      const row = existing
        ? await tx.entitlement.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            grantedAt: new Date(),
            revokedAt: null,
            reason: grantReason,
          },
        })
        : await tx.entitlement.create({
          data: {
            userId: user.id,
            productId: product.id,
            grantType: "MANUAL",
            status: "ACTIVE",
            idempotencyKey,
            reason: grantReason,
          },
        });

      if (product.programId) {
        const clientProfile = await tx.clientProfile.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });
        if (clientProfile) {
          await tx.clientProgram.upsert({
            where: { entitlementId: row.id },
            update: {},
            create: {
              clientProfileId: clientProfile.id,
              programId: product.programId,
              entitlementId: row.id,
            },
          });
        }
      }

      return row;
    });

    revalidatePath("/admin/entitlements");
    revalidatePath("/admin/orders");
    return createSuccessResponse({
      entitlementId: entitlement.id,
      userId: user.id,
      productId: product.id,
    });
  } catch (error) {
    logger.error(
      { err: error, action: "grantEntitlementAction" },
      "Failed to grant entitlement",
    );
    return createErrorResponse("Failed to grant access", "INTERNAL_ERROR");
  }
}

/** Revoke an active entitlement, ending catalog access immediately. */
export async function revokeEntitlementAction(
  entitlementId: string,
  reason?: string,
): Promise<ApiResponse<{ id: string; status: string }>> {
  try {
    await requireRole([Role.ADMIN]);

    const entitlement = await prisma.entitlement.findUnique({
      where: { id: entitlementId },
      select: { id: true, status: true },
    });
    if (!entitlement) {
      return createErrorResponse("Entitlement not found", "NOT_FOUND");
    }
    if (entitlement.status === "REVOKED") {
      return createSuccessResponse({ id: entitlement.id, status: "REVOKED" });
    }

    const revokeReason = reason?.trim() || "Revoked by admin";
    await prisma.entitlement.update({
      where: { id: entitlementId },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        reason: revokeReason,
      },
    });

    revalidatePath("/admin/entitlements");
    revalidatePath("/admin/orders");
    return createSuccessResponse({ id: entitlementId, status: "REVOKED" });
  } catch (error) {
    logger.error(
      { err: error, action: "revokeEntitlementAction", entitlementId },
      "Failed to revoke entitlement",
    );
    return createErrorResponse("Failed to revoke access", "INTERNAL_ERROR");
  }
}
