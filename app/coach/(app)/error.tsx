"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function CoachError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center animate-fade-in">
        <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-destructive/10 shadow-premium animate-scale-in">
          <AlertTriangle className="size-10 text-destructive" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-destructive">
          Coach Dashboard Error
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          An error occurred in the coach dashboard. Please try again.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className={`${buttonVariants({ className: "group" })}`}
          >
            <RefreshCw className="mr-2 size-4 transition-transform group-hover:rotate-180" />
            Try again
          </button>
          <Link
            href="/coach"
            className={`${buttonVariants({ variant: "outline", className: "group" })}`}
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-0.5" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
