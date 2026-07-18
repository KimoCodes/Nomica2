import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-6 w-64 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>
    </div>
  );
}
