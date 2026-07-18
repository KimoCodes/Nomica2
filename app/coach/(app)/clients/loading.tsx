import { Skeleton, SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";

export default function CoachClientsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48 rounded" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-6">
          <SkeletonTable rows={5} columns={4} />
        </div>
        <SkeletonCard />
      </div>
    </div>
  );
}
