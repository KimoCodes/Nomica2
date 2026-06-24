import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import { CreateProgramForm } from "@/components/forms/create-program-form";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

export default async function NewProgramPage() {
  await requireRole([Role.COACH]);

  return (
    <DashboardLayout title="New Program" navItems={[...COACH_NAV]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Program</h2>
          <p className="mt-1 text-muted-foreground">
            Create a new training program template for your clients.
          </p>
        </div>

        <Card className="max-w-2xl border-border/50 shadow-premium">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <FolderOpen className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Program Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Start with a title and description. You can add weeks, days, and exercises after.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CreateProgramForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
