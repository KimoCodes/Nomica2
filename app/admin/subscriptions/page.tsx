import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { ADMIN_NAV } from "@/constants/navigation";
import { getAdminSubscriptions } from "@/server/services/admin.service";
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
import { CreditCard, TrendingUp, Users } from "lucide-react";
import { AdminSubscriptionActions } from "./subscription-actions";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  trialing: "bg-primary/10 text-primary border-primary/20",
  past_due: "bg-warning/10 text-warning border-warning/20",
  canceled: "bg-muted text-muted-foreground border-border",
  unpaid: "bg-destructive/10 text-destructive border-destructive/20",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function AdminSubscriptionsPage() {
  const session = await requireRole([Role.ADMIN]);
  const subscriptions = await getAdminSubscriptions();

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const totalRevenue = subscriptions.reduce(
    (sum, s) => sum + (s.payments[0]?.amount ?? 0),
    0,
  );

  return (
    <DashboardLayout
      title="Subscriptions"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscriptions</h2>
          <p className="mt-1 text-muted-foreground">
            View all subscriptions and payment history.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Subscriptions</p>
                  <p className="text-3xl font-bold">{subscriptions.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold">{activeCount}</p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <Users className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Recent Revenue</p>
                  <p className="text-3xl font-bold">{currencyFormatter.format(totalRevenue / 100)}</p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5 icon-hover">
                  <TrendingUp className="size-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slide-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">All Subscriptions</CardTitle>
            <Badge variant="secondary">{subscriptions.length}</Badge>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <CreditCard className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No subscriptions yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Subscriptions will appear here once users sign up.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="transition-colors hover:bg-accent/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.user.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sub.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${statusColors[sub.status] ?? ""}`}>
                          {sub.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sub.payments[0]?.createdAt.toLocaleDateString() ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {sub.payments[0]
                          ? currencyFormatter.format(sub.payments[0].amount / 100)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <AdminSubscriptionActions
                          subscriptionId={sub.id}
                          currentPlan={sub.plan}
                          status={sub.status}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
