import { SubscriptionPlan } from "@prisma/client";

export type PlanFeature = {
  name: string;
  included: boolean;
  tooltip?: string;
};

export type PlanDefinition = {
  id: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
};

export const PLANS: PlanDefinition[] = [
  {
    id: "STARTER",
    name: "Starter",
    description: "Self-guided training with essential tools",
    monthlyPrice: 2900,
    yearlyPrice: 29000,
    features: [
      { name: "Exercise library access", included: true },
      { name: "Progress logging", included: true },
      { name: "Workout tracking", included: true },
      { name: "Dedicated coach", included: false },
      { name: "Direct messaging", included: false },
      { name: "Weekly check-ins", included: false },
      { name: "Custom programs", included: false },
      { name: "Video form review", included: false },
    ],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    description: "Personalized coaching with dedicated support",
    monthlyPrice: 14900,
    yearlyPrice: 149000,
    highlighted: true,
    badge: "Most Popular",
    features: [
      { name: "Exercise library access", included: true },
      { name: "Progress logging", included: true },
      { name: "Workout tracking", included: true },
      { name: "Dedicated coach", included: true },
      { name: "Direct messaging", included: true },
      { name: "Weekly check-ins", included: true },
      { name: "Custom programs", included: false },
      { name: "Video form review", included: false },
    ],
  },
  {
    id: "ELITE",
    name: "Elite",
    description: "Full-service coaching with premium features",
    monthlyPrice: 24900,
    yearlyPrice: 249000,
    features: [
      { name: "Exercise library access", included: true },
      { name: "Progress logging", included: true },
      { name: "Workout tracking", included: true },
      { name: "Dedicated coach", included: true },
      { name: "Direct messaging", included: true },
      { name: "Weekly check-ins", included: true },
      { name: "Custom programs", included: true },
      { name: "Video form review", included: true },
    ],
  },
];

export const PLAN_FEATURES_BY_ID = Object.fromEntries(
  PLANS.map((p) => [p.id, p.features]),
) as Record<SubscriptionPlan, PlanFeature[]>;

export const PLAN_BY_ID = Object.fromEntries(
  PLANS.map((p) => [p.id, p]),
) as Record<SubscriptionPlan, PlanDefinition>;

export const PLAN_HIERARCHY: SubscriptionPlan[] = ["STARTER", "PREMIUM", "ELITE"];

export function getPlanIndex(plan: SubscriptionPlan): number {
  return PLAN_HIERARCHY.indexOf(plan);
}

export function canUpgrade(current: SubscriptionPlan): SubscriptionPlan | null {
  const idx = getPlanIndex(current);
  return idx < PLAN_HIERARCHY.length - 1 ? PLAN_HIERARCHY[idx + 1] : null;
}

export function canDowngrade(current: SubscriptionPlan): SubscriptionPlan | null {
  const idx = getPlanIndex(current);
  return idx > 0 ? PLAN_HIERARCHY[idx - 1] : null;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export const FEATURE_GATING: Record<string, SubscriptionPlan[]> = {
  messaging: ["PREMIUM", "ELITE"],
  checkins: ["PREMIUM", "ELITE"],
  custom_programs: ["ELITE"],
  video_review: ["ELITE"],
} as const;

export function hasFeatureAccess(
  plan: SubscriptionPlan | null,
  feature: keyof typeof FEATURE_GATING,
): boolean {
  if (!plan) return false;
  const requiredPlans = FEATURE_GATING[feature];
  if (!requiredPlans) return true;
  return (requiredPlans as readonly SubscriptionPlan[]).includes(plan);
}
