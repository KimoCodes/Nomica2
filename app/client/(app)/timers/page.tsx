import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { TimerClient } from "@/components/timers/workout-timers-client";

export default async function TimerPage() {
  const session = await requireRole([Role.CLIENT]);

  return <TimerClient userName={session.user.name} />;
}
