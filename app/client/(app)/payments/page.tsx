import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { prisma } from "@/lib/prisma";
import { getSubscriptionForClient } from "@/server/services/subscription.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { StripePortalButton } from "./stripe-portal-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default async function ClientPaymentsPage() {
  const session = await requireRole([Role.CLIENT]);

  const [, fullSubscription, paymentCount] = await Promise.all([
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
  ]);

  const hasStripeCustomer =
    fullSubscription?.stripeCustomerId &&
    !fullSubscription.stripeCustomerId.startsWith("manual_");

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
            Manage your subscription, payment method, and view invoices.
          </p>
        </div>

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
                <p className="font-medium">Subscription scheduled for cancellation</p>
                <p className="text-sm text-muted-foreground">
                  Your subscription will end on{" "}
                  {fullSubscription.currentPeriodEnd
                    ? new Date(fullSubscription.currentPeriodEnd).toLocaleDateString()
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
                  Your latest payment failed. Update your payment method below
                  to restore access.
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
            {hasStripeCustomer ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use Stripe&apos;s secure billing portal to update your payment
                  method, view invoices, download receipts, and manage your
                  subscription.
                </p>
                <StripePortalButton />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <CreditCard className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No billing account</p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {fullSubscription?.status
                    ? "Your subscription was granted by a coach or administrator. Contact them to make changes."
                    : "Subscribe to a plan to manage your billing through Stripe."}
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
                You have {paymentCount} recorded payment{paymentCount === 1 ? "" : "s"}.
                {hasStripeCustomer && (
                  <>
                    {" "}
                    View full details in the Stripe billing portal above.
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
