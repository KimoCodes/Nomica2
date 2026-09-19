import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerUser } from "@/actions/auth.actions";

const {
  createUserMock,
  sendVerificationEmailMock,
  sendAdminNewUserNotificationMock,
  checkRateLimitMock,
} = vi.hoisted(() => ({
  createUserMock: vi.fn(),
  sendVerificationEmailMock: vi.fn(),
  sendAdminNewUserNotificationMock: vi.fn(),
  checkRateLimitMock: vi.fn(() => ({ allowed: true })),
}));

vi.mock("@/lib/auth", () => ({
  signOut: vi.fn(async () => undefined),
}));

vi.mock("@/server/services/user.service", () => ({
  createUser: createUserMock,
  createVerificationToken: vi.fn(async () => ({ token: "token-123" })),
  verifyEmailToken: vi.fn(),
  createPasswordResetToken: vi.fn(),
  verifyPasswordResetToken: vi.fn(),
  resetUserPassword: vi.fn(),
  getUserByEmail: vi.fn(),
}));

vi.mock("@/server/services/email.service", () => ({
  sendVerificationEmail: sendVerificationEmailMock,
  sendPasswordResetEmail: vi.fn(),
  sendAdminNewUserNotification: sendAdminNewUserNotificationMock,
}));

vi.mock("@/server/utils/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
}));

vi.mock("@/server/services/analytics.service", () => ({
  logActivity: vi.fn(async () => undefined),
}));

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createUserMock.mockResolvedValue({
      id: "user-123",
      name: "Jane Coach",
      email: "jane@example.com",
      role: "COACH",
    });
    sendVerificationEmailMock.mockResolvedValue({ sent: true });
  });

  it("preserves the selected role from the registration form", async () => {
    const formData = new FormData();
    formData.set("name", "Jane Coach");
    formData.set("email", "jane@example.com");
    formData.set("password", "StrongPass1");
    formData.set("role", "COACH");

    const result = await registerUser(formData);

    expect(result.success).toBe(true);
    expect(createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane Coach",
        email: "jane@example.com",
        role: "COACH",
      }),
    );
    expect(sendAdminNewUserNotificationMock).toHaveBeenCalledWith({
      name: "Jane Coach",
      email: "jane@example.com",
      role: "COACH",
    });
  });
});
