import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getGoals } from "@/actions/goals.actions";
import { GoalsClient } from "@/components/goals-client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { CLIENT_NAV } from "@/constants/navigation";

export const metadata: Metadata = {
  title: "Goals | NOMICA",
};

export default async function GoalsPage() {
  const session = await requireAuth();
  const goals = await getGoals();

  return (
    <DashboardLayout
      title="Goals"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole={session.user.role}
    >
      <GoalsClient goals={goals} />
    </DashboardLayout>
  );
}
