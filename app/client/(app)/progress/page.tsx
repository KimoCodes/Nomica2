import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { getClientProgressOverview } from "@/server/services/progress.service";
import { getClientProgress } from "@/server/services/media.service";
import { requireClientProfile } from "@/server/services/coach.service";
import { ProgressLogForm } from "@/components/forms/progress-log-form";
import { ProgressUploadForm } from "./progress-upload-form";
import { ProgressTimeline } from "./progress-timeline";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Minus, Ruler, Weight, Camera, Upload } from "lucide-react";

export default async function ClientProgressPage() {
  const session = await requireRole([Role.CLIENT]);
  const [overview, clientProfile] = await Promise.all([
    getClientProgressOverview(session.user.id),
    requireClientProfile(session.user.id),
  ]);

  const progressData = await getClientProgress(clientProfile.id, { limit: 20 });

  const weightChange =
    overview.latest?.weight && overview.previous?.weight
      ? overview.latest.weight - overview.previous.weight
      : null;

  return (
    <DashboardLayout
      title="Progress"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress Tracking</h2>
          <p className="mt-1 text-muted-foreground">
            Log measurements and track your fitness journey over time.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Current Weight</p>
                  <p className="text-2xl font-bold">
                    {overview.latest?.weight ? `${overview.latest.weight} kg` : "--"}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
                  <Weight className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Weight Change</p>
                  <p className="text-2xl font-bold">
                    {weightChange !== null ? (
                      <span className={weightChange > 0 ? "text-chart-5" : weightChange < 0 ? "text-success" : ""}>
                        {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
                      </span>
                    ) : "--"}
                  </p>
                </div>
                <div className="rounded-xl bg-chart-3/10 p-2.5">
                  {weightChange !== null ? (
                    weightChange > 0 ? <TrendingUp className="size-5 text-chart-5" /> :
                    weightChange < 0 ? <TrendingDown className="size-5 text-success" /> :
                    <Minus className="size-5 text-muted-foreground" />
                  ) : (
                    <TrendingUp className="size-5 text-chart-3" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Body Fat</p>
                  <p className="text-2xl font-bold">
                    {overview.latest?.bodyFat ? `${overview.latest.bodyFat}%` : "--"}
                  </p>
                </div>
                <div className="rounded-xl bg-warning/10 p-2.5 icon-hover">
                  <Ruler className="size-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up stagger-4 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                  <p className="text-2xl font-bold">{overview.logs.length}</p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
                  <TrendingUp className="size-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList>
            <TabsTrigger value="timeline" className="gap-2">
              <Camera className="size-4" />
              Transformation Timeline
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="size-4" />
              Upload Progress
            </TabsTrigger>
            <TabsTrigger value="log" className="gap-2">
              <Ruler className="size-4" />
              Quick Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transformation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTimeline logs={progressData.logs as unknown as React.ComponentProps<typeof ProgressTimeline>["logs"]} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload Progress Photos & Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressUploadForm clientProfileId={clientProfile.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Measurement Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressLogForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
