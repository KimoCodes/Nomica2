"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  description: string;
  type: "info" | "question" | "selection" | "confirmation";
  options?: { value: string; label: string; description?: string }[];
};

type OnboardingWizardProps = {
  steps: Step[];
  onComplete: (data: Record<string, string>) => void;
};

export function OnboardingWizard({ steps, onComplete }: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIndex]!;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleSelect = (value: string) => {
    setData((prev) => ({ ...prev, [currentStep.id]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(data);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep.type === "info" && (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">Tap next to continue</p>
            </div>
          )}

          {currentStep.type === "selection" && currentStep.options && (
            <div className="space-y-2">
              {currentStep.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                    data[currentStep.id] === option.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  )}
                >
                  <div>
                    <p className="font-medium">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    )}
                  </div>
                  {data[currentStep.id] === option.value && (
                    <Badge className="bg-primary">
                      <Check className="h-3 w-3" />
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {currentStep.type === "confirmation" && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-muted-foreground">Your personalized plan is ready!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {!isFirstStep && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          className="flex-1"
          disabled={currentStep.type === "selection" && !data[currentStep.id]}
        >
          {isLastStep ? "Get Started" : "Next"}
          {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
