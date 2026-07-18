import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function AdminCoachesLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48 rounded" />
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <SkeletonTable rows={6} columns={4} />
      </div>
    </div>
  );
}
