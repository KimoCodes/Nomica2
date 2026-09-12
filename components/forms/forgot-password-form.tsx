"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const result = await requestPasswordReset(email);
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
            <CardTitle className="text-xl font-bold">Check your inbox</CardTitle>
            <p className="text-sm text-muted-foreground">
              If an account exists with{" "}
              <span className="font-medium text-foreground">{email}</span>,
              we&apos;ve sent a password reset link.
            </p>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <a
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Back to sign in
          </a>
        </p>
      </div>
    );
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
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
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
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-11 pl-10"
                />
              </div>
            </div>
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
                "Send reset link"
              )}
            </button>
          </div>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
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
