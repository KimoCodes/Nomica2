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
  credits: number;
};

const referralStore = new Map<string, { code: string; referredBy: string | null }>();

export function generateReferralCode(userId: string): ReferralResult {
  const existing = Array.from(referralStore.values()).find((r) => r.referredBy === userId);

  if (existing) {
    return {
      success: true,
      referralCode: existing.code,
      referralLink: `${getAppUrl()}?ref=${existing.code}`,
    };
  }

  const code = generateCode();

  referralStore.set(code, { code, referredBy: userId });

  return {
    success: true,
    referralCode: code,
    referralLink: `${getAppUrl()}?ref=${code}`,
  };
}

export function validateReferralCode(code: string): { valid: boolean; referredBy?: string } {
  const referral = referralStore.get(code);
  if (!referral) return { valid: false };
  return { valid: true, referredBy: referral.referredBy ?? undefined };
}

export function getReferralStats(_userId: string): ReferralStats {
  return {
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    credits: 0,
  };
}

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
