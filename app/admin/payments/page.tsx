import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { StripeOrdersPanel } from "@/app/shared/payments/stripe-orders-panel";

export default async function AdminPaymentsPage() {
  const session = await requireRole([Role.ADMIN]);
  const [paidOrderSummary, paidOrders, archivedOrders, archivedOrderCount] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "PAID", archivedAt: null },
      _count: { _all: true },
      _sum: { totalCents: true },
    }),
    prisma.order.findMany({
      where: { status: "PAID", archivedAt: null },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      take: 100,
      select: {
        id: true,
        totalCents: true,
        currency: true,
        createdAt: true,
        paidAt: true,
        user: { select: { name: true, email: true } },
        items: { select: { id: true, productName: true, quantity: true } },
      },
    }),
    prisma.order.findMany({
      where: { status: "PAID", archivedAt: { not: null } },
      orderBy: [{ archivedAt: "desc" }, { paidAt: "desc" }],
      take: 100,
      select: {
        id: true,
        totalCents: true,
        currency: true,
        createdAt: true,
        paidAt: true,
        user: { select: { name: true, email: true } },
        items: { select: { id: true, productName: true, quantity: true } },
      },
    }),
    prisma.order.count({
      where: { status: "PAID", archivedAt: { not: null } },
    }),
  ]);

  return (
    <DashboardLayout
      title="Payments"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
          <p className="mt-1 text-muted-foreground">
            Successful Stripe purchases and payment totals.
          </p>
        </div>

        <StripeOrdersPanel
          orders={paidOrders}
          archivedOrders={archivedOrders}
          archivedOrderCount={archivedOrderCount}
          activeOrderCount={paidOrderSummary._count._all}
          activeRevenueCents={paidOrderSummary._sum.totalCents ?? 0}
          canManageArchive
        />
      </div>
    </DashboardLayout>
  );
}
