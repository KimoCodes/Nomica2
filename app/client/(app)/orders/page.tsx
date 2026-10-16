import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/constants/subscriptions";
import { ArrowRight, ReceiptText } from "lucide-react";

export default async function ClientOrdersPage() {
  const session = await requireRole([Role.CLIENT]);
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      currency: true,
      totalCents: true,
      createdAt: true,
      paidAt: true,
      items: { select: { id: true, productName: true, quantity: true } },
    },
  });

  return (
    <DashboardLayout title="Orders" navItems={[...CLIENT_NAV]} userName={session.user.name} userRole="Client">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
          <p className="mt-1 text-muted-foreground">Your one-time program and bundle purchases.</p>
        </div>
        {orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">Order {order.id.slice(-8).toUpperCase()}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(order.paidAt ?? order.createdAt)}
                    </p>
                    <ul className="mt-3 space-y-1 text-sm">
                      {order.items.map((item) => <li key={item.id}>{item.productName}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</li>)}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{order.status.replaceAll("_", " ")}</span>
                    <span className="text-lg font-bold">{formatPrice(order.totalCents)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <ReceiptText className="mb-4 size-10 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No orders yet</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">Your order confirmations and purchased programs will appear here.</p>
              <Link href="/programs" className={cn(buttonVariants(), "mt-6")}>Explore Programs <ArrowRight className="ml-2 size-4" /></Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
