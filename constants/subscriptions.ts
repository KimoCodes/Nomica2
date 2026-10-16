import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

/**
 * Subscription statuses that grant access to premium features.
 * Includes `past_due` because Stripe provides a grace period (7-14 days)
 * during payment retry — users should retain access during this window.
 */
export const ACTIVE_STATUSES: SubscriptionStatus[] = [
  "active",
  "trialing",
  "past_due",
];

export type PlanDefinition = {
  id: SubscriptionPlan;
  name: string;
  description: string;
  /** Price in cents for one billing period */
  priceCents: number;
  interval: "month" | "year";
  badge?: string;
  highlighted?: boolean;
  features: string[];
};

/**
 * Legacy All-Access plan definitions ($14.99/month, $149.99/year).
 * Kept only to display historical subscription records in account/admin views.
 * New plans cannot be purchased; catalog access is granted per product through
 * entitlements from one-time orders.
 */
export const PLANS: PlanDefinition[] = [
  {
    id: "ALL_ACCESS_MONTHLY",
    name: "NomiTips All Access",
    description: "Complete catalog, new monthly workouts, calendars, and progress trackers.",
    priceCents: 1499,
    interval: "month",
    features: [
      "Every signature program & challenge",
      "New monthly workouts",
      "Workout calendars",
      "Progress trackers",
      "Cancel anytime",
    ],
  },
  {
    id: "ALL_ACCESS_ANNUAL",
    name: "All Access — Annual",
    description: "Same access with two months free.",
    priceCents: 14999,
    interval: "year",
    badge: "Two months free",
    highlighted: true,
    features: [
      "Everything in All Access",
      "Two months free vs monthly",
      "Locked-in annual rate",
    ],
  },
];

export const PLAN_BY_ID = Object.fromEntries(
  PLANS.map((p) => [p.id, p]),
) as Record<SubscriptionPlan, PlanDefinition>;

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Human label like "$14.99 / month" */
export function formatPlanPrice(plan: PlanDefinition): string {
  return `${formatPrice(plan.priceCents)} / ${plan.interval}`;
}

