import { beforeEach, describe, expect, it, vi } from "vitest";

const { createNotificationMock, sendCoachApprovalEmailMock, prismaUserFindUniqueMock } = vi.hoisted(() => ({
  createNotificationMock: vi.fn(),
  sendCoachApprovalEmailMock: vi.fn(),
  prismaUserFindUniqueMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: prismaUserFindUniqueMock,
    },
    notification: {
      create: createNotificationMock,
    },
  },
}));

vi.mock("@/server/services/email.service", () => ({
  sendEmail: vi.fn(),
  sendCoachApprovalEmail: sendCoachApprovalEmailMock,
}));

describe("notifyCoachApproved", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a dedicated approval email to the coach and keeps the in-app notification", async () => {
    prismaUserFindUniqueMock.mockResolvedValue({
      email: "coach@example.com",
      name: "Coach User",
    });
    createNotificationMock.mockResolvedValue({ id: "n-1" });
    sendCoachApprovalEmailMock.mockResolvedValue({ sent: true });

    const { notifyCoachApproved } = await import("@/server/services/notification.service");

    await notifyCoachApproved("user-123");

    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-123",
          title: "Coach Account Approved",
          body: "Your coach account has been approved! You can now log in and start coaching.",
          link: "/coach",
        }),
      }),
    );
    expect(sendCoachApprovalEmailMock).toHaveBeenCalledWith("coach@example.com", "Coach User");
  });
});
