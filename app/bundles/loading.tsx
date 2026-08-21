import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function BundlesLoading() {
  return (
    <div className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <Skeleton className="h-10 w-48 rounded" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="h-72" />
          ))}
        </div>
      </div>
    </div>
  );
}
