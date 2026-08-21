import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { prisma } from "@/lib/prisma";
import { getSubscriptionForClient } from "@/server/services/subscription.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentForm } from "./payment-form";
import { Receipt, CheckCircle2, XCircle, Clock, FileImage } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  PENDING: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  APPROVED: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  REJECTED: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  PROOF_REQUESTED: { color: "bg-primary/10 text-primary border-primary/20", icon: FileImage },
};

export default async function ClientPaymentsPage() {
  const session = await requireRole([Role.CLIENT]);
  const [subscription, paymentRequests] = await Promise.all([
    getSubscriptionForClient(session.user.id),
    prisma.paymentRequest.findMany({
      where: { clientUserId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        reviewedBy: { select: { name: true } },
      },
    }),
  ]);

  return (
    <DashboardLayout
      title="Payments"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
          <p className="mt-1 text-muted-foreground">
            Submit payment requests and track their status.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PaymentForm currentSubscription={subscription} />
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Receipt className="mb-3 size-8 text-muted-foreground/30" />
                    <p className="text-sm font-medium">No payments yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submit your first payment request to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentRequests.map((pr) => {
                      const config = statusConfig[pr.status] ?? statusConfig.PENDING;
                      const Icon = config.icon;
                      return (
                        <div
                          key={pr.id}
                          className="rounded-xl border border-border/50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="size-4" />
                              <span className="text-sm font-medium">
                                {pr.plan.replace("_", " ")}
                              </span>
                            </div>
                            <Badge className={`text-xs ${config.color}`}>
                              {pr.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {pr.createdAt.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>${(pr.amount / 100).toFixed(2)}</span>
                          </div>
                          {pr.reviewNote && (
                            <p className="mt-2 text-xs text-muted-foreground italic">
                              &quot;{pr.reviewNote}&quot;
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
