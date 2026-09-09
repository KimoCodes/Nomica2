"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomerPortalAction } from "@/actions/subscription.actions";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

export function StripePortalButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpenPortal() {
    setLoading(true);
    setError(null);

    try {
      const result = await createCustomerPortalAction();
      if (result.url) {
        window.location.href = result.url;
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch {
      setError("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={handleOpenPortal} disabled={loading} size="lg">
        {loading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <ExternalLink className="mr-2 size-4" />
        )}
        {loading ? "Opening..." : "Open Billing Portal"}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
