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
      successUrl: `${origin}/client/subscription?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/programs/${product.slug}`,
      customerId,
      metadata: {
        userId: session.user.id,
        productId: product.id,
        kind: "one_time",
      },
    });

    return createSuccessResponse({ url: checkoutSession.url! });
  } catch (error) {
    console.error("createProductCheckout error:", error);
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

    if (!priceId || priceId.startsWith("price_placeholder")) {
      return createErrorResponse(
        "Stripe is not configured yet. Please set up your Stripe Price IDs in .env.",
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
      successUrl: `${origin}/client/subscription?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing`,
      customerId,
      metadata: {
        userId: session.user.id,
        plan,
      },
    });

    return createSuccessResponse({ url: checkoutSession.url! });
  } catch (error) {
    console.error("createSubscriptionCheckout error:", error);
    return createErrorResponse("Failed to create checkout", "INTERNAL_ERROR");
  }
}
