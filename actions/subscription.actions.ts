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
import { getStripe } from "@/lib/stripe";

export async function changePlanAction(newPlan: SubscriptionPlan) {
  try {
    const session = await requireAuth();
    await changePlan(session.user.id, newPlan);
    return { success: true };
  } catch (error) {
    console.error("Failed to change plan:", error);
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
    console.error("Failed to cancel subscription:", error);
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
    console.error("Failed to reactivate subscription:", error);
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

      if (priceId && stripeSub.items.data[0]) {
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
    console.error("adminChangePlanAction error:", error);
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
    console.error("adminCancelSubscriptionAction error:", error);
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
    console.error("adminApproveSubscriptionAction error:", error);
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
    console.error("adminRevokeSubscriptionAction error:", error);
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
    console.error("coachApproveSubscriptionAction error:", error);
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
    console.error("coachRevokeSubscriptionAction error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to revoke subscription",
      },
    };
  }
}
