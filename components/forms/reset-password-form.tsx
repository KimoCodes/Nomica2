"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  if (!token) {
    return (
      <div className="w-full max-w-sm">
        <a
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </a>

        <Card className="border-border/50 shadow-premium">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <CardTitle className="text-xl font-bold">Invalid link</CardTitle>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or missing a token.
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <a
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Request a new reset link
          </a>
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm">
        <a
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </a>

        <Card className="border-border/50 shadow-premium">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="size-6 text-success" />
            </div>
            <CardTitle className="text-xl font-bold">Password reset</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your password has been updated. You can now sign in with your new
              password.
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <a
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldError("");

    if (password.length < 8) {
      setFieldError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token!, password);
      if (!result.success) {
        setError(result.error?.message ?? "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

    return (
      <div className="w-full max-w-sm">
        <a
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </a>

      <Card className="border-border/50 shadow-premium">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-2xl font-bold">Set new password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-6">
            {error && (
              <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldError("");
                  }}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className={`h-11 pl-10 ${fieldError ? "border-destructive" : ""}`}
                />
              </div>
              {fieldError && (
                <p role="alert" className="text-xs text-destructive">{fieldError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Min 8 characters with uppercase, lowercase, and a number
            </p>
          </CardContent>

          <div className="flex flex-col gap-4 px-6 pt-2 pb-6">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full group",
              )}
            >
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                "Reset password"
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
