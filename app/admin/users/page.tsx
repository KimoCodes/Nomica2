import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { ADMIN_NAV } from "@/constants/navigation";
import { getAdminUsers } from "@/server/services/admin.service";
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
import { Users, UserCheck, UserX } from "lucide-react";

const roleColors: Record<string, string> = {
  ADMIN: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  COACH: "bg-primary/10 text-primary border-primary/20",
  CLIENT: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

export default async function AdminUsersPage() {
  const session = await requireRole([Role.ADMIN]);
  const users = await getAdminUsers();

  const coachCount = users.filter((u) => u.role === "COACH").length;
  const clientCount = users.filter((u) => u.role === "CLIENT").length;

  return (
    <DashboardLayout
      title="Users"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name}
      userRole="Admin"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="mt-1 text-muted-foreground">
            Manage all registered users on the platform.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Coaches</p>
                  <p className="text-3xl font-bold">{coachCount}</p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <UserCheck className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Clients</p>
                  <p className="text-3xl font-bold">{clientCount}</p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5 icon-hover">
                  <UserX className="size-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slide-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">All Users</CardTitle>
            <Badge variant="secondary">{users.length}</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="transition-colors hover:bg-accent/30">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${roleColors[user.role] ?? ""}`}>
                        {user.role.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "COACH" ? (
                        <Badge variant={user.coachProfile?.approved ? "default" : "secondary"}>
                          {user.coachProfile?.approved ? "Approved" : "Pending"}
                        </Badge>
                      ) : user.subscription ? (
                        <Badge variant={user.subscription.status === "active" ? "default" : "secondary"}>
                          {user.subscription.status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {user.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
