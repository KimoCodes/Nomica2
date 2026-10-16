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

  // Best-value answer gets the largest bundle (54% off the full catalog).
  if (budgetAnswer === "best-value") {
    return {
      type: "bundle",
      id: "complete-nomitips-bundle",
      name: "Complete NomiTips Bundle",
      reason:
        "The best value in the catalog. This one-time bundle includes all 6 signature programs and all 5 focused challenges — everything we make — at 54% off, and you keep it forever.",
      price: 119.99,
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
          "Perfect for starting your glute journey. You'll build a solid foundation with Glute Builder, Toned Legs, and two focused challenges.",
        price: 54.99,
        cta: "Get the Bundle",
        href: "/bundles/lower-body-bundle",
      };
    }
    return {
      type: "product",
      id: "beginner-gym-confidence",
      name: "Beginner Gym Confidence",
      reason:
        "As a beginner, this program will teach you proper form, help you feel confident in the gym, and build a strong foundation with simple guided sessions.",
      price: 24.99,
      cta: "Get the Program",
      href: "/programs/beginner-gym-confidence",
    };
  }

  if (goalAnswer === "glutes") {
    if (scheduleAnswer === "2-3") {
      return {
        type: "product",
        id: "glute-builder",
        name: "Glute Builder",
        reason:
          "Designed for 3 days per week, this progressive program will grow your glutes with structured overload and proper programming.",
        price: 34.99,
        cta: "Start Building",
        href: "/programs/glute-builder",
      };
    }
    return {
      type: "bundle",
      id: "lower-body-bundle",
      name: "Lower-Body Bundle",
      reason:
        "The ultimate glute-building collection. Glute Builder, Toned Legs, and two focused challenges — progressive training to maximize your results.",
      price: 54.99,
      cta: "Get the Bundle",
      href: "/bundles/lower-body-bundle",
    };
  }

  if (goalAnswer === "strength") {
    return {
      type: "product",
      id: "strong-and-toned",
      name: "Strong & Toned",
      reason:
        "Our most complete strength program. Progressive full-body training combining strength, sculpting, and conditioning.",
      price: 39.99,
      cta: "Start Training",
      href: "/programs/strong-and-toned",
    };
  }

  if (goalAnswer === "tone") {
    return {
      type: "product",
      id: "hourglass-sculpt",
      name: "Hourglass Sculpt",
      reason:
        "A balanced plan emphasizing glutes, shoulders, back, and core strength — ideal for getting lean and defined.",
      price: 34.99,
      cta: "Start Sculpting",
      href: "/programs/hourglass-sculpt",
    };
  }

  return {
    type: "product",
    id: "glute-builder",
    name: "Glute Builder",
    reason:
      "Our most popular program. Progressive, structured training designed to sculpt your glutes and build confidence.",
    price: 34.99,
    cta: "Start Building",
    href: "/programs/glute-builder",
  };
}
