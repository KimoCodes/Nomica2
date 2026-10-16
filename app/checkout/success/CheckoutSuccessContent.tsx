"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { readCartIds, writeCartIds } from "@/components/cart/cart-storage";

type OrderSummary = {
  id: string;
  status:
    | "PENDING"
    | "PAID"
    | "PAYMENT_FAILED"
    | "CANCELED"
    | "PARTIALLY_REFUNDED"
    | "REFUNDED";
  items: Array<{ id: string; productId: string; productName: string }>;
};

type ViewState =
  | "checking"
  | "paid"
  | "pending"
  | "failed"
  | "refunded"
  | "unavailable";

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const legacySubscriptionReturn =
    searchParams.get("subscription") === "success";
  const [state, setState] = useState<ViewState>("checking");
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function confirmOrder() {
      if (!orderId && !legacySubscriptionReturn) {
        setState("unavailable");
        return;
      }

      for (let attempt = 0; attempt < 6 && !cancelled; attempt += 1) {
        try {
          const response = legacySubscriptionReturn
            ? await fetch("/api/subscription/activate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: searchParams.get("session_id"),
              }),
              cache: "no-store",
            })
            : await fetch(`/api/orders/${encodeURIComponent(orderId!)}`, {
              cache: "no-store",
            });
          if (response.status === 401 || response.status === 404) {
            if (!cancelled) setState("unavailable");
            return;
          }
          if (!response.ok) throw new Error("ORDER_LOOKUP_FAILED");

          const result = await response.json() as {
            order?: OrderSummary;
            activated?: boolean;
          };
          if (cancelled) return;

          if (legacySubscriptionReturn) {
            if (result.activated) {
              setState("paid");
              return;
            }
          } else if (result.order) {
            setOrder(result.order);

            if (result.order.status === "PAID") {
              const purchasedIds = new Set(
                result.order.items.map((item) => item.productId),
              );
              writeCartIds(readCartIds().filter((id) => !purchasedIds.has(id)));
              setState("paid");
              return;
            }
            if (
              result.order.status === "PAYMENT_FAILED" ||
              result.order.status === "CANCELED"
            ) {
              setState("failed");
              return;
            }
            if (
              result.order.status === "REFUNDED" ||
              result.order.status === "PARTIALLY_REFUNDED"
            ) {
              setState("refunded");
              return;
            }
          }
        } catch {
          if (attempt === 5 && !cancelled) {
            setState("pending");
            return;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (!cancelled) setState("pending");
    }

    void confirmOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId, legacySubscriptionReturn, searchParams]);

  const isChecking = state === "checking";
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          {isChecking
            ? (
              <>
                <Loader2 className="mb-4 size-12 animate-spin text-primary" />
                <h1 className="text-xl font-bold">Confirming your purchase</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We’re checking the payment confirmation. This can take a
                  moment.
                </p>
              </>
            )
            : state === "paid"
            ? (
              <>
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
                <h1 className="text-xl font-bold">
                  {legacySubscriptionReturn
                    ? "Your existing subscription is confirmed"
                    : "Your purchase is complete"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {legacySubscriptionReturn
                    ? "Your payment confirmation was received. Manage its legacy billing in your account."
                    : `${
                      order?.items.map((item) => item.productName).join(", ")
                    } is now in My Programs.`}
                </p>
                <div className="mt-6">
                  <Link
                    href={legacySubscriptionReturn
                      ? "/client/subscription"
                      : "/client/programs"}
                  >
                    <Button>
                      {legacySubscriptionReturn
                        ? "View account billing"
                        : "Open My Programs"}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )
            : state === "refunded"
            ? (
              <>
                <h1 className="text-xl font-bold">Refund recorded</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  The payment provider recorded a full or partial refund for
                  this order. Check My Programs for current access.
                </p>
                <div className="mt-6">
                  <Link href="/client/programs">
                    <Button>My Programs</Button>
                  </Link>
                </div>
              </>
            )
            : state === "failed"
            ? (
              <>
                <h1 className="text-xl font-bold">Payment wasn’t completed</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your account is safe. Return to the catalog and try checkout
                  again when you’re ready.
                </p>
                <div className="mt-6">
                  <Link href="/programs">
                    <Button>Explore Programs</Button>
                  </Link>
                </div>
              </>
            )
            : state === "pending"
            ? (
              <>
                <h1 className="text-xl font-bold">
                  Payment confirmation is still processing
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We haven’t added the programs yet. Refresh this page in a
                  moment or check My Programs later.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Refresh status
                  </Button>
                  <Link href="/client/programs">
                    <Button>My Programs</Button>
                  </Link>
                </div>
              </>
            )
            : (
              <>
                <h1 className="text-xl font-bold">
                  We couldn’t verify this order
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to the account used at checkout, then open My Programs
                  to check your library.
                </p>
                <div className="mt-6 flex gap-3">
                  <Link href="/login">
                    <Button variant="outline">Sign in</Button>
                  </Link>
                  <Link href="/programs">
                    <Button>Explore Programs</Button>
                  </Link>
                </div>
              </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
