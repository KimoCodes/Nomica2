import { Dumbbell } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-4">
      <div className="relative w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary">
            <Dumbbell className="size-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">NoMica</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Onboarding" };
}
