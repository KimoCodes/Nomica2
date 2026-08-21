import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function WorkoutDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3 rounded" />
        <Skeleton className="h-5 w-1/3 rounded" />
      </div>
      <SkeletonText lines={2} />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4">
            <Skeleton className="size-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
