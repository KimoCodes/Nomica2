import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <Skeleton className="h-6 w-32 rounded" />
        </div>
        <SkeletonCard className="p-8" />
      </div>
    </div>
  );
}
