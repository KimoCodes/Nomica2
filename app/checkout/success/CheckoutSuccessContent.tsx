"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  CreditCard,
} from "lucide-react";

async function activateSubscription(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/subscription/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    const data = await res.json();
    return data?.activated === true;
  } catch {
    return false;
  }
}

export default function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"processing" | "success">(
    "processing"
  );

  const isSubscription = searchParams.get("subscription") === "success";
  const isPurchase = searchParams.get("purchase") === "success";
  const sessionId = searchParams.get("session_id");

  const activate = useCallback(async () => {
    if (!sessionId) {
      setStatus("success");
      return;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const activated = await activateSubscription(sessionId);

      if (activated) {
        document.cookie =
          "checkout_grace=1; path=/client; max-age=300; SameSite=Lax";

        setStatus("success");
        return;
      }

      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }

    document.cookie =
      "checkout_grace=1; path=/client; max-age=300; SameSite=Lax";

    setStatus("success");
  }, [sessionId]);

  useEffect(() => {
    if (isSubscription) {
      activate();
    } else if (isPurchase) {
      document.cookie =
        "checkout_grace=1; path=/client; max-age=300; SameSite=Lax";

      const timer = setTimeout(() => setStatus("success"), 2000);

      return () => clearTimeout(timer);
    } else {
      router.push("/client/subscription");
    }
  }, [isSubscription, isPurchase, router, activate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          {status === "processing" ? (
            <>
              <Loader2 className="mb-4 size-12 animate-spin text-primary" />

              <h1 className="text-xl font-bold">
                Activating your subscription...
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Confirming your payment with Stripe...
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="size-6 text-success" />
              </div>

              <h1 className="text-xl font-bold">
                {isSubscription
                  ? "Subscription activated!"
                  : "Payment successful!"}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {isSubscription
                  ? "Welcome to NomiTips All Access. Your subscription is now active."
                  : "Your purchase is complete. You now have access to your program."}
              </p>

              <div className="mt-6 flex gap-3">
                <Link href="/client">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>

                <Link href="/client/subscription">
                  <Button variant="outline">
                    <CreditCard className="mr-2 size-4" />
                    View Subscription
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                You&apos;ll receive a confirmation email shortly.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}