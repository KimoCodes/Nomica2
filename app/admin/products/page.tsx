import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { ADMIN_NAV } from "@/constants/navigation";
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
import { Package, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { getAdminProducts, getAllPrograms } from "@/actions/product-admin.actions";
import { ProductActions, CreateProductButton } from "./product-actions";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const runtime = "nodejs";

export default async function AdminProductsPage() {
  const session = await requireRole([Role.ADMIN]);
  const [products, programs] = await Promise.all([
    getAdminProducts(),
    getAllPrograms(),
  ]);

  const totalRevenue = products.reduce(
    (sum, p) => sum + p._count.purchases * p.priceCents,
    0,
  );
  const activeCount = products.filter((p) => p.isActive).length;
  const totalPurchases = products.reduce((sum, p) => sum + p._count.purchases, 0);

  return (
    <DashboardLayout
      title="Products"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Products Manager</h2>
            <p className="mt-1 text-muted-foreground">
              Manage programs, challenges, and bundles available for purchase.
            </p>
          </div>
          <CreateProductButton programs={programs} />
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="animate-slide-up stagger-1">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Package className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-2">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold">{activeCount}</p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5">
                  <TrendingUp className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                  <p className="text-3xl font-bold">{totalPurchases}</p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5">
                  <ShoppingCart className="size-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-4">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold">{currencyFormatter.format(totalRevenue / 100)}</p>
                </div>
                <div className="rounded-xl bg-warning/10 p-2.5">
                  <DollarSign className="size-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slide-up stagger-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">All Products</CardTitle>
            <Badge variant="secondary">{products.length}</Badge>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <Package className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No products yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first product to get started.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.tagline && (
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {product.tagline}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.kind}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {currencyFormatter.format(product.priceCents / 100)}
                      </TableCell>
                      <TableCell>{product._count.purchases}</TableCell>
                      <TableCell>{product._count.reviews}</TableCell>
                      <TableCell>
                        {product.isActive ? (
                          <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ProductActions product={product} programs={programs} />
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
