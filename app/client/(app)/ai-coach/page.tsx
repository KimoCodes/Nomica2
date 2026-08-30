import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AiCoachChat } from "@/components/ai-coach-chat";

export default async function AiCoachPage() {
  const session = await requireRole([Role.CLIENT]);

  return (
    <DashboardLayout
      title="AI Coach"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <AiCoachChat />
    </DashboardLayout>
  );
}
