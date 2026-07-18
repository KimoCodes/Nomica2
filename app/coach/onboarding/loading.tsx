import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function CoachOnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg space-y-6">
        <Skeleton className="h-8 w-64 rounded mx-auto" />
        <SkeletonCard className="p-8" />
      </div>
    </div>
  );
}
