"use server";

import { Role } from "@prisma/client";
import { signOut } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import {
  checkRateLimit,
} from "@/server/utils/rate-limit";
import {
  createUser,
  createVerificationToken,
  verifyEmailToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  resetUserPassword,
  getUserByEmail,
} from "@/server/services/user.service";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminNewUserNotification,
} from "@/server/services/email.service";
import {
  registerSchema,
} from "@/server/validators/auth.schema";
import { logActivity } from "@/server/services/analytics.service";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

const AUTH_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

async function enforceAuthRateLimit(action: string, email: string) {
  const result = checkRateLimit(
    `${action}:${email.toLowerCase()}`,
    AUTH_RATE_LIMIT.limit,
    AUTH_RATE_LIMIT.windowMs,
  );

  if (!result.allowed) {
    throw new Error("RATE_LIMITED");
  }
}

export async function registerUser(
  formData: FormData,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const raw = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role") ?? Role.CLIENT,
    };

    const parsed = registerSchema.safeParse(raw);

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    await enforceAuthRateLimit("register", parsed.data.email);

    const user = await createUser(parsed.data);
    const verification = await createVerificationToken(user.email);
    const { sent } = await sendVerificationEmail(user.email, user.name, verification.token);
    await sendAdminNewUserNotification({
      name: user.name,
      email: user.email,
      role: user.role,
    });

    logActivity({
      action: "USER_REGISTERED",
      category: "auth",
      resourceType: "user",
      resourceId: user.id,
      description: `New user registered: ${user.email}`,
      metadata: { role: user.role },
    }).catch(() => {});

    return createSuccessResponse({
      message: sent
        ? "Account created. Please check your email to verify your account."
        : "Account created. You can now sign in.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return createErrorResponse("An account with this email already exists", "EMAIL_EXISTS");
    }

    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return createErrorResponse(
        "Too many attempts. Please try again later.",
        "RATE_LIMITED",
      );
    }

    logger.error({ err: error, action: "registerUser" }, "Failed to create account");
    return createErrorResponse("Failed to create account", "INTERNAL_ERROR");
  }
}

export async function preCheckLogin(
  email: string,
): Promise<ApiResponse<{ redirectTo: string }>> {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return createErrorResponse("Invalid email address", "VALIDATION_ERROR");
    }

    await enforceAuthRateLimit("login", email);

    const { getUserByEmail } = await import("@/server/services/user.service");
    const existingUser = await getUserByEmail(email);

    if (existingUser && !existingUser.emailVerified) {
      return createErrorResponse(
        "Please verify your email before signing in. Check your inbox for the verification link.",
        "EMAIL_NOT_VERIFIED",
      );
    }

    if (
      existingUser?.role === Role.COACH &&
      existingUser.coachProfile &&
      !existingUser.coachProfile.approved
    ) {
      return createErrorResponse(
        "Your coach account is pending approval. You will be notified once approved.",
        "COACH_NOT_APPROVED",
      );
    }

    const redirectTo = existingUser
      ? existingUser.role === "ADMIN"
        ? "/admin"
        : existingUser.role === "COACH"
          ? existingUser.coachProfile?.onboardingComplete ? "/coach" : "/coach/onboarding"
          : existingUser.clientProfile?.onboardingComplete ? "/client" : "/onboarding"
      : "/client";

    return createSuccessResponse({ redirectTo });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return createErrorResponse(
        "Too many login attempts. Please try again later.",
        "RATE_LIMITED",
      );
    }

    logger.error({ err: error, action: "preCheckLogin" }, "Failed to sign in");
    return createErrorResponse("Failed to sign in", "INTERNAL_ERROR");
  }
}

export async function logoutUser(): Promise<ApiResponse<{ message: string }>> {
  try {
    await signOut({ redirect: false });

    logActivity({
      action: "USER_LOGGED_OUT",
      category: "auth",
      description: "User signed out",
    }).catch(() => {});

    return createSuccessResponse({ message: "Signed out successfully" });
  } catch (error) {
    logger.error({ err: error, action: "logoutUser" }, "Failed to sign out");
    return createErrorResponse("Failed to sign out", "INTERNAL_ERROR");
  }
}

export async function verifyEmail(
  token: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const email = await verifyEmailToken(token);

    if (!email) {
      return createErrorResponse(
        "Invalid or expired verification link",
        "INVALID_TOKEN",
      );
    }

    logActivity({
      action: "EMAIL_VERIFIED",
      category: "auth",
      description: `Email verified: ${email}`,
    }).catch(() => {});

    return createSuccessResponse({ message: "Email verified successfully" });
  } catch (error) {
    logger.error({ err: error, action: "verifyEmail" }, "Failed to verify email");
    return createErrorResponse("Failed to verify email", "INTERNAL_ERROR");
  }
}

// ─── Password Reset ──────────────────────────────────────────────────────────

export async function requestPasswordReset(
  email: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return createErrorResponse("Invalid email address", "VALIDATION_ERROR");
    }

    await enforceAuthRateLimit("password-reset", email);

    const user = await getUserByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return createSuccessResponse({
        message: "If an account exists with that email, you'll receive a reset link shortly.",
      });
    }

    const { token } = await createPasswordResetToken(email);
    await sendPasswordResetEmail(email, token);

    logActivity({
      action: "PASSWORD_RESET_REQUESTED",
      category: "auth",
      description: `Password reset requested for: ${email}`,
    }).catch(() => {});

    return createSuccessResponse({
      message: "If an account exists with that email, you'll receive a reset link shortly.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return createErrorResponse(
        "Too many attempts. Please try again later.",
        "RATE_LIMITED",
      );
    }

    logger.error({ err: error, action: "requestPasswordReset" }, "Failed to request password reset");
    return createErrorResponse("Failed to process request", "INTERNAL_ERROR");
  }
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    if (!token) {
      return createErrorResponse("Invalid or expired reset link", "INVALID_TOKEN");
    }

    if (!newPassword || newPassword.length < 8) {
      return createErrorResponse("Password must be at least 8 characters", "VALIDATION_ERROR");
    }

    const email = await verifyPasswordResetToken(token);

    if (!email) {
      return createErrorResponse(
        "Invalid or expired reset link",
        "INVALID_TOKEN",
      );
    }

    await resetUserPassword(email, newPassword);

    logActivity({
      action: "PASSWORD_RESET_COMPLETED",
      category: "auth",
      description: `Password reset completed for: ${email}`,
    }).catch(() => {});

    return createSuccessResponse({ message: "Password reset successfully" });
  } catch (error) {
    logger.error({ err: error, action: "resetPassword" }, "Failed to reset password");
    return createErrorResponse("Failed to reset password", "INTERNAL_ERROR");
  }
}
