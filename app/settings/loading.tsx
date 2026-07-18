import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 animate-fade-in">
      <Skeleton className="h-8 w-48 rounded" />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
