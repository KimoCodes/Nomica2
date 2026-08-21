"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/shared/public-layout";
import {
  QUIZ_STEPS,
  getQuizRecommendation,
  type QuizAnswer,
} from "@/constants/quiz";
import {
  ArrowRight,
  ArrowLeft,
  Target,
  Flame,
  Dumbbell,
  Heart,
  Sprout,
  TrendingUp,
  Zap,
  Calendar,
  CalendarDays,
  CircleDot,
  Home,
  CreditCard,
  RefreshCw,
  Shuffle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Flame,
  Dumbbell,
  Heart,
  Sprout,
  TrendingUp,
  Zap,
  Calendar,
  CalendarDays,
  CircleDot,
  Home,
  CreditCard,
  RefreshCw,
  Shuffle,
};

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);

  const step = QUIZ_STEPS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_STEPS.length) * 100;

  function handleSelect(value: string) {
    const newAnswers = answers.filter((a) => a.stepId !== step.id);
    newAnswers.push({ stepId: step.id, value });
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  const currentAnswer = answers.find((a) => a.stepId === step?.id)?.value;
  const recommendation = showResult ? getQuizRecommendation(answers) : null;

  if (showResult && recommendation) {
    return (
      <PublicLayout>
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-8 text-primary" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Your Perfect Match
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              Based on your answers, we recommend:
            </p>

            <div className="mt-8 rounded-2xl border border-primary/20 bg-card p-8 shadow-premium">
              <h2 className="text-2xl font-bold">{recommendation.name}</h2>
              <p className="mt-4 text-muted-foreground">
                {recommendation.reason}
              </p>

              <div className="mt-6">
                <span className="text-4xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  }).format(recommendation.price)}
                </span>
                {recommendation.type === "club" && (
                  <span className="text-muted-foreground">/mo</span>
                )}
              </div>

              <Link
                href={recommendation.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-6 w-full group shadow-premium",
                )}
              >
                {recommendation.cta}
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                Not quite right? Try the quiz again or explore all options.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowResult(false);
                    setCurrentStep(0);
                    setAnswers([]);
                  }}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                  )}
                >
                  Retake Quiz
                </button>
                <Link
                  href="/programs"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                  )}
                >
                  View All Programs
                </Link>
              </div>
            </div>
          </div>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="flex flex-1 flex-col px-4 py-16">
        <div className="mx-auto w-full max-w-lg">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentStep + 1} of {QUIZ_STEPS.length}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {step.question}
            </h1>
            <p className="mt-2 text-muted-foreground">{step.subtitle}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {step.options.map((option) => {
              const Icon = iconMap[option.icon] || Dumbbell;
              const isSelected = currentAnswer === option.value;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-premium"
                      : "border-border/50 bg-card hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{option.label}</p>
                    {option.description && (
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
              >
                <ArrowLeft className="mr-2 size-4" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentAnswer}
              className={cn(
                buttonVariants({ size: "lg" }),
                "flex-1 group",
              )}
            >
              {currentStep === QUIZ_STEPS.length - 1
                ? "See My Recommendation"
                : "Continue"}
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
