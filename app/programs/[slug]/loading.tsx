import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function ProgramDetailLoading() {
  return (
    <div className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 rounded" />
          <Skeleton className="h-5 w-1/3 rounded" />
        </div>
        <SkeletonText lines={3} />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <SkeletonText lines={4} />
      </div>
    </div>
  );
}
