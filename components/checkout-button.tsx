"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createProductCheckout,
  createSubscriptionCheckout,
} from "@/actions/checkout.actions";
import { trackLoading } from "@/components/ui/loading-bar";
import { Loader2 } from "lucide-react";

type CheckoutButtonProps = {
  variant?: "default" | "outline";
  size?: "default" | "lg";
  className?: string;
  onError?: (message: string) => void;
} & (
  | { type: "product"; productId: string }
  | { type: "subscription"; plan: "monthly" | "annual" }
);

export function CheckoutButton({
  type,
  variant = "default",
  size = "lg",
  className,
  onError,
  ...props
}: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (type === "product") {
        result = await trackLoading(() =>
          createProductCheckout((props as { productId: string }).productId),
        );
      } else {
        result = await trackLoading(() =>
          createSubscriptionCheckout((props as { plan: "monthly" | "annual" }).plan),
        );
      }

      if (result.success && result.data?.url) {
        router.push(result.data.url);
      } else if (result.error) {
        const message = result.error.code === "STRIPE_NOT_CONFIGURED"
          ? "Payment system is not configured yet. Please contact support."
          : result.error.message;

        if (onError) {
          onError(message);
        } else {
          setError(message);
        }
      }
    } catch {
      const message = "Something went wrong. Please try again.";
      if (onError) {
        onError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={cn(
          buttonVariants({ variant, size }),
          "w-full group",
          loading && "cursor-not-allowed opacity-70",
          className,
        )}
      >
        {loading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : null}
        {loading ? "Redirecting..." : "Get started"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
