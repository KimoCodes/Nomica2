import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/resend";

export type ReferralResult = {
  success: boolean;
  referralCode?: string;
  referralLink?: string;
  error?: string;
};

export type ReferralStats = {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    code += CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length));
  }
  return code;
}

export function buildReferralLink(code: string): string {
  return `${getAppUrl()}?ref=${code}`;
}

/** Get or create the durable share code for a user. */
export async function getOrCreateReferralCode(userId: string): Promise<ReferralResult> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (existing?.referralCode) {
    return {
      success: true,
      referralCode: existing.referralCode,
      referralLink: buildReferralLink(existing.referralCode),
    };
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = randomCode();
    const clash = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (clash) continue;

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });
    } catch {
      // Unique-constraint race on referralCode — try another code.
      continue;
    }
    return {
      success: true,
      referralCode: code,
      referralLink: buildReferralLink(code),
    };
  }

  return { success: false, error: "Could not generate a referral code. Try again." };
}

/** Resolve a share code to the referrer's user id (invalid/expired → undefined). */
export async function resolveReferralCode(
  code: string,
): Promise<{ valid: boolean; referredBy?: string }> {
  if (!code || code.length > 16) return { valid: false };
  const normalized = code.trim().toUpperCase();
  const referrer = await prisma.user.findUnique({
    where: { referralCode: normalized },
    select: { id: true },
  });
  if (!referrer) return { valid: false };
  return { valid: true, referredBy: referrer.id };
}

/**
 * Referral stats for the dashboard. A referral counts as completed once the
 * referred user has at least one PAID order (real conversion, not just signup).
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const referred = await prisma.user.findMany({
    where: { referredById: userId },
    select: {
      id: true,
      _count: {
        select: {
          orders: { where: { status: { in: ["PAID", "PARTIALLY_REFUNDED"] } } },
        },
      },
    },
  });

  const completedReferrals = referred.filter((user) => user._count.orders > 0).length;
  return {
    totalReferrals: referred.length,
    completedReferrals,
    pendingReferrals: referred.length - completedReferrals,
  };
}
