<?php
/**
 * NomiTips Coming Soon - Subscription Handler
 * Deploy this to Namecheap cPanel hosting
 */

// ─── Configuration ──────────────────────────────────────────
// Set these in your cPanel or hardcode for testing
$SMTP_HOST    = getenv('SMTP_HOST')    ?: 'smtp-relay.brevo.com';
$SMTP_PORT    = getenv('SMTP_PORT')    ?: 587;
$SMTP_USER    = getenv('SMTP_USER')    ?: 'b6b4e5001@smtp-brevo.com';
$SMTP_PASS    = getenv('SMTP_PASS')    ?: 'xsmtpsib-fd8d2aea925067bca7273c6f7bc5c23ccfa37fc120d5639f7052b5c51ce7c025-Ezy2NSAqwX1rLdZ8';
$SMTP_FROM    = getenv('SMTP_FROM')    ?: 'NomiTips <batsindakeynesbenoit10101@gmail.com>';
$ADMIN_EMAIL  = getenv('ADMIN_EMAIL')  ?: 'batsindakeynesbenoit10101@gmail.com';
$SITE_URL     = getenv('SITE_URL')     ?: 'https://nomitips.com';
$DATA_DIR     = __DIR__ . '/data';
$SUBSCRIBERS  = $DATA_DIR . '/subscribers.csv';
$LOGO_URL     = 'https://raw.githubusercontent.com/NomiTips/assets/main/logo-email.png';

// ─── Helper Functions ───────────────────────────────────────
function respond($code, $data) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data);
    exit;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) && strlen($email) <= 254;
}

function is_bot($company) {
    return !empty($company);
}

function save_subscriber($email) {
    global $DATA_DIR, $SUBSCRIBERS;
    if (!is_dir($DATA_DIR)) mkdir($DATA_DIR, 0755, true);
    $file = fopen($SUBSCRIBERS, 'a');
    if ($file) {
        fputcsv($file, ['created_at_utc', 'email']);
        fputcsv($file, [date('c'), $email]);
        fclose($file);
    }
}

// ─── SMTP via PHP Sockets ──────────────────────────────────
function smtp_send($to, $subject, $textBody, $htmlBody) {
    global $SMTP_HOST, $SMTP_PORT, $SMTP_USER, $SMTP_PASS, $SMTP_FROM;

    list($fromName, $fromEmail) = explode(' <', str_replace('>', '', $SMTP_FROM));

    $headers  = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$fromEmail>\r\n";
    $headers .= "To: $to\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/alternative; boundary=\"boundary\"\r\n";
    $headers .= "\r\n";

    $body = "--boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
    $body .= $textBody . "\r\n\r\n";
    $body .= "--boundary\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
    $body .= $htmlBody . "\r\n\r\n";
    $body .= "--boundary--";

    $errno = 0;
    $errstr = '';
    $fp = fsockopen("ssl://$SMTP_HOST", $SMTP_PORT, $errno, $errstr, 30);
    if (!$fp) {
        $fp = fsockopen($SMTP_HOST, $SMTP_PORT, $errno, $errstr, 30);
    }
    if (!$fp) throw new Exception("SMTP connection failed: $errstr");

    $response = fgets($fp, 512);

    // EHLO
    fwrite($fp, "EHLO nomitips.com\r\n");
    while ($response = fgets($fp, 512)) {
        if (strpos($response, '250') === 0 && substr($response, 3, 1) === ' ') break;
    }

    // STARTTLS
    fwrite($fp, "STARTTLS\r\n");
    $response = fgets($fp, 512);
    if (strpos($response, '220') === 0) {
        stream_context_set_option($fp, 'ssl', 'verify_peer', false);
        stream_context_set_option($fp, 'ssl', 'verify_peer_name', false);
        $crypto = stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT);
        if (!$crypto) throw new Exception("TLS failed");

        fwrite($fp, "EHLO nomitips.com\r\n");
        while ($response = fgets($fp, 512)) {
            if (strpos($response, '250') === 0 && substr($response, 3, 1) === ' ') break;
        }
    }

    // AUTH LOGIN
    fwrite($fp, "AUTH LOGIN\r\n");
    fgets($fp, 512);
    fwrite($fp, base64_encode($SMTP_USER) . "\r\n");
    fgets($fp, 512);
    fwrite($fp, base64_encode($SMTP_PASS) . "\r\n");
    $response = fgets($fp, 512);
    if (strpos($response, '235') !== 0) throw new Exception("SMTP auth failed: $response");

    // MAIL FROM
    fwrite($fp, "MAIL FROM:<$fromEmail>\r\n");
    fgets($fp, 512);

    // RCPT TO
    fwrite($fp, "RCPT TO:<$to>\r\n");
    fgets($fp, 512);

    // DATA
    fwrite($fp, "DATA\r\n");
    fgets($fp, 512);
    fwrite($fp, $headers . $body . "\r\n.\r\n");
    fgets($fp, 512);

    // QUIT
    fwrite($fp, "QUIT\r\n");
    fclose($fp);

    return true;
}

// ─── Email Templates ────────────────────────────────────────
function subscriber_email($email) {
    global $SITE_URL, $LOGO_URL;
    $url = htmlspecialchars($SITE_URL, ENT_QUOTES);
    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0f0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0f0d;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#111a14;border-radius:16px;border:1px solid #1e2e24;overflow:hidden;">

        <!-- Logo -->
        <tr><td align="center" style="padding:40px 30px 20px;">
          <img src="$LOGO_URL" alt="NomiTips" width="200" style="max-width:200px;height:auto;display:block;margin:0 auto;">
        </td></tr>

        <tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,#28b968,transparent);"></div></td></tr>

        <!-- Content -->
        <tr><td style="padding:30px 40px 10px;">
          <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">Welcome to the Family 🎉</h1>
          <p style="margin:0 0 16px;font-size:16px;color:#a8c4b8;line-height:1.7;">
            You're officially on the NomiTips early access list. We're building something special — a premium fitness experience designed specifically for women who want real, lasting results.
          </p>
        </td></tr>

        <!-- What's Coming -->
        <tr><td style="padding:10px 40px;">
          <div style="background-color:#0d1610;border:1px solid #1e2e24;border-radius:12px;padding:24px;">
            <p style="margin:0 0 14px;font-size:14px;color:#28b968;font-weight:700;letter-spacing:1px;text-transform:uppercase;">What's Coming</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Custom workout programs</td></tr>
              <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; 1-on-1 coaching support</td></tr>
              <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Nutrition planning tools</td></tr>
              <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Progress tracking & analytics</td></tr>
              <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Community & transformation support</td></tr>
            </table>
          </div>
        </td></tr>

        <!-- Bonus Card -->
        <tr><td style="padding:20px 40px 10px;">
          <div style="background:linear-gradient(135deg,#0d1610 0%,#142218 100%);border:1px solid #28b968;border-radius:12px;padding:24px;text-align:center;">
            <p style="margin:0 0 8px;font-size:24px;">🎁</p>
            <p style="margin:0 0 8px;font-size:16px;color:#ffffff;font-weight:700;">Early Subscriber Exclusive</p>
            <p style="margin:0;font-size:14px;color:#28b968;font-weight:600;">You'll receive a special launch reward when we go live</p>
          </div>
        </td></tr>

        <!-- CTA -->
        <tr><td align="center" style="padding:30px 40px;">
          <a href="$url" style="display:inline-block;background-color:#28b968;color:#0a0f0d;text-decoration:none;border-radius:10px;padding:14px 32px;font-size:15px;font-weight:700;">Visit NomiTips</a>
        </td></tr>

        <tr><td style="padding:0 40px 10px;"><div style="height:1px;background-color:#1e2e24;"></div></td></tr>
        <tr><td style="padding:10px 40px 30px;">
          <p style="margin:0 0 8px;font-size:12px;color:#4a6356;text-align:center;">You're receiving this because you joined the NomiTips launch list.</p>
          <p style="margin:0;font-size:12px;color:#4a6356;text-align:center;">NomiTips &copy; 2026 &middot; All rights reserved</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    $text = "Welcome to NomiTips Early Access!\n\nYou're officially on the early access list.\n\nWHAT'S COMING:\n• Custom workout programs\n• 1-on-1 coaching support\n• Nutrition planning tools\n• Progress tracking & analytics\n\nVisit: $url\n";
    return ['text' => $text, 'html' => $html];
}

function admin_email($email) {
    global $LOGO_URL;
    $safe = htmlspecialchars($email, ENT_QUOTES);
    $date = date('Y-m-d H:i:s');
    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0a0f0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0f0d;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#111a14;border-radius:16px;border:1px solid #1e2e24;overflow:hidden;">
        <tr><td style="padding:30px 40px;">
          <p style="margin:0 0 4px;font-size:11px;color:#4a6356;letter-spacing:2px;text-transform:uppercase;">NomiTips Admin</p>
          <h1 style="margin:0 0 20px;font-size:22px;color:#ffffff;">New Early Access Signup</h1>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0d1610;border:1px solid #1e2e24;border-radius:10px;">
            <tr><td style="padding:14px 16px;color:#4a6356;width:100px;font-size:14px;">Email</td><td style="padding:14px 16px;color:#ffffff;font-weight:600;font-size:14px;">$safe</td></tr>
            <tr><td style="padding:14px 16px;color:#4a6356;border-top:1px solid #1e2e24;font-size:14px;">Date</td><td style="padding:14px 16px;color:#ffffff;border-top:1px solid #1e2e24;font-size:14px;">$date</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    $text = "New NomiTips early access subscriber\n\nEmail: $email\nDate: $date\n";
    return ['text' => $text, 'html' => $html];
}

// ─── Handle Request ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false, 'error' => 'POST only.']);
}

$company = $_POST['company'] ?? '';
if (is_bot($company)) {
    respond(200, ['success' => true]);
}

$email = strtolower(trim($_POST['email'] ?? ''));
if (!validate_email($email)) {
    respond(400, ['success' => false, 'error' => 'Please enter a valid email address.']);
}

try {
    save_subscriber($email);

    $sub = subscriber_email($email);
    smtp_send($email, "You're on the NomiTips Early Access List 🎉", $sub['text'], $sub['html']);

    $adm = admin_email($email);
    smtp_send($ADMIN_EMAIL, "New Early Access Signup — NomiTips", $adm['text'], $adm['html']);

    respond(200, ['success' => true]);
} catch (Exception $e) {
    error_log("NomiTips subscribe error: " . $e->getMessage());
    respond(500, ['success' => false, 'error' => 'Something went wrong. Please try again.']);
}
