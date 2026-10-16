import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedCatalogProductIds } from "@/server/services/entitlement.service";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, Dumbbell } from "lucide-react";

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
              return (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10">
                      <Dumbbell className="size-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.tagline ?? product.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span>{product.durationLabel}</span>
                      <span>{totalWorkouts} workouts</span>
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
                      Open Program <ArrowRight className="size-4" />
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
