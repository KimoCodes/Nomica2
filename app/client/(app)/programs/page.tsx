import Link from "next/link";
import Image from "next/image";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedCatalogProductIds } from "@/server/services/entitlement.service";
import { getProductImage } from "@/constants/coach-images";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Dumbbell } from "lucide-react";

const glassChip =
  "inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur-sm";

export default async function MyProgramsPage() {
  const session = await requireRole([Role.CLIENT]);
  const ownedIds = await getOwnedCatalogProductIds(session.user.id);
  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const products = ownedIds.length
    ? await prisma.product.findMany({
        where: { id: { in: ownedIds }, kind: { in: ["PROGRAM", "CHALLENGE"] } },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          program: {
            include: {
              weeks: { include: { days: { select: { id: true } } } },
              assignments: {
                where: { clientProfileId: client?.id ?? "" },
                select: { _count: { select: { completions: true } } },
              },
            },
          },
        },
      })
    : [];

  return (
    <DashboardLayout title="My Programs" navItems={[...CLIENT_NAV]} userName={session.user.name} userRole="Client">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Programs</h2>
          <p className="mt-1 text-muted-foreground">Your purchased programs and bundles, together in one place.</p>
        </div>

        {products.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const totalWorkouts = product.program?.weeks.reduce((sum, week) => sum + week.days.length, 0) ?? 0;
              const completed = product.program?.assignments.reduce((sum, assignment) => sum + assignment._count.completions, 0) ?? 0;
              const percent = totalWorkouts ? Math.min(100, Math.round((completed / totalWorkouts) * 100)) : 0;
              const cover = getProductImage(product);
              const started = percent > 0;
              const finished = totalWorkouts > 0 && percent >= 100;
              const statusLabel = finished ? "Completed" : started ? "In progress" : "Not started";
              const ctaLabel = finished ? "View Program" : started ? "Continue Program" : "Start Program";
              return (
                <Card key={product.id} className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {cover ? (
                      <Image
                        src={cover.src}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        alt={cover.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ objectPosition: cover.position }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Dumbbell className="size-8 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                    {totalWorkouts > 0 && (
                      <span className={cn(glassChip, "absolute left-3 top-3")}>
                        {finished && <CheckCircle2 className="size-3" />}
                        {statusLabel}
                      </span>
                    )}
                    {totalWorkouts > 0 && (
                      <span className={cn(glassChip, "absolute right-3 top-3")}>{percent}%</span>
                    )}
                  </div>
                  <CardContent className="flex h-full flex-col p-6">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.tagline ?? product.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" /> {product.durationLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Dumbbell className="size-3.5" /> {totalWorkouts} workouts
                      </span>
                    </div>
                    {totalWorkouts > 0 && (
                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                          <span>{completed} of {totalWorkouts} completed</span><span>{percent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted" aria-label={`${percent}% complete`}>
                          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )}
                    <Link href={`/client/programs/${product.slug}`} className={cn(buttonVariants(), "mt-6 w-full justify-between")}>
                      {ctaLabel} <ArrowRight className="size-4" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <BookOpen className="mb-4 size-10 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">Your library is ready when you are</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Explore every program and bundle, compare the details, and choose what fits your goals. Creating an account is free.
              </p>
              <Link href="/programs" className={cn(buttonVariants(), "mt-6")}>Explore Programs</Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
