import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Dumbbell } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center animate-fade-in">
        <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10 shadow-premium animate-scale-in">
          <Dumbbell className="size-10 text-primary" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className={`${buttonVariants({ className: "mt-8 group" })}`}>
          <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
