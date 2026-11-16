import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasProductEntitlement } from "@/server/services/entitlement.service";
import { getProtectedProductProgram } from "@/server/services/product.service";
import { getProductImage } from "@/constants/coach-images";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewPrompt } from "@/components/reviews/review-prompt";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Dumbbell,
} from "lucide-react";

const glassChip =
  "inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur-sm";

function formatPrescription(entry: {
  sets: number | null;
  reps: number | null;
  duration: number | null;
  restSeconds: number | null;
}) {
  return [
    entry.sets ? `${entry.sets} sets` : null,
    entry.reps ? `${entry.reps} reps` : null,
    entry.duration ? `${entry.duration}s` : null,
    entry.restSeconds ? `${entry.restSeconds}s rest` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

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
  const completedIds = new Set(completedDayRows.map((row) => row.programDayId));
  const completedDays = completedIds.size;
  const weeks = fullProduct.program.weeks;
  const allDays = weeks.flatMap((week) => week.days);
  const nextDay = allDays.find((day) => !completedIds.has(day.id)) ?? null;
  const percent = totalDays
    ? Math.min(100, Math.round((completedDays / totalDays) * 100))
    : 0;
  const cover = getProductImage(fullProduct);
  const kindLabel = fullProduct.kind === "CHALLENGE" ? "Challenge" : "Program";
  const descriptionParagraphs = (fullProduct.description ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <DashboardLayout title={fullProduct.name} navItems={[...CLIENT_NAV]} userName={session.user.name} userRole="Client">
      <div className="space-y-6">
        <Link href="/client/programs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> My Programs
        </Link>

        <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-border/50 bg-muted sm:aspect-[16/7] sm:min-h-0">
          {cover ? (
            <Image
              src={cover.src}
              sizes="(max-width: 768px) 100vw, 900px"
              alt={cover.alt}
              fill
              priority
              className="object-cover"
              style={{ objectPosition: cover.position }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Dumbbell className="size-12 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 pb-7 sm:flex-row sm:items-end sm:justify-between sm:p-7 sm:pb-9">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className={glassChip}>{kindLabel}</span>
                <span className={glassChip}>
                  <Clock className="size-3" />
                  {fullProduct.durationLabel}
                </span>
                <span className={cn(glassChip, "hidden sm:inline-flex")}>
                  <CalendarDays className="size-3" />
                  {weeks.length} week{weeks.length === 1 ? "" : "s"}
                </span>
                <span className={cn(glassChip, "hidden sm:inline-flex")}>
                  <Dumbbell className="size-3" />
                  {totalDays} workout{totalDays === 1 ? "" : "s"}
                </span>
                {totalDays > 0 && (
                  <span className={glassChip}>
                    {completedDays} of {totalDays} done
                  </span>
                )}
                {totalDays > 0 && percent === 100 && (
                  <span className={glassChip}>
                    <CheckCircle2 className="size-3" />
                    Completed
                  </span>
                )}
              </div>
              <h2 className="mt-3 line-clamp-2 text-xl font-bold tracking-tight text-white drop-shadow-lg sm:text-2xl lg:text-3xl">
                {fullProduct.name}
              </h2>
              {fullProduct.tagline && (
                <p className="mt-1.5 hidden max-w-2xl line-clamp-2 text-sm text-white/75 drop-shadow sm:block">
                  {fullProduct.tagline}
                </p>
              )}
            </div>
            {totalDays > 0 &&
              (nextDay ? (
                <Link
                  href={`/client/workouts/${nextDay.id}`}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto"
                >
                  {completedDays > 0 ? "Continue" : "Start"} <ArrowRight className="size-4" />
                </Link>
              ) : (
                <span className={cn(glassChip, "w-full justify-center px-4 py-2.5 sm:w-auto")}>
                  <CheckCircle2 className="size-3.5" />
                  All workouts completed
                </span>
              ))}
          </div>
          {totalDays > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/15" aria-hidden="true">
              <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
          )}
        </div>

        {totalDays > 0 && (
          <ReviewPrompt
            productId={fullProduct.id}
            productName={fullProduct.name}
            completedDays={completedDays}
            totalDays={totalDays}
          />
        )}

        {(descriptionParagraphs.length > 0 ||
          fullProduct.features.length > 0 ||
          fullProduct.equipment.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>About this {kindLabel.toLowerCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {descriptionParagraphs.length > 0 && (
                <div className="max-w-3xl space-y-3 text-sm leading-6 text-muted-foreground">
                  {descriptionParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              )}
              {fullProduct.features.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Program highlights
                  </p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {fullProduct.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {fullProduct.equipment.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Equipment needed
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {fullProduct.equipment.map((item) => (
                      <Badge key={item} variant="outline" className="px-2.5 py-1 text-xs font-medium">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {weeks.map((week) => {
          const weekTotal = week.days.length;
          const weekDone = week.days.filter((day) => completedIds.has(day.id)).length;
          const weekComplete = weekTotal > 0 && weekDone === weekTotal;
          return (
            <Card key={week.id}>
              <CardHeader>
                <CardTitle>
                  Week {week.weekNumber}
                  {week.title ? ` · ${week.title}` : ""}
                </CardTitle>
                <CardAction>
                  <Badge
                    variant={weekComplete ? "default" : "secondary"}
                    className={cn(
                      "tabular-nums",
                      weekComplete && "bg-green-500/15 text-green-600 ring-1 ring-green-500/30",
                    )}
                  >
                    {weekComplete ? (
                      <>
                        <CheckCircle2 className="size-3" /> Completed
                      </>
                    ) : (
                      `${weekDone}/${weekTotal} days`
                    )}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                {week.days.map((day) => {
                  const done = completedIds.has(day.id);
                  return (
                    <div
                      key={day.id}
                      className={cn(
                        "rounded-xl border p-4",
                        done ? "border-green-500/30 bg-green-500/5" : "border-border/60 bg-muted/20",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {done ? (
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-green-500/15">
                              <CheckCircle2 className="size-4 text-green-600" />
                            </span>
                          ) : (
                            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border/60 bg-background text-xs font-semibold tabular-nums text-muted-foreground">
                              {day.dayNumber}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {day.title ?? `Workout ${day.dayNumber}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {day.exercises.length} exercise{day.exercises.length === 1 ? "" : "s"}
                              {done ? " · Completed" : ""}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/client/workouts/${day.id}`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          {done ? "View workout" : "Open workout"} <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                      {day.exercises.length > 0 && (
                        <details className="group mt-3" open={!done && day.id === nextDay?.id}>
                          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
                            Exercise plan
                          </summary>
                          <ul className="mt-3 space-y-2">
                            {day.exercises.map((entry) => (
                              <li
                                key={entry.id}
                                className="rounded-lg border border-border/50 bg-background/60 p-3"
                              >
                                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                  <p className="text-sm font-medium">{entry.exercise.name}</p>
                                  {formatPrescription(entry) && (
                                    <p className="text-xs tabular-nums text-muted-foreground">
                                      {formatPrescription(entry)}
                                    </p>
                                  )}
                                </div>
                                {entry.notes && (
                                  <p className="mt-1 text-xs text-muted-foreground">{entry.notes}</p>
                                )}
                                {entry.exercise.instructions && (
                                  <details className="group/inst mt-2">
                                    <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-primary hover:underline [&::-webkit-details-marker]:hidden">
                                      How to do it
                                      <ChevronDown className="size-3 transition-transform group-open/inst:rotate-180" />
                                    </summary>
                                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                                      {entry.exercise.instructions}
                                    </p>
                                  </details>
                                )}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
