"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { preCheckLogin, preCheckStaffLogin } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Lock, ArrowRight, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";
import { cn } from "@/lib/utils";

type FieldErrors = {
  email?: string;
  password?: string;
};

function describeAuthError(error?: string | null, code?: string | null): string {
  const key = (code || error || "").toLowerCase();
  if (key === "credentialssignin" || key === "credentials") {
    return "Invalid email or password";
  }
  if (key === "missingcsrf") {
    return "Security check failed. Please try again.";
  }
  if (key === "accessdenied") {
    return "You don't have access to this account.";
  }
  if (key === "configuration") {
    return "Sign-in is temporarily unavailable. Please try again later.";
  }
  if (key === "sessionexpired") {
    return "Your session has expired. Please sign in again.";
  }
  return "Sign-in failed. Please try again.";
}

export function LoginForm({ staffLogin = false }: { staffLogin?: boolean }) {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const csrfRef = useRef<HTMLInputElement>(null);

  const authErrorParam = searchParams.get("error");
  const authCodeParam = searchParams.get("code");
  const registeredParam = searchParams.get("registered");

  const [error, setError] = useState<string | null>(
    authErrorParam || authCodeParam
      ? describeAuthError(authErrorParam, authCodeParam)
      : null
  );
  const [success] = useState<string | null>(
    registeredParam === "true" ? "Account created successfully! Sign in to continue." : null
  );
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => {
        if (csrfRef.current && data.csrfToken) {
          csrfRef.current.value = data.csrfToken;
        }
      })
      .catch(() => {});
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

    try {
      const preCheck = await trackLoading(() =>
        staffLogin ? preCheckStaffLogin(email) : preCheckLogin(email),
      );

      if (!preCheck.success) {
        setError(preCheck.error?.message ?? "Failed to sign in");
        setIsPending(false);
        return;
      }

      const requestedCallback = staffLogin ? null : searchParams.get("callbackUrl");
      const isSafeCallback =
        requestedCallback !== null &&
        requestedCallback.startsWith("/") &&
        !requestedCallback.startsWith("//") &&
        !requestedCallback.startsWith("/\\");
      const callbackUrl = isSafeCallback
        ? requestedCallback
        : preCheck.data?.redirectTo ?? "/client";

      const result = await trackLoading(() =>
        signIn("credentials", {
          email,
          password,
          redirectTo: callbackUrl,
          redirect: false,
        }),
      );

      if (result?.error) {
        setError(describeAuthError(result.error, result.code));
        setIsPending(false);
        return;
      }

      const target = result?.url || callbackUrl;
      window.location.href = target;
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <div className={cn("w-full", !staffLogin && "max-w-sm")}>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className={cn(
          "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
          staffLogin && "font-mono text-[11px] tracking-[0.15em] uppercase hover:text-foreground"
        )}
        suppressHydrationWarning
      >
        <ArrowLeft className="size-4" />
        Back to home
      </a>

      <CardHeader className="px-0 pb-6">
        <CardTitle
          className={cn(
            "text-2xl font-bold",
            staffLogin && "flex items-center gap-2.5 text-xl tracking-tight"
          )}
        >
          {staffLogin && (
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <ShieldCheck className="size-4" />
            </span>
          )}
          {staffLogin ? "Admin & Coach Login" : "Welcome back"}
        </CardTitle>
        <p
          className={cn(
            "text-sm text-muted-foreground",
            staffLogin && "font-mono text-xs leading-relaxed"
          )}
        >
          {staffLogin
            ? "Sign in with an administrator account or nomitipscoaching@gmail.com."
            : "Sign in to your account to continue"}
        </p>
      </CardHeader>

      <form ref={formRef} action="/api/auth/callback/credentials" method="POST" onSubmit={handleSubmit}>
        <input type="hidden" name="csrfToken" ref={csrfRef} />
        <input type="hidden" name="callbackUrl" value="/client" />

        <CardContent className="space-y-4 px-0">
          {success && (
            <div aria-live="polite" className="flex items-center gap-2 rounded-xl border border-success/50 bg-success/10 px-4 py-3 text-sm text-success">
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
            <Label
              htmlFor="email"
              className={cn(
                "text-sm font-medium",
                staffLogin &&
                  "font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
              )}
            >
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
                className={cn(
                  "h-11 pl-10",
                  staffLogin && "bg-muted/40 font-mono text-sm",
                  fieldErrors.email && "border-destructive"
                )}
              />
            </div>
            {fieldErrors.email && (
              <p role="alert" className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className={cn(
                "text-sm font-medium",
                staffLogin &&
                  "font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
              )}
            >
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
                className={cn(
                  "h-11 pl-10",
                  staffLogin && "bg-muted/40 font-mono text-sm",
                  fieldErrors.password && "border-destructive"
                )}
              />
            </div>
            {fieldErrors.password && (
              <p role="alert" className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className={cn(
                  "text-xs font-medium text-primary hover:underline",
                  staffLogin && "font-mono text-[11px] tracking-[0.15em] uppercase"
                )}
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-0 pt-4">
          <LoadingButton
            type="submit"
            className={cn(
              "w-full group",
              staffLogin &&
                "h-11 font-mono text-xs font-semibold tracking-[0.2em] uppercase"
            )}
            loading={isPending}
            loadingText="Signing in..."
          >
            Sign in
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </LoadingButton>

          {!staffLogin && (
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Create one
              </Link>
            </p>
          )}
        </CardFooter>
      </form>
    </div>
  );
}
