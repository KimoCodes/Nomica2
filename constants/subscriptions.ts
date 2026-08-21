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
 * All-Access membership per NOMICA_Fitness_Catalog.pdf:
 * $14.99/month or $149.99/year (two months free).
 * Membership unlocks the complete catalog; one-off program/bundle purchases
 * are handled separately as Products (see constants/… replaced by DB catalog).
 */
export const PLANS: PlanDefinition[] = [
  {
    id: "ALL_ACCESS_MONTHLY",
    name: "NOMICA All Access",
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

/**
 * Feature gating map — which features require which plans.
 * With All-Access membership, all features are unlocked.
 * One-time purchasers get access to features related to their purchased product.
 */
export const FEATURE_GATING = {
  workouts: ["ALL_ACCESS_MONTHLY", "ALL_ACCESS_ANNUAL"] as const,
  progress: ["ALL_ACCESS_MONTHLY", "ALL_ACCESS_ANNUAL"] as const,
  nutrition: ["ALL_ACCESS_MONTHLY", "ALL_ACCESS_ANNUAL"] as const,
  messaging: ["ALL_ACCESS_MONTHLY", "ALL_ACCESS_ANNUAL"] as const,
  exerciseLibrary: ["ALL_ACCESS_MONTHLY", "ALL_ACCESS_ANNUAL"] as const,
} as const;

export type FeatureKey = keyof typeof FEATURE_GATING;

export function hasFeatureAccess(
  plan: SubscriptionPlan | null,
  feature: FeatureKey,
): boolean {
  if (!plan) return false;
  return (FEATURE_GATING[feature] as readonly SubscriptionPlan[]).includes(plan);
}

export function canUpgrade(
  currentPlan: SubscriptionPlan,
): SubscriptionPlan | null {
  if (currentPlan === "ALL_ACCESS_MONTHLY") return "ALL_ACCESS_ANNUAL";
  return null;
}

export function canDowngrade(
  currentPlan: SubscriptionPlan,
): SubscriptionPlan | null {
  if (currentPlan === "ALL_ACCESS_ANNUAL") return "ALL_ACCESS_MONTHLY";
  return null;
}
