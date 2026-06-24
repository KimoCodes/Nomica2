import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import { getConversationsForUser } from "@/server/services/conversation.service";
import { MessagingApp } from "@/components/messaging/messaging-app";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default async function CoachMessagesPage() {
  const session = await requireRole([Role.COACH]);
  const conversations = await getConversationsForUser(session.user.id);

  return (
    <DashboardLayout
      title="Messages"
      navItems={[...COACH_NAV]}
      userName={session.user.name}
      userRole="Coach"
    >
      <MessagingApp
        currentUserId={session.user.id}
        initialConversations={conversations}
      />
    </DashboardLayout>
  );
}
