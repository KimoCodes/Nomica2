import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
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
import { KeyRound } from "lucide-react";
import { getAdminProducts } from "@/actions/product-admin.actions";
import { EntitlementManager, RevokeEntitlementButton } from "./entitlement-actions";

export const runtime = "nodejs";

export default async function AdminEntitlementsPage() {
  const session = await requireRole([Role.ADMIN]);
  const [entitlements, products] = await Promise.all([
    prisma.entitlement.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    getAdminProducts(),
  ]);

  const productOptions = products.map((product) => ({
    id: product.id,
    name: product.name,
    status: product.status,
  }));

  return (
    <DashboardLayout
      title="Entitlements"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Catalog entitlements
          </h2>
          <p className="mt-1 text-muted-foreground">
            Durable one-time access grants. Refunded orders revoke their
            entitlements automatically; use this page for support grants and
            manual revocations.
          </p>
        </div>

        <EntitlementManager productOptions={productOptions} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent entitlements</CardTitle>
            <Badge variant="secondary">{entitlements.length}</Badge>
          </CardHeader>
          <CardContent>
            {entitlements.length === 0
              ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed py-12 text-center">
                  <KeyRound className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="font-medium">No entitlements yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Entitlements are created when a checkout completes.
                  </p>
                </div>
              )
              : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Grant</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Granted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entitlements.map((entitlement) => (
                        <TableRow key={entitlement.id}>
                          <TableCell>
                            <div className="font-medium">
                              {entitlement.user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entitlement.user.email}
                            </div>
                          </TableCell>
                          <TableCell>{entitlement.product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entitlement.grantType}</Badge>
                          </TableCell>
                          <TableCell>
                            {entitlement.status === "ACTIVE"
                              ? (
                                <Badge className="bg-success/10 text-success border-success/20">
                                  Active
                                </Badge>
                              )
                              : (
                                <Badge variant="secondary">Revoked</Badge>
                              )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {entitlement.reason ?? "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {entitlement.grantedAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <RevokeEntitlementButton
                              entitlementId={entitlement.id}
                              disabled={entitlement.status !== "ACTIVE"}
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
