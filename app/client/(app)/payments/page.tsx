import { Role } from "@prisma/client";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { prisma } from "@/lib/prisma";
import { getSubscriptionForClient } from "@/server/services/subscription.service";
import { formatPrice } from "@/constants/subscriptions";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Clock, CreditCard, Package } from "lucide-react";

export default async function ClientPaymentsPage() {
  const session = await requireRole([Role.CLIENT]);

  const [, fullSubscription, paymentCount, purchaseSummary] = await Promise.all([
    getSubscriptionForClient(session.user.id),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        stripeCustomerId: true,
        plan: true,
        status: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      },
    }),
    prisma.payment.count({
      where: {
        subscription: { userId: session.user.id },
      },
    }),
    prisma.order.aggregate({
      where: {
        userId: session.user.id,
        status: { in: ["PAID", "PARTIALLY_REFUNDED"] },
      },
      _count: true,
      _sum: { totalCents: true },
    }),
  ]);

  const hasStripeCustomer = fullSubscription?.stripeCustomerId &&
    !fullSubscription.stripeCustomerId.startsWith("manual_");

  const paidOrderCount = purchaseSummary._count;
  const lifetimeCents = purchaseSummary._sum.totalCents ?? 0;

  return (
    <DashboardLayout
      title="Billing"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
          <p className="mt-1 text-muted-foreground">
            Your one-time purchases, with legacy billing details below if you
            ever had a subscription.
          </p>
        </div>

        {/* Purchases Summary */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-base">Your Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {paidOrderCount > 0
              ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-2.5">
                      <Package className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {paidOrderCount}{" "}
                        order{paidOrderCount === 1 ? "" : "s"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lifetimeCents > 0
                          ? `${formatPrice(lifetimeCents)} lifetime total`
                          : "One-time program purchases"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/client/orders"
                    className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    View order history
                  </Link>
                </div>
              )
              : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                  <Package className="mb-3 size-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium">No purchases yet</p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Programs you buy appear here and in your library.
                  </p>
                  <Link
                    href="/programs"
                    className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Explore Programs
                  </Link>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Current Plan Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="animate-slide-up stagger-1">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Plan
                  </p>
                  <p className="text-2xl font-bold">
                    {fullSubscription?.plan?.replace(/_/g, " ") ?? "None"}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <CreditCard className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-2">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <p className="text-2xl font-bold capitalize">
                    {fullSubscription?.status?.replace("_", " ") ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5">
                  <CheckCircle2 className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-3">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Next Billing
                  </p>
                  <p className="text-2xl font-bold">
                    {fullSubscription?.currentPeriodEnd
                      ? new Date(
                        fullSubscription.currentPeriodEnd,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5">
                  <Clock className="size-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warnings */}
        {fullSubscription?.cancelAtPeriodEnd && (
          <Card className="border-warning/50 bg-warning/5 animate-slide-up">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="size-5 text-warning" />
              <div>
                <p className="font-medium">
                  Subscription scheduled for cancellation
                </p>
                <p className="text-sm text-muted-foreground">
                  Your subscription will end on{" "}
                  {fullSubscription.currentPeriodEnd
                    ? new Date(fullSubscription.currentPeriodEnd)
                      .toLocaleDateString()
                    : "the end of the billing period"}
                  . You can reactivate before then.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {fullSubscription?.status === "past_due" && (
          <Card className="border-destructive/50 bg-destructive/5 animate-slide-up">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="size-5 text-destructive" />
              <div>
                <p className="font-medium">Payment past due</p>
                <p className="text-sm text-muted-foreground">
                  Your latest payment failed. Contact support to update your
                  payment method and restore access.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stripe Portal */}
        <Card className="animate-slide-up stagger-4">
          <CardHeader>
            <CardTitle className="text-base">Manage Billing</CardTitle>
          </CardHeader>
          <CardContent>
            {hasStripeCustomer
              ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    New recurring plans are no longer available. You can cancel
                    an existing recurring plan from its legacy subscription
                    page.
                  </p>
                  <Link
                    href="/client/subscription"
                    className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Review or cancel legacy billing
                  </Link>
                </div>
              )
              : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                  <CreditCard className="mb-3 size-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium">No billing account</p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    {fullSubscription?.status
                      ? "Your subscription was granted by a coach or administrator. Contact them to make changes."
                      : "One-time program purchases appear in your order history."}
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Payment History Summary */}
        {paymentCount > 0 && (
          <Card className="animate-slide-up stagger-5">
            <CardHeader>
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have {paymentCount}{" "}
                recorded payment{paymentCount === 1 ? "" : "s"}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
