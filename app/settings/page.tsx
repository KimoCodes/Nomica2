import { Role } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { CLIENT_NAV, COACH_NAV, ADMIN_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar } from "lucide-react";

type NavItem = { label: string; href: string; icon: string };

const ROLE_NAV: Record<string, readonly NavItem[]> = {
  CLIENT: CLIENT_NAV,
  COACH: COACH_NAV,
  ADMIN: ADMIN_NAV,
};

const ROLE_LABELS: Record<string, string> = {
  CLIENT: "Client",
  COACH: "Coach",
  ADMIN: "Admin",
};

export default async function SettingsPage() {
  const session = await requireAuth();
  const role = session.user.role ?? Role.CLIENT;
  const navItems = ROLE_NAV[role] ?? CLIENT_NAV;

  return (
    <DashboardLayout
      title="Settings"
      navItems={[...navItems]}
      userName={session.user.name}
      userRole={ROLE_LABELS[role] ?? "User"}
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
          <p className="mt-1 text-muted-foreground">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                  {session.user.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-lg font-semibold">{session.user.name}</p>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center gap-3 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{session.user.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{session.user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="secondary" className="capitalize">
                    {role.toLowerCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calendar className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Member since</p>
                    <p className="text-xs text-muted-foreground">
                      Account active
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-dashed py-8 text-center">
                <p className="text-sm font-medium">More settings coming soon</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Password change, notification preferences, and data export will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
