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
  type: "product" | "bundle" | "club" | "program";
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
        id: "monthly",
        label: "Monthly membership",
        description: "I like ongoing support and updates",
        icon: "RefreshCw",
        value: "monthly",
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

  if (budgetAnswer === "monthly" || (budgetAnswer === "either" && goalAnswer === "confidence")) {
    return {
      type: "club",
      id: "sculpt-pro",
      name: "Sculpt Pro Membership",
      reason:
        "Based on your goals and preference for ongoing support, the Sculpt Pro membership gives you 1-on-1 coaching, custom programming, and a supportive community.",
      price: 79,
      cta: "Join Sculpt Pro",
      href: "/register?club=sculpt-pro",
    };
  }

  if (experienceAnswer === "beginner") {
    if (goalAnswer === "glutes") {
      return {
        type: "bundle",
        id: "beginner-bundle",
        name: "Beginner Bundle",
        reason:
          "Perfect for starting your glute journey. You'll learn proper form, activate your glutes, and build a solid foundation with 38 guided workouts.",
        price: 57,
        cta: "Get the Bundle",
        href: "/bundles/beginner-bundle",
      };
    }
    return {
      type: "product",
      id: "beginner-gym-guide",
      name: "Beginner Gym Guide",
      reason:
        "As a beginner, this guide will teach you proper form for every exercise, help you feel confident in the gym, and build a strong foundation.",
      price: 37,
      cta: "Get the Guide",
      href: "/programs/beginner-gym-guide",
    };
  }

  if (goalAnswer === "glutes") {
    if (scheduleAnswer === "2-3") {
      return {
        type: "product",
        id: "glute-sculpt-12wk",
        name: "12-Week Glute Sculpt",
        reason:
          "Designed for 3 days per week, this progressive program will grow your glutes with science-backed programming and proper overload.",
        price: 47,
        cta: "Start Sculpting",
        href: "/programs/12-week-glute-sculpt",
      };
    }
    return {
      type: "bundle",
      id: "glute-bundle",
      name: "Glute Bundle",
      reason:
        "The ultimate glute-building collection. Two programs, 64 workouts, and progressive overload designed to maximize your results.",
      price: 77,
      cta: "Get the Bundle",
      href: "/bundles/glute-bundle",
    };
  }

  return {
    type: "product",
    id: "glute-sculpt-12wk",
    name: "12-Week Glute Sculpt",
    reason:
      "Our most popular program. 12 weeks of progressive, science-backed training designed to sculpt your glutes and transform your body.",
    price: 47,
    cta: "Start Sculpting",
    href: "/programs/12-week-glute-sculpt",
  };
}
