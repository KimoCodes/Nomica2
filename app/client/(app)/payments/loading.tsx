import { Skeleton, SkeletonStatCard, SkeletonTable } from "@/components/ui/skeleton";

export default function ClientPaymentsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48 rounded" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      <SkeletonTable rows={5} columns={4} />
    </div>
  );
}
