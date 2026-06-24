import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getClientProfile } from "@/server/services/onboarding.service";

export default async function ClientAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole([Role.CLIENT]);
  const profile = await getClientProfile(session.user.id);

  if (!profile?.onboardingComplete) {
    redirect("/onboarding");
  }

  return children;
}
