import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { ensureClientConversationServer } from "@/actions/message.actions";
import { getConversationsForUser } from "@/server/services/conversation.service";
import { MessagingApp } from "@/components/messaging/messaging-app";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { FeatureGate } from "@/components/shared/feature-gate";

export default async function ClientMessagesPage() {
  const session = await requireRole([Role.CLIENT]);
  await ensureClientConversationServer();
  const conversations = await getConversationsForUser(session.user.id);

  return (
    <DashboardLayout
      title="Messages"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <FeatureGate userId={session.user.id} userRole={Role.CLIENT} feature="messaging">
        <MessagingApp
          currentUserId={session.user.id}
          initialConversations={conversations}
        />
      </FeatureGate>
    </DashboardLayout>
  );
}
