"use server";

import { headers } from "next/headers";
import { Role, SubscriptionPlan } from "@prisma/client";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import {
  checkRateLimit,
  getClientIp,
} from "@/server/utils/rate-limit";
import {
  createUser,
  createVerificationToken,
  verifyEmailToken,
} from "@/server/services/user.service";
import { sendVerificationEmail } from "@/server/services/email.service";
import { createSubscription } from "@/server/services/subscription.service";
import { getPostLoginRedirect } from "@/server/services/onboarding.service";
import {
  loginSchema,
  registerSchema,
} from "@/server/validators/auth.schema";
import type { ApiResponse } from "@/types";

const AUTH_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

async function enforceAuthRateLimit(action: string) {
  const headerList = await headers();
  const ip = getClientIp(headerList);
  const result = checkRateLimit(
    `${action}:${ip}`,
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
    await enforceAuthRateLimit("register");

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

    const user = await createUser(parsed.data);
    const verification = await createVerificationToken(user.email);
    await sendVerificationEmail(user.email, user.name, verification.token);

    if (parsed.data.role === Role.CLIENT) {
      const plan = (formData.get("plan") as string) || "STARTER";
      const validPlans = ["STARTER", "PREMIUM", "ELITE"];
      if (validPlans.includes(plan)) {
        await createSubscription(user.id, plan as SubscriptionPlan);
      }
    }

    return createSuccessResponse({
      message:
        "Account created. Please check your email to verify your account.",
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

    console.error("registerUser error:", error);
    return createErrorResponse("Failed to create account", "INTERNAL_ERROR");
  }
}

export async function loginUser(
  formData: FormData,
): Promise<ApiResponse<{ redirectTo: string }>> {
  try {
    await enforceAuthRateLimit("login");

    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(raw);

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    const { getUserByEmail } = await import("@/server/services/user.service");
    const user = await getUserByEmail(parsed.data.email);

    const redirectTo = user
      ? await getPostLoginRedirect(user.id, user.role)
      : "/client";

    return createSuccessResponse({ redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return createErrorResponse("Invalid email or password", "INVALID_CREDENTIALS");
    }

    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return createErrorResponse(
        "Too many login attempts. Please try again later.",
        "RATE_LIMITED",
      );
    }

    console.error("loginUser error:", error);
    return createErrorResponse("Failed to sign in", "INTERNAL_ERROR");
  }
}

export async function logoutUser(): Promise<ApiResponse<{ message: string }>> {
  try {
    await signOut({ redirect: false });
    return createSuccessResponse({ message: "Signed out successfully" });
  } catch (error) {
    console.error("logoutUser error:", error);
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

    return createSuccessResponse({ message: "Email verified successfully" });
  } catch (error) {
    console.error("verifyEmail error:", error);
    return createErrorResponse("Failed to verify email", "INTERNAL_ERROR");
  }
}
