import { SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requestCache, invalidateRequestCache } from "@/lib/request-cache";
import { getStripe, getStripePriceIds } from "@/lib/stripe";
import { createNotification } from "@/server/services/notification.service";

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

  if (!newPriceId || newPriceId.startsWith("price_placeholder")) {
    throw new Error("Stripe is not configured yet. Please set up Price IDs in .env.");
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

  return prisma.subscription.update({
    where: { userId },
    data: {
      plan: newPlan,
      stripePriceId: newPriceId,
    },
  });
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

  return prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
    },
  });
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

  return prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: false,
    },
  });
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

      await prisma.notification.create({
        data: {
          userId: sub.user.id,
          type: "SUBSCRIPTION_EXPIRING",
          title: "Subscription expiring soon",
          body: `Your ${sub.plan.toLowerCase()} subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Renew to keep access.`,
          link: "/client/subscription",
        },
      });
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
    await createNotification({
      userId: targetUserId,
      type: "SUBSCRIPTION_APPROVED",
      title: "Subscription approved",
      body: `Your ${plan.replace(/_/g, " ").toLowerCase()} subscription has been approved and is now active.`,
      link: "/client/subscription",
    });
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
    await createNotification({
      userId: targetUserId,
      type: "SUBSCRIPTION_REVOKED",
      title: "Subscription revoked",
      body: "Your subscription has been revoked by an administrator. Please contact support if you believe this is an error.",
      link: "/client/subscription",
    });
  } catch {
    // Notification failure should not block revocation
  }

  // Invalidate cache
  invalidateRequestCache(`sub:${targetUserId}`);

  return updated;
}
