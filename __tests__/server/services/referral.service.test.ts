import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildReferralLink,
  getOrCreateReferralCode,
  getReferralStats,
  resolveReferralCode,
} from "@/server/services/referral.service";

const { userFindUniqueMock, userUpdateMock, userFindManyMock } = vi.hoisted(() => ({
  userFindUniqueMock: vi.fn(),
  userUpdateMock: vi.fn(),
  userFindManyMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
      update: userUpdateMock,
      findMany: userFindManyMock,
    },
  },
}));

vi.mock("@/lib/resend", () => ({
  getAppUrl: () => "http://localhost:3000",
}));

describe("referral.service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    userFindUniqueMock.mockResolvedValue(null);
    userUpdateMock.mockResolvedValue({});
    userFindManyMock.mockResolvedValue([]);
    vi.spyOn(Math, "random").mockReturnValue(0.1);
  });

  it("returns existing code without creating a new one", async () => {
    userFindUniqueMock.mockResolvedValue({ referralCode: "EXISTING1" });

    const result = await getOrCreateReferralCode("user-1");

    expect(result).toEqual({
      success: true,
      referralCode: "EXISTING1",
      referralLink: "http://localhost:3000?ref=EXISTING1",
    });
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("creates a code when the user has none", async () => {
    userFindUniqueMock
      .mockResolvedValueOnce({ referralCode: null })
      .mockResolvedValueOnce(null);
    userUpdateMock.mockResolvedValue({});

    const result = await getOrCreateReferralCode("user-1");

    expect(result.success).toBe(true);
    expect(result.referralCode).toHaveLength(8);
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { referralCode: result.referralCode },
    });
  });

  it("resolves a valid code to the referrer id", async () => {
    userFindUniqueMock.mockResolvedValue({ id: "referrer-9" });

    const result = await resolveReferralCode("abc12345");

    expect(result).toEqual({ valid: true, referredBy: "referrer-9" });
    expect(userFindUniqueMock).toHaveBeenCalledWith({
      where: { referralCode: "ABC12345" },
      select: { id: true },
    });
  });

  it("rejects invalid or oversized codes", async () => {
    expect((await resolveReferralCode("")).valid).toBe(false);
    expect((await resolveReferralCode("X".repeat(20))).valid).toBe(false);

    userFindUniqueMock.mockResolvedValue(null);
    expect((await resolveReferralCode("NOPE9999")).valid).toBe(false);
  });

  it("counts completed referrals only when a paid order exists", async () => {
    userFindManyMock.mockResolvedValue([
      { id: "a", _count: { orders: 1 } },
      { id: "b", _count: { orders: 0 } },
      { id: "c", _count: { orders: 2 } },
    ]);

    const stats = await getReferralStats("user-1");

    expect(stats).toEqual({
      totalReferrals: 3,
      completedReferrals: 2,
      pendingReferrals: 1,
    });
  });

  it("builds a shareable link", () => {
    expect(buildReferralLink("CODE1234")).toBe("http://localhost:3000?ref=CODE1234");
  });
});
