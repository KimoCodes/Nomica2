import { getAppUrl, getEmailFrom, getResendClient } from "@/lib/resend";
import { sendSmtpEmail } from "@/lib/smtp";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

type EmailProvider = "resend" | "smtp" | "none";

function getEmailProvider(): EmailProvider {
  if (getResendClient()) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return "none";
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ sent: boolean }> {
  const provider = getEmailProvider();

  if (provider === "resend") {
    const resend = getResendClient();
    const { error } = await resend!.emails.send({
      from: getEmailFrom(),
      to,
      subject,
      html,
    });

    if (error) {
      logger.error({ err: error, to, subject }, "Failed to send email via Resend");
      return { sent: false };
    }
    return { sent: true };
  }

  if (provider === "smtp") {
    const result = await sendSmtpEmail({ to, subject, html });
    return { sent: result.sent };
  }

  logger.warn({ to, subject }, "No email provider configured, skipping");
  return { sent: false };
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<{ sent: boolean }> {
  const verifyUrl = `${getAppUrl()}/verify-email?token=${token}`;

  if (getEmailProvider() === "none") {
    logger.warn(
      { email, route: "email.service" },
      "No email provider configured, auto-verifying",
    );
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    return { sent: false };
  }

  return sendEmail(
    email,
    "Verify your NomiTips account",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome to NomiTips, ${name}!</h1>
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
  );
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: "client" | "coach",
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/${role === "coach" ? "coach" : "client"}`;

  return sendEmail(
    email,
    "You're all set on NomiTips",
    `
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
  );
}

export async function sendSubscriptionConfirmationEmail(
  email: string,
  name: string,
  plan: string,
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/client/subscription`;
  const planName = plan === "ALL_ACCESS_MONTHLY" ? "Monthly" : "Annual";

  return sendEmail(
    email,
    "Your NomiTips subscription is active",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome to NomiTips All Access, ${name}!</h1>
        <p style="color: #444; line-height: 1.6;">
          Your ${planName} subscription is now active. You have full access to all programs, workouts, and features.
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
          <h2 style="font-size: 16px; margin-bottom: 8px; color: #166534;">What's included:</h2>
          <ul style="color: #444; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>Unlimited access to all fitness programs</li>
            <li>Custom workout tracking</li>
            <li>Nutrition planning tools</li>
            <li>Progress photos and analytics</li>
          </ul>
        </div>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Start Training
        </a>
        <p style="color: #888; font-size: 14px;">
          Questions? Reply to this email or visit our help center.
        </p>
      </div>
    `,
  );
}

export async function sendSubscriptionCancelledEmail(
  email: string,
  name: string,
): Promise<{ sent: boolean }> {
  return sendEmail(
    email,
    "Your NomiTips subscription has been cancelled",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Subscription Cancelled</h1>
        <p style="color: #444; line-height: 1.6;">
          Hi ${name}, your NomiTips subscription has been cancelled. You'll retain access until the end of your current billing period.
        </p>
        <p style="color: #444; line-height: 1.6;">
          We'd love to have you back. If you change your mind, you can resubscribe anytime from your dashboard.
        </p>
        <a href="${getAppUrl()}/pricing}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          View Plans
        </a>
      </div>
    `,
  );
}

export async function sendFreeTrialGrantedEmail(
  email: string,
  name: string,
  durationDays: number,
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/client`;

  return sendEmail(
    email,
    "You've received a free trial on NomiTips!",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Free Trial Activated!</h1>
        <p style="color: #444; line-height: 1.6;">
          Hi ${name}, great news! You've been granted a ${durationDays}-day free trial of NomiTips All Access.
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
          <p style="color: #166534; font-weight: 500; margin: 0;">
            Your trial includes full access to all programs, workouts, and features.
          </p>
        </div>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Start Your Trial
        </a>
        <p style="color: #888; font-size: 14px;">
          No credit card required. You can upgrade to a paid plan anytime.
        </p>
      </div>
    `,
  );
}

export async function sendCoachNewClientEmail(
  coachEmail: string,
  coachName: string,
  clientName: string,
  clientEmail: string,
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/coach/clients`;

  return sendEmail(
    coachEmail,
    `New client: ${clientName}`,
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">New Client Assigned</h1>
        <p style="color: #444; line-height: 1.6;">
          Hi ${coachName}, a new client has been assigned to you:
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #f9f9f9; border-radius: 12px;">
          <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${clientName}</p>
          <p style="margin: 0;"><strong>Email:</strong> ${clientEmail}</p>
        </div>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          View Clients
        </a>
      </div>
    `,
  );
}
