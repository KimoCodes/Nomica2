import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { getUserSubscription } from "@/server/services/subscription.service";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PLANS, formatPrice, canUpgrade, canDowngrade } from "@/constants/subscriptions";
import { SubscriptionActions } from "./subscription-actions";
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
import { CreditCard, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default async function ClientSubscriptionPage() {
  const session = await requireRole([Role.CLIENT]);
  const subscription = await getUserSubscription(session.user.id);

  const planDef = subscription ? PLANS.find((p) => p.id === subscription.plan) : null;
  const upgradePlan = subscription ? canUpgrade(subscription.plan) : null;
  const downgradePlan = subscription ? canDowngrade(subscription.plan) : null;

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
                  <p className="text-3xl font-bold">{subscription?.plan ?? "None"}</p>
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
                    {subscription?.status?.replace("_", " ") ?? "—"}
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
                  Choose a plan to get started with NoMica.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up stagger-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Available Plans</CardTitle>
            <Badge variant="secondary">{PLANS.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
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
                    {formatPrice(plan.monthlyPrice)}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li
                        key={f.name}
                        className={`flex items-center gap-2 text-sm ${
                          f.included ? "text-foreground" : "text-muted-foreground line-through"
                        }`}
                      >
                        <CheckCircle2
                          className={`size-4 ${
                            f.included ? "text-success" : "text-muted-foreground/30"
                          }`}
                        />
                        {f.name}
                      </li>
                    ))}
                  </ul>
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
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
