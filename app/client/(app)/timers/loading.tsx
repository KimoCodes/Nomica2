import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function TimersLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-32 rounded" />
      <SkeletonCard className="h-96" />
    </div>
  );
}
