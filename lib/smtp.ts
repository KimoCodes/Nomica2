import nodemailer from "nodemailer";
import logger from "./logger";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return {
    host,
    port: parseInt(port, 10),
    secure: port === "465",
    auth: { user, pass },
  };
}

function getSmtpFrom(): string {
  const smtpFrom = process.env.SMTP_FROM;
  if (!smtpFrom) {
    throw new Error(
      "SMTP_FROM environment variable is not configured. " +
      "Set it to your verified sender address."
    );
  }
  return smtpFrom;
}

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporter) {
    return transporter;
  }

  const config = getSmtpConfig();
  if (!config) {
    return null;
  }

  try {
    transporter = nodemailer.createTransport(config);
    logger.info("SMTP transporter initialized");
    return transporter;
  } catch (error) {
    logger.error({ err: error }, "Failed to create SMTP transporter");
    return null;
  }
}

export async function sendSmtpEmail({
  to,
  subject,
  html,
  from,
}: SendEmailParams): Promise<{ sent: boolean; error?: string }> {
  const transport = await getTransporter();

  if (!transport) {
    logger.warn({ to, subject }, "SMTP not configured, skipping email");
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    const info = await transport.sendMail({
      from: from ?? getSmtpFrom(),
      to,
      subject,
      html,
    });

    logger.info({ to, subject, messageId: info.messageId }, "Email sent via SMTP");
    return { sent: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error({ err: error, to, subject }, "Failed to send email via SMTP");
    return { sent: false, error: errorMessage };
  }
}
