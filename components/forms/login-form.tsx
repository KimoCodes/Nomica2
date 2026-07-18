"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Client-side validation
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

    const result = await trackLoading(() => loginUser(formData));

    if (!result.success) {
      setError(result.error?.message ?? "Failed to sign in");
      setIsPending(false);
      return;
    }

    router.push(result.data?.redirectTo ?? "/client");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-4 px-0">
          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
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
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
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
