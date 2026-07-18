"use client";

import { cn } from "@/lib/utils";

const spinnerSizes = {
  xs: "size-3",
  sm: "size-4",
  default: "size-5",
  lg: "size-8",
  xl: "size-12",
  "2xl": "size-16",
} as const;

type SpinnerSize = keyof typeof spinnerSizes;

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
  label?: string;
};

export function Spinner({ size = "default", className, label }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={cn("relative inline-flex shrink-0", spinnerSizes[size], className)}
    >
      <svg
        className="size-full animate-spin"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={4}
        />
        <path
          d="M25 5C13.954 5 5 13.954 5 25"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

type InlineLoaderProps = {
  text?: string;
  size?: SpinnerSize;
  className?: string;
};

export function InlineLoader({ text = "Loading", size = "sm", className }: InlineLoaderProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Spinner size={size} />
      <span>{text}...</span>
    </span>
  );
}
