import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import { getCoachClientSubscriptions } from "@/server/services/admin.service";
import { getCoachFreeTrials } from "@/server/services/free-trial.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Users, UserCheck, Gift } from "lucide-react";
import { CoachSubscriptionActions } from "./subscription-actions";
import { GrantTrialDialog } from "@/components/shared/grant-trial-dialog";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  trialing: "bg-primary/10 text-primary border-primary/20",
  past_due: "bg-warning/10 text-warning border-warning/20",
  canceled: "bg-muted text-muted-foreground border-border",
  unpaid: "bg-destructive/10 text-destructive border-destructive/20",
};

const trialStatusColors: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success border-success/20",
  EXPIRED: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

export default async function CoachSubscriptionsPage() {
  const session = await requireRole([Role.COACH]);
  const [clients, freeTrials] = await Promise.all([
    getCoachClientSubscriptions(session.user.id),
    getCoachFreeTrials(session.user.id),
  ]);

  const withSubscription = clients.filter((c) => c.subscription);
  const withoutSubscription = clients.filter((c) => !c.subscription);
  const activeCount = withSubscription.filter(
    (c) => c.subscription?.status === "active",
  ).length;
  const activeTrialsCount = freeTrials.filter(
    (t) => t.status === "ACTIVE" && t.endDate >= new Date(),
  ).length;

  const activeTrialsByUser = new Map(
    freeTrials
      .filter((t) => t.status === "ACTIVE" && t.endDate >= new Date())
      .map((t) => {
        const now = new Date();
        const daysRemaining = Math.max(
          0,
          Math.ceil((t.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
        return [t.userId, { ...t, daysRemaining }];
      })
  );

  return (
    <DashboardLayout
      title="Client Subscriptions"
      navItems={[...COACH_NAV]}
      userName={session.user.name}
      userRole="Coach"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Subscriptions</h2>
          <p className="mt-1 text-muted-foreground">
            Approve subscriptions, grant free trials, and manage client access.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                  <p className="text-3xl font-bold">{clients.length}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
                  <Users className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                  <p className="text-3xl font-bold">{activeCount}</p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <CreditCard className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Trials</p>
                  <p className="text-3xl font-bold">{activeTrialsCount}</p>
                </div>
                <div className="rounded-xl bg-chart-5/10 p-2.5 icon-hover">
                  <Gift className="size-5 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-4 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Need Subscription</p>
                  <p className="text-3xl font-bold">{withoutSubscription.length}</p>
                </div>
                <div className="rounded-xl bg-warning/10 p-2.5 icon-hover">
                  <UserCheck className="size-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slide-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Client Subscriptions</CardTitle>
            <Badge variant="secondary">{clients.length}</Badge>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <Users className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No clients yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Clients will appear here once you accept them.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Free Trial</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const activeTrial = activeTrialsByUser.get(client.userId);
                    return (
                      <TableRow key={client.id} className="transition-colors hover:bg-accent/30">
                        <TableCell>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.subscription ? (
                            <Badge variant="outline">
                              {client.subscription.plan.replace("_", " ")}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {client.subscription ? (
                            <Badge className={`capitalize ${statusColors[client.subscription.status] ?? ""}`}>
                              {client.subscription.status.replace("_", " ")}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">No subscription</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {activeTrial ? (
                            <Badge className={trialStatusColors.ACTIVE}>
                              <Gift className="mr-1 size-3" />
                              {activeTrial.daysRemaining}d left
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {client.subscription?.approvedBy?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {client.subscription?.currentPeriodEnd
                            ? client.subscription.currentPeriodEnd.toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <GrantTrialDialog
                              targetUserId={client.userId}
                              targetUserName={client.name}
                              hasActiveTrial={!!activeTrial}
                              activeTrialId={activeTrial?.id}
                            />
                            <CoachSubscriptionActions
                              targetUserId={client.userId}
                              currentPlan={client.subscription?.plan ?? "ALL_ACCESS_MONTHLY"}
                              status={client.subscription?.status ?? "canceled"}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
