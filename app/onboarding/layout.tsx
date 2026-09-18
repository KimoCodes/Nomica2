import Image from "next/image";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-4">
      <div className="relative w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/logo2.png"
            alt="NomiTips"
            width={220}
            height={80}
            priority
            className="h-14 w-auto"
          />
        </div>
        {children}
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Onboarding" };
}
