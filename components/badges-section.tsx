import { getAllBadges, checkUnlockedBadges, getPointsForNextBadge } from "@/server/services/fitness-engine/gamification";
import { prisma } from "@/lib/prisma";
import { BadgesDisplay } from "@/components/badges-display";

export async function BadgesSection({ userId }: { userId: string }) {
  try {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!clientProfile) return null;

    const workoutCompletions = await prisma.workoutCompletion.count({
      where: { clientProfileId: clientProfile.id },
    });

    const checkIns = await prisma.checkIn.count({
      where: { clientProfileId: clientProfile.id },
    });

    const allBadges = getAllBadges();
    const unlocked = checkUnlockedBadges({
      workoutsCompleted: workoutCompletions,
      currentStreak: 0,
      checkInsCompleted: checkIns,
      referralsCompleted: 0,
      prsSet: 0,
      joinDate: new Date(),
    });

    const totalPoints = unlocked.reduce((sum, b) => sum + (b.unlockedAt ? 100 : 0), 0);
    const nextBadgeData = getPointsForNextBadge({
      workoutsCompleted: workoutCompletions,
      currentStreak: 0,
      checkInsCompleted: checkIns,
      referralsCompleted: 0,
      prsSet: 0,
    });

    const nextBadge = nextBadgeData ? {
      name: nextBadgeData.nextBadge.name,
      current: nextBadgeData.current,
      needed: nextBadgeData.needed,
    } : null;

    return (
      <BadgesDisplay
        badges={unlocked}
        totalPoints={totalPoints}
        nextBadge={nextBadge}
      />
    );
  } catch {
    return null;
  }
}
