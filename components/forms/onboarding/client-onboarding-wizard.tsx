"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACTIVITY_LEVEL_OPTIONS,
  CLIENT_ONBOARDING_STEPS,
  EQUIPMENT_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  GENDER_OPTIONS,
  TOTAL_CLIENT_STEPS,
} from "@/constants/onboarding";
import { saveClientOnboardingStepAction } from "@/actions/onboarding.actions";
import { StepIndicator } from "@/components/shared/step-indicator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OnboardingStep } from "@/server/validators/onboarding.schema";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";

type ProfileData = {
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  fitnessGoal: string | null;
  activityLevel: string | null;
  equipment: string | null;
};

type ClientOnboardingWizardProps = {
  initialStep: OnboardingStep;
  profile: ProfileData | null;
};

export function ClientOnboardingWizard({
  initialStep,
  profile,
}: ClientOnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const progress = Math.round((step / TOTAL_CLIENT_STEPS) * 100);
  const currentStepMeta = CLIENT_ONBOARDING_STEPS[step - 1];

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const result = await trackLoading(() => saveClientOnboardingStepAction(step, formData));

    if (!result.success) {
      setError(result.error?.message ?? "Something went wrong");
      setIsPending(false);
      return;
    }

    if (result.data?.redirectTo) {
      router.push(result.data.redirectTo);
      router.refresh();
      return;
    }

    if (result.data?.nextStep) {
      setStep(result.data.nextStep);
    }

    setIsPending(false);
  }

  function handleBack() {
    if (step > 1) {
      setStep((step - 1) as OnboardingStep);
      setError(null);
    }
  }

  return (
    <Card className="border-border/50 shadow-premium-lg">
      <CardHeader className="space-y-6 pb-6">
        <div className="space-y-3">
          <Progress value={progress}>
            <div className="flex w-full items-center justify-between">
              <ProgressLabel>
                Step {step} of {TOTAL_CLIENT_STEPS}
              </ProgressLabel>
              <ProgressValue />
            </div>
          </Progress>
          <StepIndicator steps={CLIENT_ONBOARDING_STEPS} currentStep={step} />
        </div>
        <div>
          <CardTitle className="text-xl font-bold">
            {currentStepMeta.title}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentStepMeta.description}
          </p>
        </div>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-medium">
                    Age
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min={13}
                    max={120}
                    required
                    defaultValue={profile?.age ?? undefined}
                    placeholder="28"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <input type="hidden" name="gender" id="gender-hidden" defaultValue={profile?.gender ?? ""} />
                  <Select defaultValue={profile?.gender ?? ""} onValueChange={(value: string | null) => {
                    const hiddenInput = document.getElementById("gender-hidden") as HTMLInputElement;
                    if (hiddenInput && value) hiddenInput.value = value;
                  }}>
                    <SelectTrigger id="gender" className="h-11">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm font-medium">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    min={100}
                    max={250}
                    step="0.1"
                    required
                    defaultValue={profile?.height ?? undefined}
                    placeholder="175"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min={30}
                    max={300}
                    step="0.1"
                    required
                    defaultValue={profile?.weight ?? undefined}
                    placeholder="72"
                    className="h-11"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <fieldset className="space-y-3">
              <legend className="sr-only">Fitness goal</legend>
              {FITNESS_GOAL_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer gap-4 rounded-xl border p-4 transition-all duration-200 hover:bg-muted/50",
                    profile?.fitnessGoal === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50",
                  )}
                >
                  <input
                    type="radio"
                    name="fitnessGoal"
                    value={option.value}
                    required
                    defaultChecked={profile?.fitnessGoal === option.value}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="space-y-3">
              <legend className="sr-only">Experience level</legend>
              {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer gap-4 rounded-xl border p-4 transition-all duration-200 hover:bg-muted/50",
                    profile?.activityLevel === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50",
                  )}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={option.value}
                    required
                    defaultChecked={profile?.activityLevel === option.value}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="space-y-3">
              <legend className="sr-only">Equipment access</legend>
              {EQUIPMENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer gap-4 rounded-xl border p-4 transition-all duration-200 hover:bg-muted/50",
                    profile?.equipment === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50",
                  )}
                >
                  <input
                    type="radio"
                    name="equipment"
                    value={option.value}
                    required
                    defaultChecked={profile?.equipment === option.value}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isPending}
            className="group"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </Button>
          <LoadingButton type="submit" loading={isPending} loadingText="Saving..." className="group">
            {step === TOTAL_CLIENT_STEPS ? (
              <>
                Complete setup
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </LoadingButton>
        </CardFooter>
      </form>
    </Card>
  );
}
