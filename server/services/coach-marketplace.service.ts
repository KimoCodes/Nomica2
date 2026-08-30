import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export type CoachListing = {
  id: string;
  name: string;
  avatar: string | null;
  specialties: string[];
  certification: string | null;
  yearsExperience: number | null;
  bio: string | null;
  rating: number;
  reviewCount: number;
  clientCount: number;
};

export type CoachBooking = {
  id: string;
  coachId: string;
  coachName: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  notes: string | null;
};

export async function getAvailableCoaches(
  specialty?: string,
): Promise<CoachListing[]> {
  const where: Record<string, unknown> = {
    approved: true,
  };

  if (specialty) {
    where.specialties = { has: specialty };
  }

  const coaches = await prisma.coachProfile.findMany({
    where,
    include: {
      user: { select: { name: true, avatar: true } },
      programs: {
        select: {
          assignments: { select: { id: true } },
        },
      },
    },
    orderBy: { yearsExperience: "desc" },
  });

  return coaches.map((coach) => {
    const clientCount = coach.programs?.reduce(
      (sum: number, p: { assignments: { id: string }[] }) => sum + (p.assignments?.length ?? 0),
      0,
    ) ?? 0;

    return {
      id: coach.id,
      name: coach.user.name,
      avatar: coach.user.avatar,
      specialties: coach.specialties ?? [],
      certification: coach.certification,
      yearsExperience: coach.yearsExperience,
      bio: coach.bio,
      rating: 0,
      reviewCount: 0,
      clientCount,
    };
  });
}

export async function getCoachById(
  coachId: string,
): Promise<CoachListing | null> {
  const coach = await prisma.coachProfile.findUnique({
    where: { id: coachId },
    include: {
      user: { select: { name: true, avatar: true } },
      programs: {
        select: {
          assignments: { select: { id: true } },
        },
      },
    },
  });

  if (!coach) return null;

  const clientCount = coach.programs?.reduce(
    (sum: number, p: { assignments: { id: string }[] }) => sum + (p.assignments?.length ?? 0),
    0,
  ) ?? 0;

  return {
    id: coach.id,
    name: coach.user.name,
    avatar: coach.user.avatar,
    specialties: coach.specialties ?? [],
    certification: coach.certification,
    yearsExperience: coach.yearsExperience,
    bio: coach.bio,
    rating: 0,
    reviewCount: 0,
    clientCount,
  };
}

export async function bookCoach(
  clientId: string,
  coachId: string,
  scheduledAt: Date,
  durationMinutes: number,
  notes?: string,
): Promise<CoachBooking> {
  const client = await prisma.clientProfile.findUnique({
    where: { userId: clientId },
    select: { id: true },
  });

  if (!client) {
    throw new Error("Client profile not found");
  }

  const booking = await prisma.coachBooking.create({
    data: {
      clientProfileId: client.id,
      coachProfileId: coachId,
      scheduledAt,
      durationMinutes,
      notes: notes || null,
    },
    include: {
      coachProfile: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  return {
    id: booking.id,
    coachId: booking.coachProfileId,
    coachName: booking.coachProfile.user.name,
    scheduledAt: booking.scheduledAt,
    durationMinutes: booking.durationMinutes,
    status: booking.status,
    notes: booking.notes,
  };
}

export async function getClientBookings(
  clientId: string,
): Promise<CoachBooking[]> {
  const client = await prisma.clientProfile.findUnique({
    where: { userId: clientId },
    select: { id: true },
  });

  if (!client) return [];

  const bookings = await prisma.coachBooking.findMany({
    where: { clientProfileId: client.id },
    orderBy: { scheduledAt: "desc" },
    include: {
      coachProfile: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  return bookings.map((b) => ({
    id: b.id,
    coachId: b.coachProfileId,
    coachName: b.coachProfile.user.name,
    scheduledAt: b.scheduledAt,
    durationMinutes: b.durationMinutes,
    status: b.status,
    notes: b.notes,
  }));
}
