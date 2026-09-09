"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  createCheckoutSession,
  getOrCreateStripeCustomer,
  getStripePriceIds,
} from "@/lib/stripe";
import { getAppUrl } from "@/lib/resend";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

export async function createProductCheckout(
  productId: string,
): Promise<ApiResponse<{ url: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return createErrorResponse("Product not found", "NOT_FOUND");
    }

    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        productId,
        status: "COMPLETED",
      },
    });

    if (existingPurchase) {
      return createErrorResponse("You already own this product", "ALREADY_PURCHASED");
    }

    const customerId = await getOrCreateStripeCustomer(
      session.user.email,
      session.user.name,
    );

    const headerList = await headers();
    const origin = headerList.get("origin") ?? getAppUrl();

    const checkoutSession = await createCheckoutSession({
      mode: "payment",
      lineItems: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.tagline ?? undefined,
            },
            unit_amount: product.priceCents,
          },
          quantity: 1,
        },
      ],
      successUrl: `${origin}/checkout/success?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/checkout/cancel`,
      customerId,
      metadata: {
        userId: session.user.id,
        productId: product.id,
        kind: "one_time",
      },
    });

    return createSuccessResponse({ url: checkoutSession.url! });
  } catch (error) {
    logger.error({ err: error, action: "createProductCheckout" }, "Failed to create checkout");
    return createErrorResponse("Failed to create checkout", "INTERNAL_ERROR");
  }
}

export async function createSubscriptionCheckout(
  plan: "monthly" | "annual",
): Promise<ApiResponse<{ url: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const priceIds = getStripePriceIds();
    const priceId = plan === "monthly" ? priceIds.monthly : priceIds.annual;

    if (!priceId || !priceId.startsWith("price_")) {
      return createErrorResponse(
        "Stripe Price IDs are not configured. Please set STRIPE_PRICE_MONTHLY and STRIPE_PRICE_ANNUAL to actual Stripe Price IDs (e.g. price_1ABC...).",
        "STRIPE_NOT_CONFIGURED",
      );
    }

    const customerId = await getOrCreateStripeCustomer(
      session.user.email,
      session.user.name,
    );

    const headerList = await headers();
    const origin = headerList.get("origin") ?? getAppUrl();

    const checkoutSession = await createCheckoutSession({
      mode: "subscription",
      lineItems: [{ price: priceId, quantity: 1 }],
      successUrl: `${origin}/checkout/success?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/checkout/cancel`,
      customerId,
      metadata: {
        userId: session.user.id,
        plan,
        kind: "subscription",
      },
    });

    return createSuccessResponse({ url: checkoutSession.url! });
  } catch (error) {
    logger.error({ err: error, action: "createSubscriptionCheckout" }, "Failed to create checkout");
    return createErrorResponse("Failed to create checkout", "INTERNAL_ERROR");
  }
}
