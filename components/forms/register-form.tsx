"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Role } from "@prisma/client";
import { registerUser } from "@/actions/auth.actions";
import { registerSchema } from "@/server/validators/auth.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";
import { PLANS, formatPlanPrice } from "@/constants/subscriptions";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPlan = searchParams.get("plan") || "ALL_ACCESS_MONTHLY";
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validateField(name: string, value: string) {
    const result = registerSchema.shape[name as keyof typeof registerSchema.shape].safeParse(value);
    if (!result.success) {
      const issues = result.error.issues;
      setFieldErrors((prev) => ({ ...prev, [name]: issues[0]?.message ?? "Invalid value" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
    };

    const validation = registerSchema.safeParse(data);
    if (!validation.success) {
      const errors: FieldErrors = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as keyof FieldErrors] = issue.message;
        }
      });
      setFieldErrors(errors);
      setIsPending(false);
      return;
    }

    setFieldErrors({});

    const result = await trackLoading(() => registerUser(formData));

    if (!result.success) {
      setError(result.error?.message ?? "Failed to create account");
      setIsPending(false);
      return;
    }

    const plan = formData.get("plan") as string;
    const redirectUrl = plan
      ? `/login?registered=true&plan=${plan}`
      : "/login?registered=true";
    router.push(redirectUrl);
  }

  return (
    <div className="w-full max-w-sm">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create your account and start training
        </p>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-4 px-0">
          {error && (
            <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Jane Doe"
                onBlur={(e) => validateField("name", e.target.value)}
                className={`h-11 pl-10 ${fieldErrors.name ? "border-destructive" : ""}`}
              />
            </div>
            {fieldErrors.name && (
              <p role="alert" className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                onBlur={(e) => validateField("email", e.target.value)}
                className={`h-11 pl-10 ${fieldErrors.email ? "border-destructive" : ""}`}
              />
            </div>
            {fieldErrors.email && (
              <p role="alert" className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                onBlur={(e) => validateField("password", e.target.value)}
                className={`h-11 pl-10 ${fieldErrors.password ? "border-destructive" : ""}`}
              />
            </div>
            {fieldErrors.password && (
              <p role="alert" className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Min 8 characters with uppercase, lowercase, and a number
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">I am a</Label>
            <input type="hidden" name="role" value={Role.CLIENT} />
            <Select
              defaultValue={Role.CLIENT}
              onValueChange={(value: string | null) => {
                const hiddenInput = document.querySelector('input[name="role"]') as HTMLInputElement;
                if (hiddenInput && value) hiddenInput.value = value;
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.CLIENT}>Client</SelectItem>
                <SelectItem value={Role.COACH}>Coach</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose your plan</Label>
            <input type="hidden" name="plan" value={defaultPlan} />
            <div className="grid gap-3">
              {PLANS.map((plan) => (
                <label
                  key={plan.id}
                  className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all hover:border-primary/50 [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    defaultChecked={plan.id === defaultPlan}
                    className="mt-0.5 accent-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.name}</span>
                      {plan.badge && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatPlanPrice(plan)} — {plan.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-0 pt-4">
          <LoadingButton
            type="submit"
            className="w-full group"
            loading={isPending}
            loadingText="Creating account..."
          >
            Create account
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </LoadingButton>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </div>
  );
}
