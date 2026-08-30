# NomiTips Standalone Coming Soon Page

This folder is intentionally independent from the unfinished Next.js app. You can upload the contents of `standalone-coming-soon/` to a public Apache/XAMPP directory and serve `index.html` directly.

## Files

- `index.html` - the standalone Coming Soon page.
- `assets/styles.css` - responsive production styling.
- `assets/app.js` - email form state handling and duplicate-click protection.
- `assets/logo.png` - copied NomiTips brand logo.
- `subscribe.py` - server-side CGI endpoint that validates subscriptions, sends emails, and stores successful subscribers.
- `data/` - private subscriber/rate-limit storage. Keep this directory writable by the web server and blocked from public browsing.

## Required Server Setup

The browser never receives SMTP credentials. Configure these as server environment variables:

```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-smtp-login
SMTP_PASS=your-brevo-smtp-key
SMTP_FROM="NomiTips <your-verified-sender@example.com>"
ADMIN_EMAIL=admin@example.com
SITE_URL=https://your-domain.example
```

Optional storage overrides:

```bash
COMING_SOON_DATA_DIR=/private/path/nomitips-coming-soon
COMING_SOON_SUBSCRIBERS_FILE=/private/path/nomitips-coming-soon/subscribers.csv
```

## Apache/XAMPP Notes

The included `.htaccess` enables Python CGI for `subscribe.py` on Apache installs that allow per-directory overrides. If your server ignores `.htaccess`, enable CGI in the Apache virtual host and map `.py` to CGI there.

Make the endpoint executable after upload:

```bash
chmod 755 subscribe.py
chmod 755 data
```

If the web server user cannot write to `data/`, subscriptions will fail. For production, the safest setup is to point `COMING_SOON_DATA_DIR` to a private writable directory outside the public web root.

## Security Notes

The previous `send_smtp.py` pattern contained credentials directly in source. Do not deploy credentials in files served by the website or committed to source control. Rotate any SMTP key that has already been exposed, then use environment variables only.
