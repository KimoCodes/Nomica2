import { Role } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { CLIENT_NAV, COACH_NAV, ADMIN_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ProfileForm, PasswordForm } from "@/components/forms/settings-forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar, Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";

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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { createdAt: true },
  });

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
          {/* Profile */}
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
                {user?.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="font-medium">
                      {user.createdAt.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                name={session.user.name ?? ""}
                email={session.user.email ?? ""}
              />
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Bell className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive updates about your workouts, check-ins, and messages.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Notification preferences will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
