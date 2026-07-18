"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COACH_SPECIALTY_OPTIONS } from "@/constants/onboarding";
import { submitCoachOnboarding } from "@/actions/onboarding.actions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";

export function CoachOnboardingForm() {
  const router = useRouter();
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties((current) =>
      current.includes(specialty)
        ? current.filter((item) => item !== specialty)
        : [...current, specialty],
    );
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    for (const specialty of selectedSpecialties) {
      formData.append("specialties", specialty);
    }

    const result = await trackLoading(() => submitCoachOnboarding(formData));

    if (!result.success) {
      setError(result.error?.message ?? "Something went wrong");
      setIsPending(false);
      return;
    }

    router.push(result.data?.redirectTo ?? "/coach");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-lg border-border/50 shadow-premium-lg">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold">
          Complete your coach profile
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tell clients about your experience and areas of expertise
        </p>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              name="bio"
              required
              rows={4}
              placeholder="Describe your coaching philosophy, background, and who you help..."
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Specialties</Label>
            <div className="flex flex-wrap gap-2">
              {COACH_SPECIALTY_OPTIONS.map((specialty) => {
                const isSelected = selectedSpecialties.includes(specialty);
                return (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => toggleSpecialty(specialty)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/50 hover:border-primary/50 hover:bg-primary/5",
                    )}
                  >
                    {isSelected && <CheckCircle2 className="size-3.5" />}
                    {specialty}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Select at least one specialty
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="yearsExperience" className="text-sm font-medium">
                Years of experience
              </Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min={0}
                max={50}
                required
                placeholder="5"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certification" className="text-sm font-medium">
                Certification
              </Label>
              <Input
                id="certification"
                name="certification"
                type="text"
                placeholder="NASM-CPT, ACE..."
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <LoadingButton type="submit" loading={isPending} loadingText="Saving profile..." className="w-full group">
            Complete setup
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </LoadingButton>
        </CardFooter>
      </form>
    </Card>
  );
}
