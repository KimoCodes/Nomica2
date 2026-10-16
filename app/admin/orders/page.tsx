import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { formatPrice } from "@/constants/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt } from "lucide-react";
import { RefundOrderButton } from "./order-actions";

export const runtime = "nodejs";

export default async function AdminOrdersPage() {
  const session = await requireRole([Role.ADMIN]);
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        select: {
          id: true,
          productName: true,
          productKind: true,
          quantity: true,
          lineTotalCents: true,
          entitlements: {
            select: {
              id: true,
              status: true,
              product: { select: { name: true } },
            },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, providerPaymentId: true },
      },
    },
  });

  return (
    <DashboardLayout
      title="Orders"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">One-time orders</h2>
          <p className="mt-1 text-muted-foreground">
            Recent catalog checkouts and payment state. Legacy subscription
            payments remain in their existing views.
          </p>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Latest 100 orders</CardTitle>
            <Badge variant="secondary">{orders.length}</Badge>
          </CardHeader>
          <CardContent>
            {orders.length === 0
              ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed py-12 text-center">
                  <Receipt className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="font-medium">No one-time orders yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    New orders will appear here after checkout begins.
                  </p>
                </div>
              )
              : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{order.user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {order.user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ul className="space-y-1">
                              {order.items.map((item) => (
                                <li key={item.id} className="text-sm">
                                  {item.productName}
                                  {item.quantity > 1
                                    ? ` × ${item.quantity}`
                                    : ""}
                                  {item.entitlements.length > 0 && (
                                    <ul className="ml-4 mt-1 space-y-0.5 text-xs text-muted-foreground">
                                      {item.entitlements.map((entitlement) => (
                                        <li key={entitlement.id}>
                                          {entitlement.product.name}:{" "}
                                          {entitlement.status.toLowerCase()}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(order.totalCents)}
                            <span className="ml-1 text-xs text-muted-foreground">
                              {order.currency.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {order.status.toLowerCase().replaceAll("_", " ")}
                            </Badge>
                            {order.payments[0] && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                {order.payments[0].status}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {order.createdAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <RefundOrderButton
                              orderId={order.id}
                              disabled={
                                !["PAID", "PARTIALLY_REFUNDED"].includes(
                                  order.status,
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
