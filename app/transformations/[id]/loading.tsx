import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function TransformationLoading() {
  return (
    <div className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 rounded" />
          <Skeleton className="h-5 w-1/4 rounded" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
        <SkeletonText lines={5} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
