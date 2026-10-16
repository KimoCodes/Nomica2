"use server";

import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import {
  getOrCreateReferralCode,
  getReferralStats,
} from "@/server/services/referral.service";

/** Load the current user's referral code, stats, and share link. */
export async function getMyReferralDashboardAction() {
  try {
    const session = await requireRole([Role.CLIENT]);
    const [codeResult, stats] = await Promise.all([
      getOrCreateReferralCode(session.user.id),
      getReferralStats(session.user.id),
    ]);
    if (!codeResult.success || !codeResult.referralCode) {
      return createErrorResponse(
        codeResult.error ?? "Could not create a referral code",
        "REFERRAL_CODE_FAILED",
      );
    }
    return createSuccessResponse({
      referralCode: codeResult.referralCode,
      referralLink: codeResult.referralLink ?? "",
      stats,
    });
  } catch {
    return createErrorResponse("Not authorized", "UNAUTHORIZED");
  }
}
