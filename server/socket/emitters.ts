import { getSocketServer } from "./server";
import { SOCKET_EVENTS } from "@/types/socket";
import type { PrAchievedPayload, CoachAlertPayload } from "@/types/socket";
import logger from "@/lib/logger";

export function emitPrAchieved(userId: string, records: PrAchievedPayload["records"]) {
  const io = getSocketServer();
  if (!io) return;

  const payload: PrAchievedPayload = { userId, records };
  io.to(`user:${userId}`).emit(SOCKET_EVENTS.PR_ACHIEVED, payload);
  logger.info({ userId, count: records.length }, "emitted PR event");
}

export function emitCoachAlert(coachId: string, alerts: CoachAlertPayload["alerts"]) {
  const io = getSocketServer();
  if (!io) return;

  if (alerts.length === 0) return;

  const payload: CoachAlertPayload = { coachId, alerts };
  io.to(`user:${coachId}`).emit(SOCKET_EVENTS.COACH_ALERT, payload);
  logger.info({ coachId, count: alerts.length }, "emitted coach alert event");
}
