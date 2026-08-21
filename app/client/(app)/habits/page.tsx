import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getHabits, getHabitStats } from "@/actions/habits.actions";
import { HabitsClient } from "@/components/habits-client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { CLIENT_NAV } from "@/constants/navigation";

export const metadata: Metadata = {
  title: "Habits | NOMICA",
};

export default async function HabitsPage() {
  const session = await requireAuth();
  const [habits, stats] = await Promise.all([getHabits(), getHabitStats()]);

  return (
    <DashboardLayout
      title="Habits"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole={session.user.role}
    >
      <HabitsClient habits={habits} stats={stats} />
    </DashboardLayout>
  );
}
