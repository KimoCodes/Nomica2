import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { ADMIN_NAV } from "@/constants/navigation";
import { getPaymentRequestsForAdmin } from "@/server/services/payment-request.service";
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
import { Receipt, CheckCircle2, XCircle, Clock, FileImage } from "lucide-react";
import { PaymentReviewActions } from "@/app/shared/payments/payment-review-actions";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  PENDING: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  APPROVED: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  REJECTED: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  PROOF_REQUESTED: { color: "bg-primary/10 text-primary border-primary/20", icon: FileImage },
};

export default async function AdminPaymentsPage() {
  const session = await requireRole([Role.ADMIN]);
  const paymentRequests = await getPaymentRequestsForAdmin();

  const pendingCount = paymentRequests.filter(
    (pr) => pr.status === "PENDING",
  ).length;
  const approvedCount = paymentRequests.filter(
    (pr) => pr.status === "APPROVED",
  ).length;
  const totalAmount = paymentRequests
    .filter((pr) => pr.status === "APPROVED")
    .reduce((sum, pr) => sum + pr.amount, 0);

  return (
    <DashboardLayout
      title="Payment Reviews"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Reviews</h2>
          <p className="mt-1 text-muted-foreground">
            Review and manage client payment submissions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold">{pendingCount}</p>
                </div>
                <div className="rounded-xl bg-warning/10 p-2.5 icon-hover">
                  <Clock className="size-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold">{approvedCount}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold">${(totalAmount / 100).toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5 icon-hover">
                  <Receipt className="size-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slide-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">All Payment Requests</CardTitle>
            <Badge variant="secondary">{paymentRequests.length}</Badge>
          </CardHeader>
          <CardContent>
            {paymentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <Receipt className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No payment requests yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Payment requests will appear here once clients submit them.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRequests.map((pr) => {
                    const config = statusConfig[pr.status] ?? statusConfig.PENDING;
                    const Icon = config.icon;
                    return (
                      <TableRow key={pr.id} className="transition-colors hover:bg-accent/30">
                        <TableCell>
                          <div>
                            <p className="font-medium">{pr.clientUser.name}</p>
                            <p className="text-xs text-muted-foreground">{pr.clientUser.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{pr.plan.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(pr.amount / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {pr.paymentMethod}
                        </TableCell>
                        <TableCell>
                          <Badge className={`flex items-center gap-1 w-fit ${config.color}`}>
                            <Icon className="size-3" />
                            {pr.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {pr.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <PaymentReviewActions
                            paymentRequest={pr}
                            role="ADMIN"
                          />
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
