import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function CoachPaymentsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48 rounded" />
      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}
