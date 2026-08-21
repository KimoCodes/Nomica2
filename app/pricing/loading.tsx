import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <div className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <Skeleton className="mx-auto h-10 w-64 rounded" />
          <Skeleton className="mx-auto h-5 w-96 rounded" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="h-80" />
          ))}
        </div>
      </div>
    </div>
  );
}
