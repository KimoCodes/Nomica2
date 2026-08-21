"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { preCheckLogin } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const csrfRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError === "CredentialsSignin") {
      setError("Invalid email or password");
    }

    const registered = searchParams.get("registered");
    const plan = searchParams.get("plan");
    if (registered === "true") {
      setSuccess("Account created successfully! Sign in to continue.");
      if (plan) {
        sessionStorage.setItem("selectedPlan", plan);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => {
        if (csrfRef.current) csrfRef.current.value = data.csrfToken;
      });
  }, []);

  function validateField(name: string, value: string) {
    const errors: FieldErrors = { ...fieldErrors };
    if (name === "email") {
      if (!value) errors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        errors.email = "Please enter a valid email";
      else delete errors.email;
    }
    if (name === "password") {
      if (!value) errors.password = "Password is required";
      else if (value.length < 8) errors.password = "Password must be at least 8 characters";
      else delete errors.password;
    }
    setFieldErrors(errors);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const errors: FieldErrors = {};
    if (!email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Please enter a valid email";
    if (!password) errors.password = "Password is required";
    else if (password.length < 8)
      errors.password = "Password must be at least 8 characters";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsPending(false);
      return;
    }

    setFieldErrors({});

    const preCheck = await trackLoading(() => preCheckLogin(email));

    if (!preCheck.success) {
      setError(preCheck.error?.message ?? "Failed to sign in");
      setIsPending(false);
      return;
    }

    const redirectTo = preCheck.data?.redirectTo ?? "/client";

    const selectedPlan = sessionStorage.getItem("selectedPlan");
    const callbackUrl = selectedPlan
      ? `/client/subscription?plan=${selectedPlan}`
      : redirectTo;

    sessionStorage.removeItem("selectedPlan");

    const callbackInput = formRef.current?.elements.namedItem("callbackUrl") as HTMLInputElement;
    if (callbackInput) callbackInput.value = callbackUrl;

    formRef.current?.submit();
  }

  return (
    <div className="w-full max-w-sm">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </CardHeader>

      <form ref={formRef} action="/api/auth/callback/credentials" method="POST" onSubmit={handleSubmit}>
        <input type="hidden" name="csrfToken" ref={csrfRef} />
        <input type="hidden" name="callbackUrl" value="/client" />

        <CardContent className="space-y-4 px-0">
          {success && (
            <div aria-live="polite" className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="size-4 shrink-0" />
              {success}
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

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
                autoComplete="current-password"
                required
                placeholder="••••••••"
                onBlur={(e) => validateField("password", e.target.value)}
                className={`h-11 pl-10 ${fieldErrors.password ? "border-destructive" : ""}`}
              />
            </div>
            {fieldErrors.password && (
              <p role="alert" className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-0 pt-4">
          <LoadingButton
            type="submit"
            className="w-full group"
            loading={isPending}
            loadingText="Signing in..."
          >
            Sign in
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </LoadingButton>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </div>
  );
}
