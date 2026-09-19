import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export function getAppUrl(): string {
  const rawUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
  const url = rawUrl.trim();

  if (!url) {
    throw new Error("AUTH_URL environment variable is not set");
  }

  if (!/^https?:\/\//i.test(url)) {
    return `http://${url}`;
  }

  return url.replace(/\/$/, "");
}

export function getEmailFrom(): string {
  const emailFrom = process.env.EMAIL_FROM;
  if (!emailFrom) {
    throw new Error(
      "EMAIL_FROM environment variable is not configured. " +
      "Set it to your verified sender address (e.g. 'NomiTips <noreply@nomitips.com>')."
    );
  }
  return emailFrom;
}
