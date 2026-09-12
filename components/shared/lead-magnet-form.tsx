"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { sendFreeGuideAction } from "@/actions/free-guide.actions";

export function LeadMagnetForm() {
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
      const formData = new FormData();
      formData.set("email", email);
      const result = await sendFreeGuideAction(formData);
      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
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
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="size-6 text-success" />
        </div>
        <p className="text-lg font-semibold">Check Your Inbox!</p>
        <p className="text-sm text-muted-foreground">
          We sent your free 5-Day Glute Guide to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="lead-magnet-email" className="sr-only">
        Email address
      </label>
      <input
        id="lead-magnet-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        disabled={loading}
        className={cn(
          buttonVariants({ size: "lg" }),
          "shadow-premium",
        )}
      >
        {loading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <>
            Send Me the Guide
            <ArrowRight className="ml-2 size-4" />
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-destructive sm:col-span-2">{error}</p>
      )}
    </form>
  );
}
