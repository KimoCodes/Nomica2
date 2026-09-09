import { SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requestCache, invalidateRequestCache } from "@/lib/request-cache";
import { getStripe, getStripePriceIds } from "@/lib/stripe";
import {
  notifySubscriptionApproved,
  notifySubscriptionRevoked,
  notifySubscriptionExpiring,
  notifyPlanChanged,
  notifySubscriptionReactivated,
  notifyCancellationScheduled,
} from "@/server/services/notification.service";

export async function getSubscriptionForClient(userId: string) {
  return requestCache(`sub:${userId}`, () =>
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        status: true,
        plan: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: true,
      },
    }),
  );
}

export async function getUserSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function changePlan(userId: string, newPlan: SubscriptionPlan) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new Error("No active subscription found");
  }

  if (subscription.status === "canceled") {
    throw new Error("Cannot change plan on a canceled subscription");
  }

  if (subscription.plan === newPlan) {
    throw new Error("Already on this plan");
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error("No Stripe subscription found. Please subscribe again.");
  }

  const priceIds = getStripePriceIds();
  const newPriceId = newPlan === "ALL_ACCESS_MONTHLY" ? priceIds.monthly : priceIds.annual;

  if (!newPriceId || !newPriceId.startsWith("price_")) {
    throw new Error("Stripe Price IDs are not configured. Please set STRIPE_PRICE_MONTHLY and STRIPE_PRICE_ANNUAL to actual Stripe Price IDs (e.g. price_1ABC...).");
  }

  const stripe = getStripe();
  const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
  const existingItem = stripeSub.items.data[0];

  if (!existingItem) {
    throw new Error("No subscription item found");
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [{ id: existingItem.id, price: newPriceId }],
    proration_behavior: "create_prorations",
  });

  const result = await prisma.subscription.update({
    where: { userId },
    data: {
      plan: newPlan,
      stripePriceId: newPriceId,
    },
  });

  invalidateRequestCache(`sub:${userId}`);

  try {
    await notifyPlanChanged(userId, newPlan);
  } catch {}

  return result;
}

export async function cancelSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new Error("No active subscription found");
  }

  if (subscription.status === "canceled") {
    throw new Error("Subscription is already canceled");
  }

  if (subscription.stripeSubscriptionId) {
    const stripe = getStripe();
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  const result = await prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
    },
  });

  invalidateRequestCache(`sub:${userId}`);

  try {
    const endDate = subscription.currentPeriodEnd ?? new Date();
    await notifyCancellationScheduled(userId, endDate);
  } catch {}

  return result;
}

export async function reactivateSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new Error("No active subscription found");
  }

  if (subscription.stripeSubscriptionId) {
    const stripe = getStripe();
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
  }

  const result = await prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: false,
    },
  });

  invalidateRequestCache(`sub:${userId}`);

  try {
    await notifySubscriptionReactivated(userId);
  } catch {}

  return result;
}

export async function checkAndNotifyExpiringSubscriptions() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const expiringSubscriptions = await prisma.subscription.findMany({
    where: {
      status: "active",
      currentPeriodEnd: {
        lte: threeDaysFromNow,
        gte: new Date(),
      },
    },
    include: { user: { select: { id: true, name: true } } },
  });

  for (const sub of expiringSubscriptions) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: sub.user.id,
        type: "SUBSCRIPTION_EXPIRING",
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existingNotification) {
      const daysLeft = Math.ceil(
        (sub.currentPeriodEnd!.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      await notifySubscriptionExpiring(sub.user.id, daysLeft);
    }
  }

  return expiringSubscriptions.length;
}

export async function approveSubscription(
  targetUserId: string,
  plan: SubscriptionPlan,
  approvedById: string,
) {
  const existing = await prisma.subscription.findUnique({
    where: { userId: targetUserId },
  });

  if (existing && existing.status === "active") {
    throw new Error("User already has an active subscription");
  }

  const now = new Date();
  const periodEnd = new Date(now);
  if (plan === "ALL_ACCESS_MONTHLY") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  const subscription = await prisma.subscription.upsert({
    where: { userId: targetUserId },
    create: {
      userId: targetUserId,
      stripeCustomerId: `manual_${targetUserId}`,
      plan,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      approvedById,
      approvedAt: now,
    },
    update: {
      plan,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      approvedById,
      approvedAt: now,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // Notify the user
  try {
    await notifySubscriptionApproved(targetUserId, plan.replace(/_/g, " "));
  } catch {
    // Notification failure should not block approval
  }

  // Invalidate cache
  invalidateRequestCache(`sub:${targetUserId}`);

  return subscription;
}

export async function revokeSubscription(
  targetUserId: string,
  _revokedById: string,
) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId: targetUserId },
  });

  if (!subscription) {
    throw new Error("No subscription found for this user");
  }

  if (subscription.status === "canceled") {
    throw new Error("Subscription is already canceled");
  }

  const now = new Date();

  const updated = await prisma.subscription.update({
    where: { userId: targetUserId },
    data: {
      status: "canceled",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: now,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // Notify the user
  try {
    await notifySubscriptionRevoked(targetUserId);
  } catch {
    // Notification failure should not block revocation
  }

  // Invalidate cache
  invalidateRequestCache(`sub:${targetUserId}`);

  return updated;
}
