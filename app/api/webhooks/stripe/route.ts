import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent } from "@/lib/stripe";
import { invalidateRequestCache } from "@/lib/request-cache";
import {
  notifySubscriptionApproved,
  notifySubscriptionRevoked,
  notifyPaymentSucceeded,
  notifyPlanChanged,
  notifySubscriptionReactivated,
  notifyCancellationScheduled,
  notifyCoachClientSubscribed,
  notifyCoachClientPaymentFailed,
  notifyCoachClientCancelled,
  notifyCoachClientPlanChanged,
} from "@/server/services/notification.service";
import { sendEmail } from "@/server/services/email.service";
import {
  renderEmailTemplate,
  infoCard,
  textBlock,
} from "@/server/services/email-templates";
import type Stripe from "stripe";
import logger from "@/lib/logger";

export const runtime = "nodejs";

/** Invalidate all caches and paths related to a user's subscription */
function invalidateSubscriptionCaches(userId: string) {
  invalidateRequestCache(`sub:${userId}`);
  invalidateRequestCache(`entitlement:${userId}`);
  revalidatePath("/client/subscription");
  revalidatePath("/client/payments");
  revalidatePath("/client");
}

/** Invalidate coach dashboard and client pages */
function invalidateCoachCaches(coachUserId: string) {
  invalidateRequestCache(`coach-dashboard:${coachUserId}`);
  revalidatePath("/coach");
  revalidatePath("/coach/clients");
  revalidatePath("/coach/subscriptions");
}

/** Find the coach for a given user (via their client profile) */
async function findCoachForUser(userId: string) {
  const profile = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { coachId: true },
  });
  return profile?.coachId ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    logger.error({ err, route: "webhooks/stripe" }, "Webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: skip already-processed events
  const existingEvent = await prisma.billingEvent.findUnique({
    where: { stripeEventId: event.id },
  });

  if (existingEvent?.processedAt) {
    logger.info({ eventId: event.id, type: event.type, route: "webhooks/stripe" }, "Event already processed, skipping");
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Record event attempt
  await prisma.billingEvent.upsert({
    where: { stripeEventId: event.id },
    update: { type: event.type },
    create: {
      stripeEventId: event.id,
      type: event.type,
      payload: JSON.parse(JSON.stringify(event.data.object)) as any,
    },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
      case "invoice.payment_succeeded":
        await handleInvoicePayment(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "invoice.finalized":
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info({ event: event.type, route: "webhooks/stripe" }, "Unhandled event type");
    }

    // Mark event as processed
    await prisma.billingEvent.update({
      where: { stripeEventId: event.id },
      data: { processedAt: new Date() },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ err: error, event: event.type, route: "webhooks/stripe" }, "Webhook handler error");
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;

  if (metadata?.kind === "one_time" && metadata.productId && metadata.userId) {
    await prisma.purchase.upsert({
      where: { providerSessionId: session.id },
      update: {
        status: "COMPLETED",
        providerPaymentId: (session.payment_intent as string) ?? null,
        completedAt: new Date(),
      },
      create: {
        userId: metadata.userId,
        productId: metadata.productId,
        status: "COMPLETED",
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        provider: "stripe",
        providerSessionId: session.id,
        providerPaymentId: (session.payment_intent as string) ?? null,
        completedAt: new Date(),
      },
    });

    logger.info({ event: "purchase.completed", productId: metadata.productId, userId: metadata.userId, route: "webhooks/stripe" }, "Purchase completed");
  }

  if (metadata?.kind === "subscription") {
    await handleSubscriptionFromCheckout(session);
  }
}

async function handleSubscriptionFromCheckout(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.userId || !metadata?.plan) return;

  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!stripeSubscriptionId) return;

  const stripe = (await import("@/lib/stripe")).getStripe();
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const periodEnd = subscription.items.data[0]?.current_period_end;

  const planMap: Record<string, "ALL_ACCESS_MONTHLY" | "ALL_ACCESS_ANNUAL"> = {
    monthly: "ALL_ACCESS_MONTHLY",
    annual: "ALL_ACCESS_ANNUAL",
  };

  const sub = await prisma.subscription.upsert({
    where: { userId: metadata.userId },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId: priceId ?? null,
      plan: planMap[metadata.plan],
      status: "active",
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date(),
    },
    create: {
      userId: metadata.userId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId: priceId ?? null,
      plan: planMap[metadata.plan],
      status: "active",
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date(),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  invalidateSubscriptionCaches(metadata.userId);

  // Notify user
  try {
    await notifySubscriptionApproved(metadata.userId, planMap[metadata.plan].replace(/_/g, " "));
    const user = sub.user;
    if (user?.email) {
      const html = renderEmailTemplate({
        title: "Welcome to NomiTips All Access!",
        subtitle: `Your ${metadata.plan} subscription is now active.`,
        content: [
          textBlock(`Hi ${user.name ?? "there"},`),
          textBlock("Your subscription is now active. You have full access to all programs, workouts, nutrition plans, and coaching features."),
          infoCard("Subscription Details", [
            { label: "Plan", value: planMap[metadata.plan].replace(/_/g, " ") },
            { label: "Status", value: "Active" },
            { label: "Next billing", value: periodEnd ? new Date(periodEnd * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A" },
          ]),
        ].join(""),
        action: { label: "Go to Dashboard", url: "/client" },
      });
      await sendEmail(user.email, "Your NomiTips subscription is active", html);
    }
  } catch {}

  // Notify coach
  try {
    const coachId = await findCoachForUser(metadata.userId);
    if (coachId) {
      const userName = sub.user?.name ?? "A client";
      await notifyCoachClientSubscribed(coachId, userName, planMap[metadata.plan]);
      invalidateCoachCaches(coachId);
    }
  } catch {}

  logger.info({ event: "subscription.created", plan: metadata.plan, userId: metadata.userId, route: "webhooks/stripe" }, "Subscription created");
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;

  const statusMap: Record<string, "active" | "past_due" | "canceled" | "unpaid" | "trialing"> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    trialing: "trialing",
  };

  const periodEnd = subscription.items.data[0]?.current_period_end;
  const priceId = subscription.items.data[0]?.price.id;

  // Detect plan change from price ID
  const priceIdMap: Record<string, "ALL_ACCESS_MONTHLY" | "ALL_ACCESS_ANNUAL"> = {
    [process.env.STRIPE_PRICE_MONTHLY ?? ""]: "ALL_ACCESS_MONTHLY",
    [process.env.STRIPE_PRICE_ANNUAL ?? ""]: "ALL_ACCESS_ANNUAL",
  };

  const updateData: Record<string, unknown> = {
    status: statusMap[subscription.status] ?? "active",
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  if (priceId && priceIdMap[priceId]) {
    updateData.plan = priceIdMap[priceId];
    updateData.stripePriceId = priceId;
  }

  const existing = await prisma.subscription.findFirst({
    where: { stripeCustomerId },
    select: { userId: true, status: true, plan: true },
  });

  await prisma.subscription.updateMany({
    where: { stripeCustomerId },
    data: updateData,
  });

  if (existing) {
    invalidateSubscriptionCaches(existing.userId);

    const newStatus = statusMap[subscription.status] ?? "active";
    const newPlan = priceId && priceIdMap[priceId] ? priceIdMap[priceId] : null;

    // Notify on cancellation
    if (subscription.status === "canceled" && existing.status !== "canceled") {
      try {
        await notifySubscriptionRevoked(existing.userId);
        const user = await prisma.user.findUnique({ where: { id: existing.userId }, select: { email: true, name: true } });
        if (user?.email) {
          const html = renderEmailTemplate({
            title: "Subscription Cancelled",
            content: textBlock(`Hi ${user.name ?? "there"}, your NomiTips subscription has been cancelled. You'll retain access until the end of your current billing period.`),
            action: { label: "View Plans", url: "/pricing" },
          });
          await sendEmail(user.email, "Your NomiTips subscription has been cancelled", html);
        }
        // Notify coach
        const coachId = await findCoachForUser(existing.userId);
        if (coachId) {
          await notifyCoachClientCancelled(coachId, user?.name ?? "A client");
          invalidateCoachCaches(coachId);
        }
      } catch {}
    }

    // Notify on plan change
    if (newPlan && newPlan !== existing.plan && subscription.status !== "canceled") {
      try {
        await notifyPlanChanged(existing.userId, newPlan);
        const user = await prisma.user.findUnique({ where: { id: existing.userId }, select: { name: true } });
        const coachId = await findCoachForUser(existing.userId);
        if (coachId) {
          await notifyCoachClientPlanChanged(coachId, user?.name ?? "A client", newPlan);
          invalidateCoachCaches(coachId);
        }
      } catch {}
    }

    // Notify on reactivation from past_due
    if (newStatus === "active" && existing.status === "past_due") {
      try {
        await notifySubscriptionReactivated(existing.userId);
      } catch {}
    }

    // Notify on cancellation scheduled (cancel_at_period_end)
    if (subscription.cancel_at_period_end && !existing.status?.includes("cancel")) {
      try {
        const endDate = periodEnd ? new Date(periodEnd * 1000) : new Date();
        await notifyCancellationScheduled(existing.userId, endDate);
      } catch {}
    }
  }

  logger.info({ event: "subscription.updated", stripeCustomerId, status: subscription.status, route: "webhooks/stripe" }, "Subscription updated");
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;

  const existing = await prisma.subscription.findFirst({
    where: { stripeCustomerId },
    select: { userId: true },
  });

  await prisma.subscription.updateMany({
    where: { stripeCustomerId },
    data: { status: "canceled" },
  });

  if (existing) {
    invalidateSubscriptionCaches(existing.userId);
    try {
      await notifySubscriptionRevoked(existing.userId);
      const user = await prisma.user.findUnique({ where: { id: existing.userId }, select: { email: true, name: true } });
      if (user?.email) {
        const html = renderEmailTemplate({
          title: "Subscription Cancelled",
          content: textBlock(`Hi ${user.name ?? "there"}, your NomiTips subscription has been cancelled. You'll retain access until the end of your current billing period.`),
          action: { label: "View Plans", url: "/pricing" },
        });
        await sendEmail(user.email, "Your NomiTips subscription has been cancelled", html);
      }
      // Notify coach
      const coachId = await findCoachForUser(existing.userId);
      if (coachId) {
        await notifyCoachClientCancelled(coachId, user?.name ?? "A client");
        invalidateCoachCaches(coachId);
      }
    } catch {}
  }

  logger.info({ event: "subscription.canceled", stripeCustomerId, route: "webhooks/stripe" }, "Subscription canceled");
}

async function handleInvoicePayment(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string;

  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId },
  });

  if (!subscription) return;

  const stripePaymentId = invoice.id ? `inv_${invoice.id}` : null;
  if (!stripePaymentId) return;

  const existing = await prisma.payment.findUnique({
    where: { stripePaymentId },
  });

  if (existing) return;

  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      stripePaymentId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: "succeeded",
    },
  });

  const wasPastDue = subscription.status === "past_due";

  // If subscription was past_due and payment succeeded, reactivate
  if (wasPastDue) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "active" },
    });
    invalidateSubscriptionCaches(subscription.userId);

    // Notify user their access is restored
    try {
      await notifySubscriptionReactivated(subscription.userId);
    } catch {}
  }

  // Notify user of successful payment (for recurring renewals)
  if (!wasPastDue) {
    try {
      await notifyPaymentSucceeded(subscription.userId, invoice.amount_paid);
    } catch {}
  }

  // Notify coach of payment
  try {
    const coachId = await findCoachForUser(subscription.userId);
    if (coachId) {
      const user = await prisma.user.findUnique({ where: { id: subscription.userId }, select: { name: true } });
      await notifyCoachClientSubscribed(coachId, user?.name ?? "A client", subscription.plan);
      invalidateCoachCaches(coachId);
    }
  } catch {}

  invalidateSubscriptionCaches(subscription.userId);

  logger.info({ event: "payment.recorded", amountPaid: invoice.amount_paid, subscriptionId: subscription.id, route: "webhooks/stripe" }, "Payment recorded");
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string;

  const existing = await prisma.subscription.findFirst({
    where: { stripeCustomerId },
    select: { userId: true },
  });

  await prisma.subscription.updateMany({
    where: { stripeCustomerId },
    data: { status: "past_due" },
  });

  if (existing) {
    invalidateSubscriptionCaches(existing.userId);

    // Notify user of failed payment
    try {
      const user = await prisma.user.findUnique({ where: { id: existing.userId }, select: { email: true, name: true } });
      if (user?.email) {
        const html = renderEmailTemplate({
          title: "Payment Failed",
          subtitle: "Your latest payment could not be processed.",
          content: [
            textBlock(`Hi ${user.name ?? "there"},`),
            textBlock("Your most recent subscription payment failed. Please update your payment method in your billing settings to avoid losing access."),
            infoCard("What happens next", [
              { label: "Status", value: "Past Due" },
              { label: "Action required", value: "Update payment method" },
            ]),
          ].join(""),
          action: { label: "Update Payment Method", url: "/client/subscription" },
        });
        await sendEmail(user.email, "Payment failed - action required", html);
      }
    } catch {}

    // Send in-app notification
    try {
      const { createNotification } = await import("@/server/services/notification.service");
      await createNotification({
        userId: existing.userId,
        type: "SUBSCRIPTION_EXPIRING",
        title: "Payment Failed",
        body: "Your latest payment failed. Please update your payment method to avoid losing access.",
        link: "/client/subscription",
        sendEmail: false,
      });
    } catch {}

    // Notify coach
    try {
      const coachId = await findCoachForUser(existing.userId);
      if (coachId) {
        const user = await prisma.user.findUnique({ where: { id: existing.userId }, select: { name: true } });
        await notifyCoachClientPaymentFailed(coachId, user?.name ?? "A client");
        invalidateCoachCaches(coachId);
      }
    } catch {}
  }

  logger.info({ event: "payment.failed", stripeCustomerId, route: "webhooks/stripe" }, "Payment failed");
}

async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string;
  const stripePaymentId = invoice.id ? `inv_${invoice.id}` : null;
  if (!stripePaymentId) return;

  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId },
  });

  if (!subscription) return;

  const existing = await prisma.payment.findUnique({
    where: { stripePaymentId },
  });

  if (existing) return;

  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      stripePaymentId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status === "paid" ? "succeeded" : "pending",
    },
  });

  logger.info({ event: "invoice.finalized", invoiceId: invoice.id, route: "webhooks/stripe" }, "Invoice finalized");
}
