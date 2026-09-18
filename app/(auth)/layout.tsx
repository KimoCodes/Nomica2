import Image from "next/image";

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
              <Image
                src="/logo2.png"
                alt="NomiTips"
                width={220}
                height={80}
                priority
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Personal coaching{" "}
              <span className="text-gradient">that fits your life</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect with expert coaches, follow personalized programs, and
              achieve your fitness goals.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Science-backed progressive overload programs
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Video-guided workouts with form demos
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Real coach feedback and support
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:w-[480px]">
        <div className="mb-8 flex items-center justify-center lg:hidden">
          <Image
            src="/logo2.png"
            alt="NomiTips"
            width={180}
            height={64}
            className="h-12 w-auto"
          />
        </div>

        {children}
      </div>
    </div>
  );
}
