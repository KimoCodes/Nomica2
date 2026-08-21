import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function ClientMediaLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48 rounded" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-56" />
        ))}
      </div>
    </div>
  );
}
