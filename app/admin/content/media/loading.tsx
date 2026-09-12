import { Skeleton } from "@/components/ui/skeleton";

export default function MediaLibraryLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 rounded" />
      <Skeleton className="h-4 w-96 rounded" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card">
            <Skeleton className="h-40 w-full rounded-none rounded-t-xl" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="mt-2 h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
