import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveClientOnboardingStepAction, submitCoachOnboarding } from "@/actions/onboarding.actions";

const { requireRoleMock, saveClientOnboardingStepMock, completeCoachOnboardingMock, sendWelcomeEmailMock } = vi.hoisted(() => ({
  requireRoleMock: vi.fn(),
  saveClientOnboardingStepMock: vi.fn(),
  completeCoachOnboardingMock: vi.fn(),
  sendWelcomeEmailMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireRole: requireRoleMock,
}));

vi.mock("@/server/services/onboarding.service", () => ({
  completeCoachOnboarding: completeCoachOnboardingMock,
  getClientOnboardingState: vi.fn(),
  saveClientOnboardingStep: saveClientOnboardingStepMock,
}));

vi.mock("@/server/services/email.service", () => ({
  sendWelcomeEmail: sendWelcomeEmailMock,
}));

describe("onboarding actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRoleMock.mockResolvedValue({ user: { id: "user-123", email: "user@example.com", name: "User" } });
  });

  it("returns immediately on final client onboarding step even if welcome email hangs", async () => {
    const formData = new FormData();
    formData.set("equipment", "DUMBBELLS");
    saveClientOnboardingStepMock.mockResolvedValue(undefined);
    sendWelcomeEmailMock.mockImplementation(() => new Promise(() => {}));

    const result = await saveClientOnboardingStepAction(4, formData);

    expect(result.success).toBe(true);
    expect(result.data?.redirectTo).toBe("/client");
    expect(sendWelcomeEmailMock).toHaveBeenCalledWith("user@example.com", "User", "client");
  });

  it("returns immediately on final coach onboarding step even if welcome email hangs", async () => {
    const formData = new FormData();
    formData.set("bio", "I help busy professionals improve their strength and confidence.");
    formData.set("specialties", "STRENGTH");
    formData.set("specialties", "GENERAL_FITNESS");
    formData.set("yearsExperience", "5");
    formData.set("certification", "NASM");
    completeCoachOnboardingMock.mockResolvedValue({
      user: { email: "coach@example.com", name: "Coach User" },
    });
    sendWelcomeEmailMock.mockImplementation(() => new Promise(() => {}));

    const result = await submitCoachOnboarding(formData);

    expect(result.success).toBe(true);
    expect(result.data?.redirectTo).toBe("/coach");
    expect(sendWelcomeEmailMock).toHaveBeenCalledWith("coach@example.com", "Coach User", "coach");
  });
});
