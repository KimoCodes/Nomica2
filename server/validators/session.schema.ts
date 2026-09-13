import { z } from "zod/v4";

export const createSessionSchema = z.object({
  clientProfileId: z.string().min(1, "Client is required"),
  coachProfileId: z.string().min(1, "Coach is required"),
  scheduledAt: z.string().datetime("Invalid date format"),
  durationMinutes: z.number().int().min(15).max(240).default(60),
  sessionType: z.enum(["CONSULTATION", "TRAINING", "ASSESSMENT", "FOLLOW_UP", "CUSTOM"]).default("CONSULTATION"),
  notes: z.string().max(1000).optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(200).optional(),
});

export const updateSessionSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "RESCHEDULE_REQUESTED", "RESCHEDULED", "CANCELLED", "COMPLETED", "MISSED"]).optional(),
  notes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
  rescheduleReason: z.string().max(500).optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(200).optional(),
  coachNotes: z.string().max(2000).optional(),
  sessionType: z.enum(["CONSULTATION", "TRAINING", "ASSESSMENT", "FOLLOW_UP", "CUSTOM"]).optional(),
  durationMinutes: z.number().int().min(15).max(240).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const cancelSessionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const rescheduleSessionSchema = z.object({
  newScheduledAt: z.string().datetime("Invalid date format"),
  reason: z.string().max(500).optional(),
});

export const sessionFilterSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "RESCHEDULE_REQUESTED", "RESCHEDULED", "CANCELLED", "COMPLETED", "MISSED"]).optional(),
  sessionType: z.enum(["CONSULTATION", "TRAINING", "ASSESSMENT", "FOLLOW_UP", "CUSTOM"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(200).default(20),
});
