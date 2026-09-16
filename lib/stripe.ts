import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Validate that Stripe keys are not test keys in production.
 * Test keys start with "sk_test_", "pk_test_", "whsec_test_".
 * Live keys start with "sk_live_", "pk_live_", "whsec_".
 */
function validateStripeKeysForProduction() {
  if (process.env.NODE_ENV !== "production") return;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const warnings: string[] = [];

  if (secretKey?.startsWith("sk_test_")) {
    warnings.push("STRIPE_SECRET_KEY is a test key (sk_test_...)");
  }
  if (publishableKey?.startsWith("pk_test_")) {
    warnings.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is a test key (pk_test_...)");
  }
  if (webhookSecret?.startsWith("whsec_test_")) {
    warnings.push("STRIPE_WEBHOOK_SECRET is a test webhook secret (whsec_test_...)");
  }

  if (warnings.length > 0) {
    console.error(
      "\n⚠️  STRIPE PRODUCTION WARNING:\n" +
      warnings.map((w) => `  • ${w}`).join("\n") +
      "\n\nThese appear to be test/development Stripe keys.\n" +
      "Production payments will NOT work with test keys.\n" +
      "Set live Stripe keys in your production environment.\n"
    );
  }
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Add it to .env to enable payments.",
    );
  }

  if (!stripeInstance) {
    validateStripeKeysForProduction();
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-07-29.dahlia",
    });
  }

  return stripeInstance;
}

export function getStripePriceIds() {
  return {
    monthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_ANNUAL ?? "",
  };
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export type CheckoutMode = "payment" | "subscription";

export async function createCheckoutSession({
  mode,
  lineItems,
  successUrl,
  cancelUrl,
  customerId,
  metadata,
}: {
  mode: CheckoutMode;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  const params: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  };

  if (customerId) {
    params.customer = customerId;
  }

  if (mode === "subscription") {
    params.subscription_data = {
      metadata,
    };
  }

  return stripe.checkout.sessions.create(params);
}

export async function getOrCreateStripeCustomer(
  email: string,
  name?: string,
): Promise<string> {
  const stripe = getStripe();

  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
  });

  return customer.id;
}

/**
 * Create a Stripe Customer Portal session for self-service billing management.
 * Allows customers to update payment methods, view invoices, and manage subscriptions.
 */
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
