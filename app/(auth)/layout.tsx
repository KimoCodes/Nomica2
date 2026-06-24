import { Dumbbell } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/5 lg:flex">
        <div className="relative max-w-md px-8">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
          <div className="relative space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary">
                <Dumbbell className="size-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">NoMica</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Personal coaching{" "}
              <span className="text-gradient">that fits your life</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect with expert coaches, follow personalized programs, and
              achieve your fitness goals.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold">500+</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold">50+</p>
                <p className="text-xs text-muted-foreground">Coaches</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:w-[480px]">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
            <Dumbbell className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">NoMica</span>
        </div>

        {children}
      </div>
    </div>
  );
}
