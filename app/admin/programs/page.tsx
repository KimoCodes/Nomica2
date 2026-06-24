import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { ADMIN_NAV } from "@/constants/navigation";
import { getAdminPrograms } from "@/server/services/admin.service";
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
import { Package, DollarSign, ShoppingCart, FolderOpen } from "lucide-react";
import { ProgramActions } from "./program-actions";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function AdminProgramsPage() {
  const session = await requireRole([Role.ADMIN]);
  const programs = await getAdminPrograms();

  const sellableCount = programs.filter((p) => p.isSellable).length;
  const totalAssignments = programs.reduce(
    (sum, p) => sum + p.assignments.length,
    0,
  );
  const totalWeeks = programs.reduce((sum, p) => sum + p.weeks.length, 0);
  const totalDays = programs.reduce(
    (sum, p) => sum + p.weeks.reduce((ws, w) => ws + w.days.length, 0),
    0,
  );

  return (
    <DashboardLayout
      title="Programs"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Programs Manager</h2>
          <p className="mt-1 text-muted-foreground">
            Manage all programs and configure sellable listings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Programs</p>
                  <p className="text-3xl font-bold">{programs.length}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
                  <Package className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Sellable</p>
                  <p className="text-3xl font-bold">{sellableCount}</p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <ShoppingCart className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Weeks</p>
                  <p className="text-3xl font-bold">{totalWeeks}</p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5 icon-hover">
                  <FolderOpen className="size-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-4 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Assignments</p>
                  <p className="text-3xl font-bold">{totalAssignments}</p>
                </div>
                <div className="rounded-xl bg-warning/10 p-2.5 icon-hover">
                  <DollarSign className="size-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slide-up stagger-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">All Programs</CardTitle>
            <Badge variant="secondary">{programs.length}</Badge>
          </CardHeader>
          <CardContent>
            {programs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <Package className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No programs yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Programs created by coaches will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Structure</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id} className="transition-colors hover:bg-accent/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{program.title}</p>
                          {program.description && (
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {program.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {program.coach.user.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{program.weeks.length} weeks</span>
                          <span>/</span>
                          <span>{totalDays} days</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {program.isSellable && program.price != null ? (
                          <Badge variant="outline" className="gap-1 font-mono">
                            <DollarSign className="size-3" />
                            {currencyFormatter.format(program.price / 100)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {program.isSellable ? (
                          <Badge className="bg-success/10 text-success border-success/20">
                            Listed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Internal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ProgramActions
                          program={{
                            id: program.id,
                            title: program.title,
                            description: program.description,
                            isSellable: program.isSellable,
                            price: program.price,
                            imageUrl: program.imageUrl,
                            features: program.features,
                            difficulty: program.difficulty,
                            duration: program.duration,
                          }}
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
