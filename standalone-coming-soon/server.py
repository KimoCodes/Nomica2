#!/usr/bin/env python3
import csv
import html
import json
import os
import re
import smtplib
import sys
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, parseaddr
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs

# Load .env file
def load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip())

load_env()

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
SUBSCRIBERS_FILE = os.path.join(DATA_DIR, "subscribers.csv")
LOGO_URL = "https://raw.githubusercontent.com/NomiTips/assets/main/logo-email.png"


def smtp_config():
    return {
        "host": os.environ.get("SMTP_HOST", "smtp-relay.brevo.com"),
        "port": int(os.environ.get("SMTP_PORT", "587")),
        "username": os.environ.get("SMTP_USER"),
        "password": os.environ.get("SMTP_PASS"),
        "sender": os.environ.get("SMTP_FROM", "NomiTips <batsindakeynesbenoit10101@gmail.com>"),
        "admin_email": os.environ.get("ADMIN_EMAIL", "batsindakeynesbenoit10101@gmail.com"),
    }


def build_subscriber_email(email_address, site_url):
    safe_url = html.escape(site_url, quote=True)
    html_body = f"""\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0f0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0f0d;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#111a14;border-radius:16px;border:1px solid #1e2e24;overflow:hidden;">

          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding:40px 30px 20px;">
              <div style="font-family:Georgia,serif;font-size:42px;color:#ffffff;letter-spacing:2px;">
                <span style="font-style:italic;">N</span>omi<span style="color:#28b968;">Tips</span>
              </div>
              <p style="margin:8px 0 0;font-size:11px;color:#4a6356;letter-spacing:3px;text-transform:uppercase;">Fitness Platform</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#28b968,transparent);"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:30px 40px 10px;">
              <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                Welcome to the Family 🎉
              </h1>
              <p style="margin:0 0 16px;font-size:16px;color:#a8c4b8;line-height:1.7;">
                You're officially on the NomiTips early access list. We're building something special — a premium fitness experience designed specifically for women who want real, lasting results.
              </p>
            </td>
          </tr>

          <!-- What's Coming Card -->
          <tr>
            <td style="padding:10px 40px;">
              <div style="background-color:#0d1610;border:1px solid #1e2e24;border-radius:12px;padding:24px;">
                <p style="margin:0 0 14px;font-size:14px;color:#28b968;font-weight:700;letter-spacing:1px;text-transform:uppercase;">What's Coming</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Custom workout programs</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; 1-on-1 coaching support</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Nutrition planning tools</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Progress tracking & analytics</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Community & transformation support</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Early Subscriber Bonus -->
          <tr>
            <td style="padding:20px 40px 10px;">
              <div style="background:linear-gradient(135deg,#0d1610 0%,#142218 100%);border:1px solid #28b968;border-radius:12px;padding:24px;text-align:center;">
                <p style="margin:0 0 8px;font-size:24px;">🎁</p>
                <p style="margin:0 0 8px;font-size:16px;color:#ffffff;font-weight:700;">Early Subscriber Exclusive</p>
                <p style="margin:0;font-size:14px;color:#28b968;font-weight:600;">
                  You'll receive a special launch reward when we go live
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:30px 40px;">
              <a href="{safe_url}" style="display:inline-block;background-color:#28b968;color:#0a0f0d;text-decoration:none;border-radius:10px;padding:14px 32px;font-size:15px;font-weight:700;letter-spacing:0.5px;">
                Visit NomiTips
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 10px;">
              <div style="height:1px;background-color:#1e2e24;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 40px 30px;">
              <p style="margin:0 0 8px;font-size:12px;color:#4a6356;text-align:center;">
                You're receiving this because you joined the NomiTips launch list.
              </p>
              <p style="margin:0;font-size:12px;color:#4a6356;text-align:center;">
                NomiTips &copy; 2026 &middot; All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    text_body = (
        "Welcome to NomiTips Early Access!\n\n"
        "You're officially on the early access list. We're building a premium fitness "
        "experience designed specifically for women who want real, lasting results.\n\n"
        "WHAT'S COMING:\n"
        "• Custom workout programs\n"
        "• 1-on-1 coaching support\n"
        "• Nutrition planning tools\n"
        "• Progress tracking & analytics\n\n"
        "As an early subscriber, you'll receive a special launch reward when we go live.\n\n"
        f"Visit: {site_url}\n\n"
        "NomiTips — Premium Fitness for Women\n"
    )
    return text_body, html_body


def build_admin_email(email_address, ip_address):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    safe_email = html.escape(email_address)
    html_body = f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0a0f0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0f0d;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#111a14;border-radius:16px;border:1px solid #1e2e24;overflow:hidden;">
          <tr>
            <td style="padding:30px 40px;">
              <p style="margin:0 0 4px;font-size:11px;color:#4a6356;letter-spacing:2px;text-transform:uppercase;">NomiTips Admin</p>
              <h1 style="margin:0 0 20px;font-size:22px;color:#ffffff;">New Early Access Signup</h1>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0d1610;border:1px solid #1e2e24;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;color:#4a6356;width:100px;font-size:14px;">Email</td>
                  <td style="padding:14px 16px;color:#ffffff;font-weight:600;font-size:14px;">{safe_email}</td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;color:#4a6356;border-top:1px solid #1e2e24;font-size:14px;">Date</td>
                  <td style="padding:14px 16px;color:#ffffff;border-top:1px solid #1e2e24;font-size:14px;">{ts}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    text_body = f"New NomiTips early access subscriber\n\nEmail: {email_address}\nDate: {ts}\n"
    return text_body, html_body


def send_email(config, to_address, subject, text_body, html_body):
    sender_name, sender_email = parseaddr(config["sender"])
    if not sender_email:
        sender_email = config["username"]
    formatted_sender = formataddr((sender_name or "NomiTips", sender_email))

    message = MIMEMultipart("alternative")
    message["From"] = formatted_sender
    message["To"] = to_address
    message["Subject"] = subject
    message.attach(MIMEText(text_body, "plain", "utf-8"))
    message.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP(config["host"], config["port"], timeout=20) as server:
        server.starttls()
        server.login(config["username"], config["password"])
        server.sendmail(sender_email, [to_address], message.as_string())


class ComingSoonHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/subscribe.py":
            self.send_error(404)
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        params = parse_qs(body)
        email = params.get("email", [""])[0].strip().lower()

        # Honeypot check
        if params.get("company", [""])[0]:
            self.send_json(200, {"success": True})
            return

        if not email or not EMAIL_RE.match(email) or len(email) > 254:
            self.send_json(400, {"success": False, "error": "Please enter a valid email address."})
            return

        config = smtp_config()

        try:
            # Save subscriber
            os.makedirs(DATA_DIR, exist_ok=True)
            file_exists = os.path.exists(SUBSCRIBERS_FILE)
            with open(SUBSCRIBERS_FILE, "a", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=["created_at_utc", "email"])
                if not file_exists:
                    writer.writeheader()
                writer.writerow({"created_at_utc": datetime.now(timezone.utc).isoformat(), "email": email})

            site_url = os.environ.get("SITE_URL", "https://nomitips.com")
            ip = self.client_address[0]

            # Send subscriber email
            sub_text, sub_html = build_subscriber_email(email, site_url)
            send_email(config, email, "You're on the NomiTips Early Access List 🎉", sub_text, sub_html)

            # Send admin email
            admin_text, admin_html = build_admin_email(email, ip)
            send_email(config, config["admin_email"], "New Early Access Signup — NomiTips", admin_text, admin_html)

            self.send_json(200, {"success": True})
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            self.send_json(500, {"success": False, "error": "Something went wrong. Please try again."})

    def send_json(self, status, data):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(("127.0.0.1", port), ComingSoonHandler)
    print(f"NomiTips Coming Soon server running at http://127.0.0.1:{port}")
    server.serve_forever()
