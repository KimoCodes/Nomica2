import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ClientAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole([Role.CLIENT]);

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingComplete: true },
  });

  if (!profile?.onboardingComplete) {
    redirect("/onboarding");
  }

  return children;
}
