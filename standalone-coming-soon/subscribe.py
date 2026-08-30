#!/usr/bin/env python3
import csv
import html
import json
import os
import re
import smtplib
import sys
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, parseaddr
from urllib.parse import parse_qs

try:
    import fcntl
except ImportError:  # pragma: no cover
    fcntl = None


EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MAX_BODY_BYTES = 4096
RATE_LIMIT_WINDOW_SECONDS = 60 * 60
RATE_LIMIT_MAX_ATTEMPTS = 6


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("COMING_SOON_DATA_DIR", os.path.join(SCRIPT_DIR, "data"))
SUBSCRIBERS_FILE = os.environ.get(
    "COMING_SOON_SUBSCRIBERS_FILE",
    os.path.join(DATA_DIR, "subscribers.csv"),
)
RATE_LIMIT_FILE = os.path.join(DATA_DIR, "rate-limit.json")
LOCK_FILE = os.path.join(DATA_DIR, ".subscribe.lock")


def respond(status_code, payload):
    reason = {
        200: "OK",
        400: "Bad Request",
        405: "Method Not Allowed",
        413: "Payload Too Large",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
    }.get(status_code, "OK")
    print(f"Status: {status_code} {reason}")
    print("Content-Type: application/json; charset=utf-8")
    print("Cache-Control: no-store")
    print()
    print(json.dumps(payload))


def fail(status_code, message):
    respond(status_code, {"success": False, "error": message})


@contextmanager
def file_lock():
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(LOCK_FILE, "a", encoding="utf-8") as lock:
        if fcntl:
            fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            if fcntl:
                fcntl.flock(lock.fileno(), fcntl.LOCK_UN)


def read_form_value(form, name):
    value = form.get(name, "")
    return value.strip() if isinstance(value, str) else ""


def parse_form(content_length):
    content_type = os.environ.get("CONTENT_TYPE", "").split(";", 1)[0].strip().lower()
    if content_type != "application/x-www-form-urlencoded":
        raise ValueError("Unsupported form content type.")

    raw_body = sys.stdin.buffer.read(content_length).decode("utf-8", "replace")
    parsed = parse_qs(raw_body, keep_blank_values=True)
    return {
        key: values[0]
        for key, values in parsed.items()
        if values
    }


def get_client_ip():
    forwarded_for = os.environ.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()[:64]
    return os.environ.get("REMOTE_ADDR", "unknown")[:64]


def get_user_agent():
    return os.environ.get("HTTP_USER_AGENT", "unknown")[:300]


def normalize_email(value):
    return value.strip().lower()


def validate_email(value):
    return bool(value and len(value) <= 254 and EMAIL_RE.match(value))


def load_rate_limits():
    try:
        with open(RATE_LIMIT_FILE, "r", encoding="utf-8") as handle:
            data = json.load(handle)
            return data if isinstance(data, dict) else {}
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}


def save_rate_limits(data):
    with open(RATE_LIMIT_FILE, "w", encoding="utf-8") as handle:
        json.dump(data, handle)


def check_rate_limit(ip_address):
    now = int(time.time())
    since = now - RATE_LIMIT_WINDOW_SECONDS
    data = load_rate_limits()
    attempts = [stamp for stamp in data.get(ip_address, []) if isinstance(stamp, int) and stamp >= since]

    if len(attempts) >= RATE_LIMIT_MAX_ATTEMPTS:
        data[ip_address] = attempts
        save_rate_limits(data)
        return False

    attempts.append(now)
    data[ip_address] = attempts

    for key in list(data.keys()):
        data[key] = [
            stamp for stamp in data.get(key, []) if isinstance(stamp, int) and stamp >= since
        ]
        if not data[key]:
            del data[key]

    save_rate_limits(data)
    return True


def load_existing_emails():
    try:
        with open(SUBSCRIBERS_FILE, "r", newline="", encoding="utf-8") as handle:
            return {
                row.get("email", "").strip().lower()
                for row in csv.DictReader(handle)
                if row.get("email")
            }
    except FileNotFoundError:
        return set()


def append_subscriber(email_address, ip_address, user_agent):
    file_exists = os.path.exists(SUBSCRIBERS_FILE)
    with open(SUBSCRIBERS_FILE, "a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["created_at_utc", "email", "ip_address", "user_agent"],
        )
        if not file_exists:
            writer.writeheader()
        writer.writerow(
            {
                "created_at_utc": datetime.now(timezone.utc).isoformat(),
                "email": email_address,
                "ip_address": ip_address,
                "user_agent": user_agent,
            }
        )


def smtp_config():
    host = os.environ.get("SMTP_HOST", "smtp-relay.brevo.com")
    port = int(os.environ.get("SMTP_PORT", "587"))
    username = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")
    sender = os.environ.get("SMTP_FROM")
    admin_email = os.environ.get("ADMIN_EMAIL")

    missing = [
        name
        for name, value in {
            "SMTP_USER": username,
            "SMTP_PASS": password,
            "SMTP_FROM": sender,
            "ADMIN_EMAIL": admin_email,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError("Missing email configuration: " + ", ".join(missing))

    return {
        "host": host,
        "port": port,
        "username": username,
        "password": password,
        "sender": sender,
        "admin_email": admin_email,
    }


def brand_html(content):
    return f"""\
<!doctype html>
<html>
  <body style="margin:0;background:#f4f7f5;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#122018;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border-collapse:collapse;background:#ffffff;border:1px solid #dfe8e2;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 30px 10px;">
                <p style="margin:0;color:#28b968;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">NomiTips</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 30px;">
                {content}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


def build_subscriber_email(site_url):
    safe_url = html.escape(site_url, quote=True)
    html_body = brand_html(
        f"""
        <h1 style="margin:12px 0 14px;font-size:28px;line-height:1.15;color:#0b130f;">You're on the early access list.</h1>
        <p style="margin:0 0 16px;color:#48564d;font-size:16px;line-height:1.65;">
          Thank you for joining NomiTips before launch. We are preparing a focused fitness platform for women with structured programs, coaching support, progress tracking, and practical nutrition guidance.
        </p>
        <div style="margin:22px 0;padding:18px;border-radius:10px;background:#edfdf3;border:1px solid #c5f6d8;">
          <p style="margin:0;color:#17653d;font-size:15px;line-height:1.55;font-weight:700;">
            Early subscribers may receive a special launch bonus or exclusive benefit when the platform opens.
          </p>
        </div>
        <p style="margin:0 0 22px;color:#48564d;font-size:16px;line-height:1.65;">
          We will email you when early access begins.
        </p>
        <a href="{safe_url}" style="display:inline-block;background:#111c16;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 18px;font-weight:700;">
          Visit NomiTips
        </a>
        <p style="margin:26px 0 0;color:#7a877f;font-size:13px;line-height:1.5;">
          You are receiving this because this email address joined the NomiTips launch list.
        </p>
        """
    )
    text_body = (
        "You're on the NomiTips early access list.\n\n"
        "Thank you for joining before launch. NomiTips is preparing structured programs, "
        "coaching support, progress tracking, and practical nutrition guidance.\n\n"
        "Early subscribers may receive a special launch bonus or exclusive benefit when "
        "the platform opens.\n\n"
        f"Visit: {site_url}\n"
    )
    return text_body, html_body


def build_admin_email(email_address, ip_address, user_agent):
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    safe_email = html.escape(email_address)
    safe_ip = html.escape(ip_address)
    safe_agent = html.escape(user_agent)
    html_body = brand_html(
        f"""
        <h1 style="margin:12px 0 14px;font-size:26px;line-height:1.2;color:#0b130f;">New early access subscriber</h1>
        <p style="margin:0 0 18px;color:#48564d;font-size:16px;line-height:1.65;">
          A visitor joined the NomiTips Coming Soon early access list.
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#f6faf7;border:1px solid #e0e9e3;border-radius:10px;">
          <tr><td style="padding:14px 16px;color:#718078;width:130px;">Email</td><td style="padding:14px 16px;color:#122018;font-weight:700;">{safe_email}</td></tr>
          <tr><td style="padding:14px 16px;color:#718078;border-top:1px solid #e0e9e3;">Date</td><td style="padding:14px 16px;color:#122018;border-top:1px solid #e0e9e3;">{timestamp}</td></tr>
          <tr><td style="padding:14px 16px;color:#718078;border-top:1px solid #e0e9e3;">IP address</td><td style="padding:14px 16px;color:#122018;border-top:1px solid #e0e9e3;">{safe_ip}</td></tr>
          <tr><td style="padding:14px 16px;color:#718078;border-top:1px solid #e0e9e3;">User agent</td><td style="padding:14px 16px;color:#122018;border-top:1px solid #e0e9e3;">{safe_agent}</td></tr>
        </table>
        """
    )
    text_body = (
        "New NomiTips early access subscriber\n\n"
        f"Email: {email_address}\n"
        f"Date: {timestamp}\n"
        f"IP address: {ip_address}\n"
        f"User agent: {user_agent}\n"
    )
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

    smtp_client = smtplib.SMTP_SSL if config["port"] == 465 else smtplib.SMTP
    with smtp_client(config["host"], config["port"], timeout=20) as server:
        if config["port"] != 465:
            server.starttls()
        server.login(config["username"], config["password"])
        server.sendmail(sender_email, [to_address], message.as_string())


def handle_request():
    if os.environ.get("REQUEST_METHOD", "GET").upper() != "POST":
        fail(405, "This endpoint only accepts POST requests.")
        return

    try:
        content_length = int(os.environ.get("CONTENT_LENGTH") or "0")
    except ValueError:
        content_length = 0

    if content_length > MAX_BODY_BYTES:
        fail(413, "The submitted form is too large.")
        return

    try:
        form = parse_form(content_length)
    except ValueError:
        fail(400, "The submitted form could not be processed.")
        return

    if read_form_value(form, "company"):
        respond(200, {"success": True})
        return

    email_address = normalize_email(read_form_value(form, "email"))
    if not validate_email(email_address):
        fail(400, "Please enter a valid email address.")
        return

    ip_address = get_client_ip()
    user_agent = get_user_agent()
    site_url = os.environ.get("SITE_URL", "https://nomitips.com")

    try:
        with file_lock():
            if not check_rate_limit(ip_address):
                fail(429, "Too many attempts. Please try again later.")
                return

            if email_address in load_existing_emails():
                respond(200, {"success": True})
                return

            config = smtp_config()
            subscriber_text, subscriber_html = build_subscriber_email(site_url)
            admin_text, admin_html = build_admin_email(email_address, ip_address, user_agent)

            send_email(
                config,
                email_address,
                "You're on the NomiTips early access list",
                subscriber_text,
                subscriber_html,
            )
            send_email(
                config,
                config["admin_email"],
                "New Early Access Signup - NomiTips",
                admin_text,
                admin_html,
            )
            append_subscriber(email_address, ip_address, user_agent)

        respond(200, {"success": True})
    except RuntimeError as error:
        print(f"Configuration error: {error}", file=sys.stderr)
        fail(500, "Email is not configured yet. Please try again later.")
    except Exception as error:
        print(f"Subscription error: {error}", file=sys.stderr)
        fail(502, "We could not complete your subscription. Please try again.")


if __name__ == "__main__":
    handle_request()
