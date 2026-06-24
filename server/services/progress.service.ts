import { prisma } from "@/lib/prisma";
import { requireClientProfile } from "@/server/services/coach.service";
import type { CreateProgressLogInput } from "@/server/validators/progress.schema";

export async function createProgressLog(
  clientUserId: string,
  input: CreateProgressLogInput,
) {
  const client = await requireClientProfile(clientUserId);

  return prisma.progressLog.create({
    data: {
      clientProfileId: client.id,
      weight: input.weight ?? null,
      bodyFat: input.bodyFat ?? null,
      waist: input.waist ?? null,
      chest: input.chest ?? null,
      hips: input.hips ?? null,
      notes: input.notes || null,
    },
  });
}

export async function getClientProgressOverview(clientUserId: string) {
  const client = await requireClientProfile(clientUserId);

  const logs = await prisma.progressLog.findMany({
    where: { clientProfileId: client.id },
    orderBy: { loggedAt: "desc" },
    take: 20,
  });

  const chronologicalLogs = [...logs].reverse();
  const latest = logs[0] ?? null;
  const previous = logs[1] ?? null;

  return {
    latest,
    previous,
    logs,
    weightTrend: chronologicalLogs
      .filter((log) => log.weight !== null)
      .map((log) => ({
        id: log.id,
        label: log.loggedAt.toLocaleDateString(),
        value: log.weight!,
      })),
  };
}
