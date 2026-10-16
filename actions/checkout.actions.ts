"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, getOrCreateStripeCustomer } from "@/lib/stripe";
import { getAppUrl } from "@/lib/resend";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";
import { getOwnedCatalogProductIds } from "@/server/services/entitlement.service";
import { calculateOneTimeOrderTotal } from "@/server/services/order-pricing";

export async function createProductCheckout(
  productId: string,
): Promise<ApiResponse<{ url: string }>> {
  const result = await createOrderCheckout([productId]);
  if (!result.success || !result.data) {
    return result as ApiResponse<{ url: string }>;
  }
  return createSuccessResponse({ url: result.data.url });
}

/**
 * Create a server-priced one-time checkout for one or more catalog products.
 * The request contains identifiers only; prices and bundle contents come from
 * the published database catalog.
 */
export async function createOrderCheckout(
  productIds: string[],
): Promise<ApiResponse<{ url: string; orderId: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const selectedIds = [
      ...new Set(
        productIds.filter((id) => typeof id === "string" && id.length > 0),
      ),
    ];
    if (
      selectedIds.length === 0 || selectedIds.length > 20 ||
      selectedIds.length !== productIds.length
    ) {
      return createErrorResponse(
        "Choose between 1 and 20 different programs or bundles",
        "VALIDATION_ERROR",
      );
    }

    const products = await prisma.product.findMany({
      where: { id: { in: selectedIds }, status: "PUBLISHED" },
      include: {
        bundleItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                status: true,
                kind: true,
                programId: true,
              },
            },
          },
        },
      },
    });

    if (products.length !== selectedIds.length) {
      return createErrorResponse(
        "One or more selected products are no longer available",
        "PRODUCT_UNAVAILABLE",
      );
    }

    const ownedIds = new Set(await getOwnedCatalogProductIds(session.user.id));
    const selectedBundleChildren = new Set<string>();

    for (const product of products) {
      if (!Number.isSafeInteger(product.priceCents) || product.priceCents < 0) {
        return createErrorResponse(
          "A selected product has an invalid price",
          "INVALID_PRICE",
        );
      }
      if (ownedIds.has(product.id)) {
        return createErrorResponse(
          `You already own ${product.name}`,
          "ALREADY_OWNED",
        );
      }
      if (product.kind === "BUNDLE") {
        if (
          product.bundleItems.length === 0 ||
          product.bundleItems.some(({ item }) =>
            item.status !== "PUBLISHED" || item.kind === "BUNDLE" || !item.programId
          )
        ) {
          return createErrorResponse(
            `${product.name} is temporarily unavailable`,
            "PRODUCT_UNAVAILABLE",
          );
        }
        for (const { item } of product.bundleItems) {
          if (ownedIds.has(item.id)) {
            return createErrorResponse(
              `You already own a program included in ${product.name}. Choose the remaining programs individually.`,
              "BUNDLE_CONTAINS_OWNED_PRODUCT",
            );
          }
          if (selectedBundleChildren.has(item.id)) {
            return createErrorResponse(
              "Your selection contains overlapping bundles. Choose one bundle or select individual programs.",
              "DUPLICATE_BUNDLE_CONTENT",
            );
          }
          selectedBundleChildren.add(item.id);
        }
      } else if (!product.programId) {
        return createErrorResponse(
          `${product.name} is temporarily unavailable`,
          "PRODUCT_UNAVAILABLE",
        );
      }
    }

    if (products.some((product) => selectedBundleChildren.has(product.id))) {
      return createErrorResponse(
        "Your selection includes a program and a bundle that already contains it. Remove one to avoid duplicate content.",
        "DUPLICATE_BUNDLE_CONTENT",
      );
    }

    const pricing = calculateOneTimeOrderTotal(products);

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        ...pricing,
        idempotencyKey: randomUUID(),
        items: {
          create: products.map((product) => ({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productKind: product.kind,
            unitAmountCents: product.priceCents,
            quantity: 1,
            lineTotalCents: product.priceCents,
            bundleProductIds: product.kind === "BUNDLE"
              ? product.bundleItems.map(({ item }) => item.id).sort()
              : [],
          })),
        },
      },
      include: { items: true },
    });

    const customerId = await getOrCreateStripeCustomer(
      session.user.email,
      session.user.name,
    );
    const baseUrl = getAppUrl();
    const checkoutSession = await createCheckoutSession({
      idempotencyKey: order.idempotencyKey,
      lineItems: order.items.map((item) => ({
        price_data: {
          currency: order.currency,
          product_data: { name: item.productName },
          unit_amount: item.unitAmountCents,
        },
        quantity: item.quantity,
      })),
      successUrl: `${baseUrl}/checkout/success?order_id=${
        encodeURIComponent(order.id)
      }&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout/cancel?order_id=${
        encodeURIComponent(order.id)
      }`,
      customerId,
      metadata: {
        kind: "order",
        orderId: order.id,
        userId: session.user.id,
      },
    });

    if (!checkoutSession.url) {
      throw new Error("STRIPE_CHECKOUT_URL_MISSING");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    });

    return createSuccessResponse({
      url: checkoutSession.url,
      orderId: order.id,
    });
  } catch (error) {
    logger.error(
      { err: error, action: "createOrderCheckout" },
      "Failed to create one-time order checkout",
    );
    return createErrorResponse(
      "Could not start checkout. Your account and selections are safe; please try again.",
      "CHECKOUT_FAILED",
    );
  }
}
