export type QuizStep = {
  id: string;
  question: string;
  subtitle: string;
  options: QuizOption[];
};

export type QuizOption = {
  id: string;
  label: string;
  description?: string;
  icon: string;
  value: string;
};

export type QuizAnswer = {
  stepId: string;
  value: string;
};

export type QuizRecommendation = {
  type: "product" | "bundle" | "program";
  id: string;
  name: string;
  reason: string;
  price: number;
  cta: string;
  href: string;
};

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "goal",
    question: "What's your main fitness goal?",
    subtitle: "We'll recommend the best path for you",
    options: [
      {
        id: "glutes",
        label: "Build my glutes",
        description: "Sculpt and grow my booty",
        icon: "Target",
        value: "glutes",
      },
      {
        id: "tone",
        label: "Tone my body",
        description: "Get lean and defined",
        icon: "Flame",
        value: "tone",
      },
      {
        id: "strength",
        label: "Get stronger",
        description: "Build overall strength",
        icon: "Dumbbell",
        value: "strength",
      },
      {
        id: "confidence",
        label: "Feel confident",
        description: "Love what I see in the mirror",
        icon: "Heart",
        value: "confidence",
      },
    ],
  },
  {
    id: "experience",
    question: "What's your experience level?",
    subtitle: "Be honest — there's no wrong answer",
    options: [
      {
        id: "beginner",
        label: "Complete beginner",
        description: "Never been to a gym or just started",
        icon: "Sprout",
        value: "beginner",
      },
      {
        id: "intermediate",
        label: "Intermediate",
        description: "I know the basics, been training 6+ months",
        icon: "TrendingUp",
        value: "intermediate",
      },
      {
        id: "advanced",
        label: "Advanced",
        description: "I've been training for years",
        icon: "Zap",
        value: "advanced",
      },
    ],
  },
  {
    id: "schedule",
    question: "How many days can you train per week?",
    subtitle: "We'll match the right program intensity",
    options: [
      {
        id: "2-3",
        label: "2-3 days",
        description: "I'm busy but committed",
        icon: "Calendar",
        value: "2-3",
      },
      {
        id: "4-5",
        label: "4-5 days",
        description: "I can make time most days",
        icon: "CalendarDays",
        value: "4-5",
      },
      {
        id: "6+",
        label: "6+ days",
        description: "I'm all in, training is my priority",
        icon: "Flame",
        value: "6+",
      },
    ],
  },
  {
    id: "equipment",
    question: "What equipment do you have access to?",
    subtitle: "We'll tailor the exercises to your setup",
    options: [
      {
        id: "full-gym",
        label: "Full gym",
        description: "Barbells, cables, machines, everything",
        icon: "Dumbbell",
        value: "full-gym",
      },
      {
        id: "basic-gym",
        label: "Basic gym",
        description: "Dumbbells, some machines, maybe cables",
        icon: "CircleDot",
        value: "basic-gym",
      },
      {
        id: "home",
        label: "Home gym",
        description: "Bands, dumbbells, or bodyweight only",
        icon: "Home",
        value: "home",
      },
    ],
  },
  {
    id: "budget",
    question: "What's your budget preference?",
    subtitle: "We'll find the best value for you",
    options: [
      {
        id: "one-time",
        label: "One-time purchase",
        description: "I prefer to buy once and own it",
        icon: "CreditCard",
        value: "one-time",
      },
      {
        id: "best-value",
        label: "Biggest savings",
        description: "Show me the best bundle deal",
        icon: "RefreshCw",
        value: "best-value",
      },
      {
        id: "either",
        label: "Either is fine",
        description: "Show me the best option regardless",
        icon: "Shuffle",
        value: "either",
      },
    ],
  },
];

export function getQuizRecommendation(answers: QuizAnswer[]): QuizRecommendation {
  const goalAnswer = answers.find((a) => a.stepId === "goal")?.value;
  const experienceAnswer = answers.find((a) => a.stepId === "experience")?.value;
  const scheduleAnswer = answers.find((a) => a.stepId === "schedule")?.value;
  const budgetAnswer = answers.find((a) => a.stepId === "budget")?.value;

  // Best-value answer gets the complete catalog bundle (39% off).
  if (budgetAnswer === "best-value") {
    return {
      type: "bundle",
      id: "complete-nomitips-bundle",
      name: "Complete NomiTips Bundle",
      reason:
        "The best value in the catalog. This one-time bundle includes all 6 programs and all 4 challenges — everything we make — at 39% off, and you keep it forever.",
      price: 99.99,
      cta: "Get the Bundle",
      href: "/bundles/complete-nomitips-bundle",
    };
  }

  if (experienceAnswer === "beginner") {
    if (goalAnswer === "glutes") {
      return {
        type: "bundle",
        id: "lower-body-bundle",
        name: "Lower-Body Bundle",
        reason:
          "Perfect for starting your glute journey. You'll build a solid foundation with the 21-Day Booty Band Challenge, 6-Week Dumbbell Glute Growth, and the 6-Week Glutes & Quads Builder.",
        price: 34.99,
        cta: "Get the Bundle",
        href: "/bundles/lower-body-bundle",
      };
    }
    return {
      type: "product",
      id: "4-week-resistance-band-full-body-sculpt",
      name: "4-Week Resistance Band Full Body Sculpt",
      reason:
        "As a beginner, this program meets you where you are — minimal equipment, beginner-friendly modifications, and simple guided sessions that build full-body strength and confidence.",
      price: 14.99,
      cta: "Start Sculpting",
      href: "/programs/4-week-resistance-band-full-body-sculpt",
    };
  }

  if (goalAnswer === "glutes") {
    if (scheduleAnswer === "2-3") {
      return {
        type: "product",
        id: "6-week-dumbbell-glute-growth",
        name: "6-Week Dumbbell Glute Growth",
        reason:
          "A progressive dumbbell plan you can run at home or in the gym — structured overload week by week to grow your glutes without living at the gym.",
        price: 19.99,
        cta: "Start Building",
        href: "/programs/6-week-dumbbell-glute-growth",
      };
    }
    return {
      type: "bundle",
      id: "lower-body-bundle",
      name: "Lower-Body Bundle",
      reason:
        "The ultimate glute-building collection — band work, dumbbell growth, and glutes & quads — progressive training to maximize your results.",
      price: 34.99,
      cta: "Get the Bundle",
      href: "/bundles/lower-body-bundle",
    };
  }

  if (goalAnswer === "strength") {
    return {
      type: "product",
      id: "6-week-full-body-dumbbell-sculpt",
      name: "6-Week Full Body Dumbbell Sculpt",
      reason:
        "A full-body dumbbell program with progressive overload built into each week — the most complete strength option in the catalog.",
      price: 19.99,
      cta: "Start Training",
      href: "/programs/6-week-full-body-dumbbell-sculpt",
    };
  }

  if (goalAnswer === "tone") {
    return {
      type: "product",
      id: "4-week-resistance-band-full-body-sculpt",
      name: "4-Week Resistance Band Full Body Sculpt",
      reason:
        "A resistance-band program to tone your full body and build strength with minimal equipment — short sessions, real results.",
      price: 14.99,
      cta: "Start Sculpting",
      href: "/programs/4-week-resistance-band-full-body-sculpt",
    };
  }

  return {
    type: "product",
    id: "8-week-glute-growth-blueprint",
    name: "8-Week Glute Growth Blueprint",
    reason:
      "Our most popular program. A complete glute-building blueprint focused on shape, strength, and long-term results.",
    price: 29.99,
    cta: "Start Building",
    href: "/programs/8-week-glute-growth-blueprint",
  };
}
