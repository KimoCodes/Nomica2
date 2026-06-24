import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import {
  DIFFICULTY_LABELS,
  MUSCLE_GROUP_LABELS,
} from "@/constants/exercises";
import { getExercisesForCoach } from "@/server/services/exercise.service";
import { CreateExerciseForm } from "@/components/forms/create-exercise-form";
import { ExerciseRowActions } from "@/components/forms/exercise-row-actions";
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
import { Dumbbell, Plus } from "lucide-react";

export default async function CoachExercisesPage() {
  const session = await requireRole([Role.COACH]);
  const exercises = await getExercisesForCoach(session.user.id);

  const systemCount = exercises.filter((e) => !e.coachId).length;
  const customCount = exercises.filter((e) => e.coachId).length;

  return (
    <DashboardLayout
      title="Exercise Library"
      navItems={[...COACH_NAV]}
      userName={session.user.name}
      userRole="Coach"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exercise Library</h2>
          <p className="mt-1 text-muted-foreground">
            Browse system exercises and create custom movements for your programs.
          </p>
        </div>

        <div className="flex gap-4">
          <Card className="animate-slide-up stagger-1 flex-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 icon-hover">
                  <Dumbbell className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{exercises.length}</p>
                  <p className="text-xs text-muted-foreground">Total Exercises</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-2 flex-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-chart-3/10 p-2 icon-hover">
                  <Dumbbell className="size-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemCount}</p>
                  <p className="text-xs text-muted-foreground">System</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up stagger-3 flex-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2 icon-hover">
                  <Plus className="size-4 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{customCount}</p>
                  <p className="text-xs text-muted-foreground">Custom</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">All Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exercises.map((exercise) => (
                    <TableRow
                      key={exercise.id}
                      className="transition-colors hover:bg-accent/30"
                    >
                      <TableCell className="font-medium">
                        {exercise.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {DIFFICULTY_LABELS[exercise.difficulty]}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={exercise.coachId ? "default" : "secondary"}
                        >
                          {exercise.coachId ? "Custom" : "System"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {exercise.coachId ? (
                          <ExerciseRowActions exercise={exercise} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Read-only
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Exercise</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateExerciseForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
