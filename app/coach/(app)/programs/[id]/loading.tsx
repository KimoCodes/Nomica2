import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function CoachProgramDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-64 rounded" />
      <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
        <SkeletonTable rows={6} columns={5} />
      </div>
    </div>
  );
}
