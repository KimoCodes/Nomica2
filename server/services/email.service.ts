import { getAppUrl, getEmailFrom, getResendClient } from "@/lib/resend";

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<{ sent: boolean }> {
  const resend = getResendClient();
  const verifyUrl = `${getAppUrl()}/verify-email?token=${token}`;

  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not configured. Verification URL for ${email}: ${verifyUrl}`,
    );
    return { sent: false };
  }

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "Verify your NoMica account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome to NoMica, ${name}!</h1>
        <p style="color: #444; line-height: 1.6;">
          Thanks for signing up. Please verify your email address to activate your account.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Verify email
        </a>
        <p style="color: #888; font-size: 14px;">
          This link expires in 24 hours. If you did not create an account, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Failed to send verification email:", error);
    return { sent: false };
  }

  return { sent: true };
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: "client" | "coach",
): Promise<{ sent: boolean }> {
  const resend = getResendClient();

  if (!resend) {
    return { sent: false };
  }

  const dashboardUrl = `${getAppUrl()}/${role === "coach" ? "coach" : "client"}`;

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "You're all set on NoMica",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">You're ready to go, ${name}!</h1>
        <p style="color: #444; line-height: 1.6;">
          Your ${role} profile is complete. Head to your dashboard to get started.
        </p>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Go to dashboard
        </a>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Failed to send welcome email:", error);
    return { sent: false };
  }

  return { sent: true };
}
