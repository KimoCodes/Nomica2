import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CoachProfile } from "@prisma/client";
import { completeCoachOnboarding } from "@/server/services/onboarding.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    coachProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("completeCoachOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a coach profile when one does not already exist", async () => {
    const profile = {
      userId: "user-123",
      bio: null,
      specialties: [],
      yearsExperience: null,
      certification: null,
      onboardingComplete: false,
      user: { name: "Jane Coach", email: "jane@example.com" },
    };

    vi.mocked(prisma.coachProfile.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.coachProfile.create).mockResolvedValue(
      profile as unknown as CoachProfile,
    );
    vi.mocked(prisma.coachProfile.update).mockResolvedValue({
      ...profile,
      bio: "Experienced trainer",
      specialties: ["strength"],
      yearsExperience: 4,
      certification: "NASM",
      onboardingComplete: true,
    } as unknown as CoachProfile);

    await expect(
      completeCoachOnboarding("user-123", {
        bio: "Experienced trainer",
        specialties: ["strength"],
        yearsExperience: 4,
        certification: "NASM",
      }),
    ).resolves.toMatchObject({
      bio: "Experienced trainer",
      specialties: ["strength"],
      onboardingComplete: true,
    });

    expect(prisma.coachProfile.create).toHaveBeenCalledWith({
      data: {
        userId: "user-123",
        specialties: [],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  });
});
