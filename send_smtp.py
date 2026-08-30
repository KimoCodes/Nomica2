#!/usr/bin/env python3
"""Small SMTP smoke-test helper.

Required environment variables:
  SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO

Optional environment variables:
  SMTP_HOST, SMTP_PORT
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, parseaddr


def required_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"{name} environment variable is required")
    return value


def send_smtp_email(subject, text_body, html_body=None):
    host = os.environ.get("SMTP_HOST", "smtp-relay.brevo.com")
    port = int(os.environ.get("SMTP_PORT", "587"))
    username = required_env("SMTP_USER")
    password = required_env("SMTP_PASS")
    sender = required_env("SMTP_FROM")
    recipient = required_env("SMTP_TO")

    sender_name, sender_email = parseaddr(sender)
    if not sender_email:
        sender_email = username

    message = MIMEMultipart("alternative")
    message["From"] = formataddr((sender_name or "NomiTips", sender_email))
    message["To"] = recipient
    message["Subject"] = subject
    message.attach(MIMEText(text_body, "plain", "utf-8"))
    if html_body:
        message.attach(MIMEText(html_body, "html", "utf-8"))

    smtp_client = smtplib.SMTP_SSL if port == 465 else smtplib.SMTP
    with smtp_client(host, port, timeout=20) as server:
        if port != 465:
            server.starttls()
        server.login(username, password)
        server.sendmail(sender_email, [recipient], message.as_string())


if __name__ == "__main__":
    try:
        send_smtp_email(
            "NomiTips SMTP test",
            "This is a test email sent from the NomiTips SMTP helper.",
            "<p>This is a test email sent from the <strong>NomiTips</strong> SMTP helper.</p>",
        )
        print("Email sent successfully.")
    except Exception as error:
        print(f"Error: {error}")
