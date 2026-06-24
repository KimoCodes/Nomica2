export type ClubTier = "SCULPT" | "SCULPT_PRO";

export type ClubTierData = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyMonthly: number;
  yearlySavings: number;
  tier: ClubTier;
  badge: string;
  highlight: boolean;
  features: ClubFeature[];
};

export type ClubFeature = {
  name: string;
  description: string;
  included: boolean;
  tier: "SCULPT" | "SCULPT_PRO" | "BOTH";
};

export const CLUB_TIERS: ClubTierData[] = [
  {
    id: "sculpt",
    name: "Sculpt",
    tagline: "Community + accountability",
    description:
      "Get access to our private community, weekly live sessions, and monthly new workouts. Perfect for staying motivated with a supportive group.",
    monthlyPrice: 39,
    yearlyPrice: 390,
    yearlyMonthly: 32.5,
    yearlySavings: 78,
    tier: "SCULPT",
    badge: "STARTER",
    highlight: false,
    features: [
      {
        name: "Private community access",
        description: "Join our members-only forum and group chats",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Weekly live Q&A sessions",
        description: "Join live coaching calls every Tuesday at 7PM EST",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Monthly new workout drops",
        description: "Fresh programming delivered each month",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Form check library",
        description: "Video tutorials for proper exercise form",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Community challenges",
        description: "Monthly group challenges with prizes",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Coach feedback on check-ins",
        description: "Personalized feedback on your progress photos",
        included: false,
        tier: "SCULPT",
      },
      {
        name: "1-on-1 video calls",
        description: "Monthly 30-minute coaching calls",
        included: false,
        tier: "SCULPT",
      },
      {
        name: "Custom programming",
        description: "Tailored workout plans for your specific goals",
        included: false,
        tier: "SCULPT",
      },
      {
        name: "Nutrition guidance",
        description: "Personalized meal planning and macro tracking",
        included: false,
        tier: "SCULPT",
      },
    ],
  },
  {
    id: "sculpt-pro",
    name: "Sculpt Pro",
    tagline: "Full coaching experience",
    description:
      "Everything in Sculpt plus 1-on-1 coaching, custom programming, and nutrition guidance. The closest thing to having a personal trainer.",
    monthlyPrice: 79,
    yearlyPrice: 790,
    yearlyMonthly: 65.83,
    yearlySavings: 158,
    tier: "SCULPT_PRO",
    badge: "MOST POPULAR",
    highlight: true,
    features: [
      {
        name: "Private community access",
        description: "Join our members-only forum and group chats",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Weekly live Q&A sessions",
        description: "Join live coaching calls every Tuesday at 7PM EST",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Monthly new workout drops",
        description: "Fresh programming delivered each month",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Form check library",
        description: "Video tutorials for proper exercise form",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Community challenges",
        description: "Monthly group challenges with prizes",
        included: true,
        tier: "BOTH",
      },
      {
        name: "Coach feedback on check-ins",
        description: "Personalized feedback on your progress photos",
        included: true,
        tier: "SCULPT_PRO",
      },
      {
        name: "1-on-1 video calls",
        description: "Monthly 30-minute coaching calls",
        included: true,
        tier: "SCULPT_PRO",
      },
      {
        name: "Custom programming",
        description: "Tailored workout plans for your specific goals",
        included: true,
        tier: "SCULPT_PRO",
      },
      {
        name: "Nutrition guidance",
        description: "Personalized meal planning and macro tracking",
        included: true,
        tier: "SCULPT_PRO",
      },
    ],
  },
];

export const CLUB_FEATURES_HIGHLIGHT = [
  {
    title: "Private Community",
    description:
      "Connect with like-minded women in our members-only community. Share wins, ask questions, and stay accountable.",
    icon: "Users",
  },
  {
    title: "Weekly Live Sessions",
    description:
      "Join live Q&A calls every Tuesday at 7PM EST. Get your questions answered by real coaches.",
    icon: "Video",
  },
  {
    title: "Monthly Workouts",
    description:
      "Fresh programming delivered monthly. Never get bored with the same routine.",
    icon: "Dumbbell",
  },
  {
    title: "Expert Coaching",
    description:
      "Personalized feedback on your form, nutrition, and progress from certified coaches.",
    icon: "Heart",
  },
];

export function getClubTierById(id: string): ClubTierData | undefined {
  return CLUB_TIERS.find((t) => t.id === id);
}

export function formatClubPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}
