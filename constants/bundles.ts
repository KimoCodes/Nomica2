import { PRODUCTS, formatProductPrice } from "./products";

export type BundleTier = "BEGINNER" | "GLUTE" | "ULTIMATE";

export type Bundle = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  savings: number;
  savingsPercent: number;
  tier: BundleTier;
  badge: string;
  highlight: boolean;
  productIds: string[];
  features: string[];
};

function sumPrices(ids: string[]): number {
  return ids.reduce((sum, id) => {
    const product = PRODUCTS.find((p) => p.id === id);
    return sum + (product?.originalPrice ?? 0);
  }, 0);
}

const beginnerProductIds = ["beginner-gym-guide", "14-day-booty-challenge", "workout-tracker"];
const gluteProductIds = ["glute-sculpt-12wk", "stairmaster-program", "workout-tracker"];
const ultimateProductIds = [
  "glute-sculpt-12wk",
  "beginner-gym-guide",
  "stairmaster-program",
  "14-day-booty-challenge",
  "workout-tracker",
];

export const BUNDLES: Bundle[] = [
  {
    id: "beginner-bundle",
    slug: "beginner-bundle",
    name: "Beginner Bundle",
    tagline: "Everything you need to start strong",
    description:
      "New to fitness? This bundle gives you the perfect foundation. Learn the gym, activate your glutes, and track your progress from day one.",
    price: 57,
    originalPrice: sumPrices(beginnerProductIds),
    savings: sumPrices(beginnerProductIds) - 57,
    savingsPercent: Math.round(
      ((sumPrices(beginnerProductIds) - 57) / sumPrices(beginnerProductIds)) * 100,
    ),
    tier: "BEGINNER",
    badge: "BEST FOR BEGINNERS",
    highlight: true,
    productIds: beginnerProductIds,
    features: [
      "Complete beginner gym walkthrough",
      "14-day glute activation challenge",
      "Digital workout tracker",
      "24 + 14 = 38 workout videos",
      "Form basics for every lift",
      "Progress tracking dashboard",
    ],
  },
  {
    id: "glute-bundle",
    slug: "glute-bundle",
    name: "Glute Bundle",
    tagline: "The ultimate glute building collection",
    description:
      "Serious about building your glutes? This bundle combines our most popular programs for maximum lower body transformation.",
    price: 77,
    originalPrice: sumPrices(gluteProductIds),
    savings: sumPrices(gluteProductIds) - 77,
    savingsPercent: Math.round(
      ((sumPrices(gluteProductIds) - 77) / sumPrices(gluteProductIds)) * 100,
    ),
    tier: "GLUTE",
    badge: "MOST POPULAR",
    highlight: false,
    productIds: gluteProductIds,
    features: [
      "12-week progressive glute program",
      "4-week stairmaster sculptor",
      "Digital workout tracker",
      "48 + 16 = 64 workout videos",
      "Progressive overload system",
      "Heart rate zone training",
    ],
  },
  {
    id: "ultimate-bundle",
    slug: "ultimate-transformation-bundle",
    name: "Ultimate Transformation Bundle",
    tagline: "Everything NOMICA. One price.",
    description:
      "The complete NOMICA experience. Every program, every workout, every tool. The only fitness bundle you'll ever need.",
    price: 117,
    originalPrice: sumPrices(ultimateProductIds),
    savings: sumPrices(ultimateProductIds) - 117,
    savingsPercent: Math.round(
      ((sumPrices(ultimateProductIds) - 117) / sumPrices(ultimateProductIds)) * 100,
    ),
    tier: "ULTIMATE",
    badge: "BEST VALUE",
    highlight: false,
    productIds: ultimateProductIds,
    features: [
      "Everything in Beginner Bundle",
      "Everything in Glute Bundle",
      "12-week glute sculpt program",
      "Beginner gym guide",
      "Stairmaster program",
      "14-day booty challenge",
      "Workout tracker",
      "120+ total workouts",
    ],
  },
];

export function getBundleBySlug(slug: string): Bundle | undefined {
  return BUNDLES.find((b) => b.slug === slug);
}

export function getBundleProducts(bundle: Bundle) {
  return bundle.productIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);
}

export function formatBundlePrice(price: number): string {
  return formatProductPrice(price);
}
