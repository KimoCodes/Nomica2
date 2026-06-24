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
  return process.env.AUTH_URL ?? "http://localhost:3000";
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "NoMica <onboarding@resend.dev>";
}
