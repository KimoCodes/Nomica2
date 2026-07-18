import { Skeleton, SkeletonCard, SkeletonStatCard } from "@/components/ui/skeleton";

type DashboardSkeletonProps = {
  statCards?: number;
  contentCards?: number;
  sidebarItems?: number;
};

export function DashboardSkeleton({
  statCards = 4,
  contentCards = 2,
  sidebarItems = 5,
}: DashboardSkeletonProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-[260px] flex-col border-r border-border/50 bg-card/50 md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border/50 px-5">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {Array.from({ length: sidebarItems }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 px-4 backdrop-blur-sm md:px-6">
          <Skeleton className="h-5 w-24 rounded" />
          <div className="flex items-center gap-3">
            <Skeleton className="hidden h-5 w-32 rounded md:block" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Skeleton className="h-8 w-48 rounded" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: statCards }).map((_, i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {Array.from({ length: contentCards }).map((_, i) => (
                <SkeletonCard
                  key={i}
                  className={i === 0 ? "lg:col-span-2" : ""}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
