import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasProductEntitlement } from "@/server/services/entitlement.service";
import { getProtectedProductProgram } from "@/server/services/product.service";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewPrompt } from "@/components/reviews/review-prompt";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function OwnedProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireRole([Role.CLIENT]);
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, kind: true, name: true },
  });
  if (!product || product.kind === "BUNDLE") notFound();

  if (!(await hasProductEntitlement(session.user.id, product.id))) {
    notFound();
  }

  const fullProduct = await getProtectedProductProgram(slug);
  if (!fullProduct?.program) notFound();

  const totalDays = fullProduct.program.weeks.reduce(
    (acc, week) => acc + week.days.length,
    0,
  );
  const clientProgram = await prisma.clientProgram.findFirst({
    where: {
      programId: fullProduct.program.id,
      clientProfile: { userId: session.user.id },
    },
    select: { id: true },
  });
  const completedDayRows = clientProgram
    ? await prisma.workoutCompletion.findMany({
      where: { clientProgramId: clientProgram.id },
      distinct: ["programDayId"],
      select: { programDayId: true },
    })
    : [];
  const completedDays = completedDayRows.length;

  return (
    <DashboardLayout title={fullProduct.name} navItems={[...CLIENT_NAV]} userName={session.user.name} userRole="Client">
      <div className="space-y-6">
        <Link href="/client/programs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> My Programs
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{fullProduct.name}</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">{fullProduct.description}</p>
        </div>
        {totalDays > 0 && (
          <ReviewPrompt
            productId={fullProduct.id}
            productName={fullProduct.name}
            completedDays={completedDays}
            totalDays={totalDays}
          />
        )}
        {fullProduct.program.weeks.map((week) => (
          <Card key={week.id}>
            <CardHeader><CardTitle>Week {week.weekNumber}{week.title ? ` · ${week.title}` : ""}</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {week.days.map((day) => (
                <section key={day.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold">{day.title ?? `Workout ${day.dayNumber}`}</h3>
                    <Link
                      href={`/client/workouts/${day.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Open workout <ArrowRight className="size-4" />
                    </Link>
                  </div>
                  <ul className="mt-3 space-y-3">
                    {day.exercises.map((entry) => (
                      <li key={entry.id} className="border-t pt-3 first:border-0 first:pt-0">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          <div>
                            <p className="font-medium">{entry.exercise.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.sets ? `${entry.sets} sets` : ""}{entry.reps ? ` · ${entry.reps} reps` : ""}{entry.restSeconds ? ` · ${entry.restSeconds}s rest` : ""}
                            </p>
                            {entry.notes && <p className="mt-1 text-sm">{entry.notes}</p>}
                            <p className="mt-1 text-sm text-muted-foreground">{entry.exercise.instructions}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
