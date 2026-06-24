"use server";

import { SubscriptionPlan } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import {
  createSubscription,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
  simulatePayment,
} from "@/server/services/subscription.service";
import { getUserSubscription } from "@/server/services/subscription.service";

export async function createSubscriptionAction(plan: SubscriptionPlan) {
  try {
    const session = await requireAuth();
    const existing = await getUserSubscription(session.user.id);
    if (existing) {
      return { success: false, error: { message: "You already have a subscription" } };
    }
    await createSubscription(session.user.id, plan);
    return { success: true };
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return {
      success: false,
      error: { message: "Failed to create subscription" },
    };
  }
}

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

export async function simulatePaymentAction(subscriptionId: string) {
  try {
    const session = await requireAuth();
    const subscription = await getUserSubscription(session.user.id);
    if (!subscription || subscription.id !== subscriptionId) {
      return { success: false, error: { message: "Subscription not found" } };
    }

    const { PLANS } = await import("@/constants/subscriptions");
    const planDef = PLANS.find((p) => p.id === subscription.plan);
    if (!planDef) {
      return { success: false, error: { message: "Invalid plan" } };
    }

    await simulatePayment(subscriptionId, planDef.monthlyPrice);
    return { success: true };
  } catch (error) {
    console.error("Failed to simulate payment:", error);
    return {
      success: false,
      error: { message: "Failed to simulate payment" },
    };
  }
}
