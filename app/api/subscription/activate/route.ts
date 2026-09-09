import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { invalidateRequestCache } from "@/lib/request-cache";
import logger from "@/lib/logger";

export const runtime = "nodejs";

/**
 * Fallback endpoint: if the webhook hasn't processed the subscription yet,
 * the success page calls this to activate the subscription directly from
 * the Stripe Checkout Session data.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    // Check if subscription already exists and is active
    const existing = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, stripeCustomerId: true },
    });

    if (existing?.status === "active" && existing.stripeCustomerId && !existing.stripeCustomerId.startsWith("manual_")) {
      return NextResponse.json({ activated: true, source: "existing" });
    }

    // Retrieve the checkout session from Stripe
    const stripe = getStripe();
    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      logger.error({ err, sessionId }, "Failed to retrieve checkout session");
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    // Verify this session belongs to this user
    const metadata = checkoutSession.metadata;
    if (metadata?.userId !== session.user.id) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
    }

    // Only handle subscription checkouts
    if (metadata?.kind !== "subscription" || !metadata?.plan) {
      return NextResponse.json({ error: "Not a subscription session" }, { status: 400 });
    }

    // Check if subscription was already activated by webhook
    const alreadyActive = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });

    if (alreadyActive?.status === "active") {
      return NextResponse.json({ activated: true, source: "webhook" });
    }

    // Activate subscription from checkout session data
    const stripeCustomerId = checkoutSession.customer as string;
    const stripeSubscriptionId = checkoutSession.subscription as string;

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: "No subscription in checkout session" }, { status: 400 });
    }

    // Get subscription details from Stripe
    let subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (err) {
      logger.error({ err, stripeSubscriptionId }, "Failed to retrieve subscription from Stripe");
      return NextResponse.json({ error: "Failed to retrieve subscription" }, { status: 500 });
    }

    const priceId = subscription.items.data[0]?.price.id;
    const periodEnd = subscription.items.data[0]?.current_period_end;

    const planMap: Record<string, "ALL_ACCESS_MONTHLY" | "ALL_ACCESS_ANNUAL"> = {
      monthly: "ALL_ACCESS_MONTHLY",
      annual: "ALL_ACCESS_ANNUAL",
    };

    const sub = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId: priceId ?? null,
        plan: planMap[metadata.plan],
        status: "active",
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date(),
      },
      create: {
        userId: session.user.id,
        stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId: priceId ?? null,
        plan: planMap[metadata.plan],
        status: "active",
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date(),
      },
    });

    invalidateRequestCache(`sub:${session.user.id}`);

    logger.info({ userId: session.user.id, plan: metadata.plan, source: "success_page_fallback" }, "Subscription activated via success page fallback");

    return NextResponse.json({ activated: true, source: "fallback" });
  } catch (error) {
    logger.error({ err: error, route: "api/subscription/activate" }, "Failed to activate subscription");
    return NextResponse.json({ error: "Activation failed" }, { status: 500 });
  }
}
