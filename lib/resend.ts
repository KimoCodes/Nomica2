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
  const url = process.env.AUTH_URL;
  if (!url) {
    throw new Error("AUTH_URL environment variable is not set");
  }
  return url;
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "NOMICA <onboarding@resend.dev>";
}
