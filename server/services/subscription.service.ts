import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPlanIndex } from "@/constants/subscriptions";

function generateMockStripeId(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = prefix + "_";
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function createSubscription(
  userId: string,
  plan: SubscriptionPlan,
) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return prisma.subscription.create({
    data: {
      userId,
      plan,
      status: "trialing",
      stripeCustomerId: generateMockStripeId("cus"),
      stripeSubscriptionId: generateMockStripeId("sub"),
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });
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

  const currentIdx = getPlanIndex(subscription.plan);
  const newIdx = getPlanIndex(newPlan);

  const newStatus: SubscriptionStatus =
    newIdx > currentIdx ? "active" : subscription.status;

  return prisma.subscription.update({
    where: { userId },
    data: {
      plan: newPlan,
      status: newStatus,
      stripePriceId: `price_mock_${newPlan.toLowerCase()}`,
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

  return prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: false,
    },
  });
}

export async function simulatePayment(subscriptionId: string, amount: number) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const payment = await prisma.payment.create({
    data: {
      subscriptionId,
      stripePaymentId: generateMockStripeId("pi"),
      amount,
      currency: "usd",
      status: "succeeded",
    },
  });

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  return payment;
}

export async function expireTrial(subscriptionId: string) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "past_due" },
  });
}
