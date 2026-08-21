import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

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
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

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

      case "invoice.payment_succeeded":
        await handleInvoicePayment(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
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
      where: {
        providerSessionId: session.id,
      },
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

    console.log(`[webhook] Purchase completed: ${metadata.productId} for user ${metadata.userId}`);
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

  await prisma.subscription.upsert({
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
  });

  console.log(`[webhook] Subscription created: ${metadata.plan} for user ${metadata.userId}`);
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

  await prisma.subscription.updateMany({
    where: { stripeCustomerId },
    data: {
      status: statusMap[subscription.status] ?? "active",
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
    },
  });

  console.log(`[webhook] Subscription updated: ${stripeCustomerId} -> ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId },
    data: {
      status: "canceled",
    },
  });

  console.log(`[webhook] Subscription canceled: ${stripeCustomerId}`);
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

  console.log(`[webhook] Payment recorded: ${invoice.amount_paid} for subscription ${subscription.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId },
    data: {
      status: "past_due",
    },
  });

  console.log(`[webhook] Payment failed for customer: ${stripeCustomerId}`);
}
