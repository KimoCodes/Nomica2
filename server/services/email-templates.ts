import { getAppUrl } from "@/lib/resend";

const APP_URL = getAppUrl();
const SITE_NAME = "NomiTips";
const SUPPORT_EMAIL = "support@nomitips.com";

type EmailTemplateOptions = {
  preheader?: string;
  title: string;
  subtitle?: string;
  content: string;
  action?: {
    label: string;
    url: string;
  };
  footer?: string;
};

export function renderEmailTemplate(options: EmailTemplateOptions): string {
  const { preheader, title, subtitle, content, action, footer } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${preheader ? `<meta name="preheader" content="${preheader}">` : ""}
  <!--[if mso]>
  <style>table,td{font-family:Helvetica,Arial,sans-serif!important}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0a0f0d;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f0d;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <a href="${APP_URL}" style="text-decoration:none;">
                <span style="font-family:Georgia,serif;font-size:28px;font-style:italic;color:#ffffff;letter-spacing:-0.5px;">N</span><span style="font-family:Georgia,serif;font-size:28px;color:#ffffff;letter-spacing:-0.5px;">omi</span><span style="font-family:Georgia,serif;font-size:28px;color:#28b968;letter-spacing:-0.5px;">Tips</span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111a14;border:1px solid #1e2e24;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:40px 32px;">

                    <!-- Title -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:8px;">
                          <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">
                            ${title}
                          </h1>
                        </td>
                      </tr>
                      ${subtitle ? `
                      <tr>
                        <td style="padding-bottom:24px;">
                          <p style="margin:0;font-size:15px;color:#a8c4b8;line-height:1.5;">
                            ${subtitle}
                          </p>
                        </td>
                      </tr>
                      ` : `
                      <tr>
                        <td style="padding-bottom:24px;"></td>
                      </tr>
                      `}
                    </table>

                    <!-- Content -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:15px;color:#a8c4b8;line-height:1.7;">
                          ${content}
                        </td>
                      </tr>
                    </table>

                    ${action ? `
                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                      <tr>
                        <td align="center">
                          <a href="${action.url}" style="display:inline-block;padding:14px 32px;background-color:#28b968;color:#0a0f0d;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:0.2px;">
                            ${action.label}
                          </a>
                        </td>
                      </tr>
                    </table>
                    ` : ""}

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 16px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#4a6356;">
                ${footer || `${SITE_NAME} &mdash; Stop Scrolling. Start Sculpting.`}
              </p>
              <p style="margin:0;font-size:12px;color:#4a6356;">
                <a href="${APP_URL}/settings" style="color:#4a6356;text-decoration:underline;">Notification settings</a>
                &nbsp;&bull;&nbsp;
                <a href="mailto:${SUPPORT_EMAIL}" style="color:#4a6356;text-decoration:underline;">Contact support</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Reusable Content Blocks ──────────────────────────────────────────────────

export function infoCard(title: string, rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (r) => `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#a8c4b8;">${r.label}</td>
      <td style="padding:8px 0;font-size:14px;color:#ffffff;text-align:right;font-weight:500;">${r.value}</td>
    </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1610;border:1px solid #1e2e24;border-radius:12px;margin:16px 0;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 12px 0;font-size:13px;font-weight:600;color:#28b968;text-transform:uppercase;letter-spacing:0.5px;">${title}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`;
}

export function statusBadge(status: string): string {
  const colors: Record<string, { bg: string; text: string }> = {
    approved: { bg: "#0d2818", text: "#28b968" },
    active: { bg: "#0d2818", text: "#28b968" },
    completed: { bg: "#0d2818", text: "#28b968" },
    pending: { bg: "#1a1a0d", text: "#d4a017" },
    rejected: { bg: "#1a0d0d", text: "#dc3545" },
    cancelled: { bg: "#1a0d0d", text: "#dc3545" },
    expired: { bg: "#1a0d0d", text: "#dc3545" },
    submitted: { bg: "#0d1a1a", text: "#6bbdcf" },
  };

  const style = colors[status.toLowerCase()] || colors.pending;

  return `
    <span style="display:inline-block;padding:4px 12px;background-color:${style.bg};color:${style.text};border-radius:20px;font-size:13px;font-weight:600;text-transform:capitalize;">
      ${status}
    </span>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #1e2e24;margin:24px 0;">`;
}

export function textBlock(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:15px;color:#a8c4b8;line-height:1.7;">${text}</p>`;
}

export function boldText(text: string): string {
  return `<strong style="color:#ffffff;">${text}</strong>`;
}
