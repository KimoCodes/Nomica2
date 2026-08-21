import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import {
  getUserSubscription,
  checkAndNotifyExpiringSubscriptions,
} from "@/server/services/subscription.service";
import { getClientFreeTrial } from "@/server/services/free-trial.service";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PLANS, formatPrice, formatPlanPrice, canUpgrade, canDowngrade } from "@/constants/subscriptions";
import { SubscriptionActions } from "./subscription-actions";
import { CheckoutButton } from "@/components/checkout-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Gift } from "lucide-react";

export default async function ClientSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const session = await requireRole([Role.CLIENT]);
  const [subscription, freeTrial] = await Promise.all([
    getUserSubscription(session.user.id),
    getClientFreeTrial(session.user.id),
  ]);
  const params = await searchParams;
  const selectedPlan = params.plan;

  // Check for expiring subscriptions and notify (fire and forget)
  checkAndNotifyExpiringSubscriptions().catch(() => {});

  const planDef = subscription ? PLANS.find((p) => p.id === subscription.plan) : null;
  const upgradePlan = subscription ? canUpgrade(subscription.plan) : null;
  const downgradePlan = subscription ? canDowngrade(subscription.plan) : null;

  const now = new Date();
  const trialDaysRemaining = freeTrial
    ? Math.max(0, Math.ceil((freeTrial.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const hasActiveTrial = freeTrial && trialDaysRemaining > 0;

  return (
    <DashboardLayout
      title="Subscription"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription</h2>
          <p className="mt-1 text-muted-foreground">
            Manage your subscription plan and billing.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                  <p className="text-3xl font-bold">{planDef?.name ?? "None"}</p>
                  {planDef && (
                    <p className="text-sm text-muted-foreground">{formatPlanPrice(planDef)}</p>
                  )}
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
                  <CreditCard className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-3xl font-bold capitalize">
                    {subscription?.status?.replaceAll("_", " ") ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <CheckCircle2 className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                  <p className="text-3xl font-bold">
                    {subscription?.currentPeriodEnd
                      ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5 icon-hover">
                  <Clock className="size-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasActiveTrial && (
          <Card className="border-primary/30 bg-primary/5 animate-slide-up stagger-4">
            <CardContent className="flex items-center gap-3 p-4">
              <Gift className="size-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Free Trial Active</p>
                <p className="text-sm text-muted-foreground">
                  You have {trialDaysRemaining} day{trialDaysRemaining === 1 ? "" : "s"} remaining
                  on your free trial. It expires on{" "}
                  {freeTrial.endDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {freeTrial.grantedBy.name
                    ? `. Granted by ${freeTrial.grantedBy.name}`
                    : ""}
                  {freeTrial.reason ? ` — ${freeTrial.reason}` : ""}.
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Gift className="mr-1 size-3" />
                Free Trial
              </Badge>
            </CardContent>
          </Card>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <Card className="border-warning/50 bg-warning/5 animate-slide-up stagger-4">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="size-5 text-warning" />
              <div>
                <p className="font-medium">Subscription scheduled for cancellation</p>
                <p className="text-sm text-muted-foreground">
                  Your subscription will end on{" "}
                  {subscription.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    : "the end of the billing period"}
                  . You can reactivate it before then.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {subscription?.status === "past_due" && (
          <Card className="border-destructive/50 bg-destructive/5 animate-slide-up stagger-4">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="size-5 text-destructive" />
              <div>
                <p className="font-medium">Payment past due</p>
                <p className="text-sm text-muted-foreground">
                  Your latest payment failed. Please update your payment method in
                  Stripe to restore access. Your subscription may be canceled if
                  payment is not received.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="animate-slide-up stagger-4">
          <CardHeader>
            <CardTitle className="text-base">Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {planDef ? (
              <SubscriptionActions
                currentPlan={subscription!.plan}
                upgradePlan={upgradePlan}
                downgradePlan={downgradePlan}
                isCanceled={subscription!.cancelAtPeriodEnd}
                subscriptionId={subscription!.id}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <CreditCard className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No active subscription</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose a plan below to get started with NOMICA.
                </p>
                <a
                  href="#available-plans"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  View Plans
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="available-plans" className="animate-slide-up stagger-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Available Plans</CardTitle>
            <Badge variant="secondary">{PLANS.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                    subscription?.plan === plan.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-2.5 left-4">{plan.badge}</Badge>
                  )}
                  {subscription?.plan === plan.id && (
                    <Badge variant="secondary" className="absolute -top-2.5 right-4">
                      Current
                    </Badge>
                  )}
                  <p className="text-lg font-bold">{plan.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <p className="mt-3 text-3xl font-bold">
                    {formatPlanPrice(plan)}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2 className="size-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!subscription || subscription.plan !== plan.id ? (
                    <div className="mt-4">
                      <CheckoutButton
                        type="subscription"
                        plan={plan.id === "ALL_ACCESS_MONTHLY" ? "monthly" : "annual"}
                        variant={selectedPlan === plan.id ? "default" : "outline"}
                        size="default"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {subscription && subscription.payments.length > 0 && (
          <Card className="animate-slide-up stagger-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Payment History</CardTitle>
              <Badge variant="secondary">{subscription.payments.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscription.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {payment.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
