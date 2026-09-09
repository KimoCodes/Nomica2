"use server";

import { SubscriptionPlan, Role } from "@prisma/client";
import { requireAuth, requireRole } from "@/lib/auth";
import {
  changePlan,
  cancelSubscription,
  reactivateSubscription,
  approveSubscription,
  revokeSubscription,
} from "@/server/services/subscription.service";
import { prisma } from "@/lib/prisma";
import { getStripe, createCustomerPortalSession } from "@/lib/stripe";
import { getAppUrl } from "@/lib/resend";
import { headers } from "next/headers";
import logger from "@/lib/logger";

export async function changePlanAction(newPlan: SubscriptionPlan) {
  try {
    const session = await requireAuth();
    await changePlan(session.user.id, newPlan);
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "changePlanAction" }, "Failed to change plan");
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to change plan",
      },
    };
  }
}

export async function cancelSubscriptionAction() {
  try {
    const session = await requireAuth();
    await cancelSubscription(session.user.id);
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "cancelSubscriptionAction" }, "Failed to cancel subscription");
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to cancel subscription",
      },
    };
  }
}

export async function reactivateSubscriptionAction() {
  try {
    const session = await requireAuth();
    await reactivateSubscription(session.user.id);
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "reactivateSubscriptionAction" }, "Failed to reactivate subscription");
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to reactivate subscription",
      },
    };
  }
}

export async function adminChangePlanAction(
  subscriptionId: string,
  newPlan: SubscriptionPlan,
) {
  try {
    await requireRole([Role.ADMIN]);

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return { success: false, error: { message: "Subscription not found" } };
    }

    const stripe = getStripe();

    if (subscription.stripeSubscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

    const priceId =
      newPlan === "ALL_ACCESS_MONTHLY"
        ? process.env.STRIPE_PRICE_MONTHLY
        : process.env.STRIPE_PRICE_ANNUAL;

      if (priceId && priceId.startsWith("price_") && stripeSub.items.data[0]) {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          items: [{ id: stripeSub.items.data[0].id, price: priceId }],
          proration_behavior: "create_prorations",
        });
      }
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { plan: newPlan },
    });

    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "adminChangePlanAction" }, "Failed to change plan");
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to change plan",
      },
    };
  }
}

export async function adminCancelSubscriptionAction(subscriptionId: string) {
  try {
    await requireRole([Role.ADMIN]);

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return { success: false, error: { message: "Subscription not found" } };
    }

    if (subscription.stripeSubscriptionId) {
      const stripe = getStripe();
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: true },
    });

    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "adminCancelSubscriptionAction" }, "Failed to cancel subscription");
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to cancel subscription",
      },
    };
  }
}

export async function adminApproveSubscriptionAction(
  targetUserId: string,
  plan: SubscriptionPlan,
) {
  try {
    const session = await requireRole([Role.ADMIN]);
    await approveSubscription(targetUserId, plan, session.user.id);
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "adminApproveSubscriptionAction" }, "Failed to approve subscription");
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to approve subscription",
      },
    };
  }
}

export async function adminRevokeSubscriptionAction(targetUserId: string) {
  try {
    const session = await requireRole([Role.ADMIN]);
    await revokeSubscription(targetUserId, session.user.id);
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "adminRevokeSubscriptionAction" }, "Failed to revoke subscription");
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to revoke subscription",
      },
    };
  }
}

export async function coachApproveSubscriptionAction(
  targetUserId: string,
  plan: SubscriptionPlan,
) {
  try {
    const session = await requireRole([Role.COACH]);

    const clientProfile = await prisma.clientProfile.findFirst({
      where: {
        userId: targetUserId,
        coachId: session.user.id,
      },
    });

    if (!clientProfile) {
      return {
        success: false,
        error: { message: "This user is not your client" },
      };
    }

    await approveSubscription(targetUserId, plan, session.user.id);
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "coachApproveSubscriptionAction" }, "Failed to approve subscription");
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to approve subscription",
      },
    };
  }
}

export async function coachRevokeSubscriptionAction(targetUserId: string) {
  try {
    const session = await requireRole([Role.COACH]);

    const clientProfile = await prisma.clientProfile.findFirst({
      where: {
        userId: targetUserId,
        coachId: session.user.id,
      },
    });

    if (!clientProfile) {
      return {
        success: false,
        error: { message: "This user is not your client" },
      };
    }

    await revokeSubscription(targetUserId, session.user.id);
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "coachRevokeSubscriptionAction" }, "Failed to revoke subscription");
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to revoke subscription",
      },
    };
  }
}

/**
 * Create a Stripe Customer Portal session for self-service billing management.
 * Allows customers to update payment methods, view invoices, and manage subscriptions.
 */
export async function createCustomerPortalAction(): Promise<{ success: boolean; url?: string; error?: { message: string } }> {
  try {
    const session = await requireAuth();

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!subscription?.stripeCustomerId || subscription.stripeCustomerId.startsWith("manual_")) {
      return {
        success: false,
        error: { message: "No Stripe subscription found. Please contact support to manage your billing." },
      };
    }

    const headerList = await headers();
    const origin = headerList.get("origin") ?? getAppUrl();

    const portalSession = await createCustomerPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${origin}/client/subscription`,
    });

    return { success: true, url: portalSession.url };
  } catch (error) {
    logger.error({ err: error, action: "createCustomerPortalAction" }, "Failed to create portal session");
    return {
      success: false,
      error: { message: "Failed to open billing portal. Please try again." },
    };
  }
}
