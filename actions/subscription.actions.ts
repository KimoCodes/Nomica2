"use server";

import { Role, SubscriptionPlan } from "@prisma/client";
import { requireAuth, requireRole } from "@/lib/auth";
import {
  cancelSubscription,
  revokeSubscription,
} from "@/server/services/subscription.service";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import logger from "@/lib/logger";

export async function changePlanAction(newPlan: SubscriptionPlan) {
  void newPlan;
  return {
    success: false,
    error: { message: "Recurring plan changes are no longer available." },
  };
}

export async function cancelSubscriptionAction() {
  try {
    const session = await requireAuth();
    await cancelSubscription(session.user.id);
    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, action: "cancelSubscriptionAction" },
      "Failed to cancel subscription",
    );
    return {
      success: false,
      error: {
        message: error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
      },
    };
  }
}

export async function reactivateSubscriptionAction() {
  await requireAuth();
  return {
    success: false,
    error: { message: "Subscription reactivation is no longer available." },
  };
}

export async function adminChangePlanAction(
  subscriptionId: string,
  newPlan: SubscriptionPlan,
) {
  void subscriptionId;
  void newPlan;
  await requireRole([Role.ADMIN]);
  return {
    success: false,
    error: { message: "Recurring plan changes are no longer available." },
  };
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
    logger.error(
      { err: error, action: "adminCancelSubscriptionAction" },
      "Failed to cancel subscription",
    );
    return {
      success: false,
      error: {
        message: error instanceof Error
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
  void targetUserId;
  void plan;
  await requireRole([Role.ADMIN]);
  return {
    success: false,
    error: {
      message:
        "New subscription approvals are disabled. Resolve existing requests through the legacy payment review workflow.",
    },
  };
}

export async function adminRevokeSubscriptionAction(targetUserId: string) {
  try {
    const session = await requireRole([Role.ADMIN]);
    await revokeSubscription(targetUserId, session.user.id);
    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, action: "adminRevokeSubscriptionAction" },
      "Failed to revoke subscription",
    );
    return {
      success: false,
      error: {
        message: error instanceof Error
          ? error.message
          : "Failed to revoke subscription",
      },
    };
  }
}

export async function coachApproveSubscriptionAction(
  targetUserId: string,
  plan: SubscriptionPlan,
) {
  void targetUserId;
  void plan;
  await requireRole([Role.COACH]);
  return {
    success: false,
    error: {
      message:
        "New subscription approvals are disabled. Resolve existing requests through the legacy payment review workflow.",
    },
  };
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
    logger.error(
      { err: error, action: "coachRevokeSubscriptionAction" },
      "Failed to revoke subscription",
    );
    return {
      success: false,
      error: {
        message: error instanceof Error
          ? error.message
          : "Failed to revoke subscription",
      },
    };
  }
}
