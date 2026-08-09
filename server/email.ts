import nodemailer from "nodemailer";
import QRCode from "qrcode";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function getSiteBaseUrl(): string {
  // Prefer explicit config, fall back to Replit domain
  if (process.env.SITE_BASE_URL) return process.env.SITE_BASE_URL.replace(/\/$/, "");
  if (process.env.REPLIT_DOMAINS) return `https://${process.env.REPLIT_DOMAINS.split(",")[0].trim()}`;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return "https://einvite.me";
}

export async function sendGalleryQrEmail(opts: {
  to: string;
  eventName: string;
  sessionId: string;
}): Promise<void> {
  const transport = createTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) — skipping gallery QR email");
    return;
  }

  const baseUrl = getSiteBaseUrl();
  const uploadUrl = `${baseUrl}/gallery/${opts.sessionId}`;
  const displayUrl = `${baseUrl}/gallery/${opts.sessionId}/display`;

  // Generate QR code as a PNG buffer pointing to the guest upload page
  const qrBuffer = await QRCode.toBuffer(uploadUrl, {
    type: "png",
    width: 300,
    margin: 2,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const subject = `Your Live Gallery QR Code — ${opts.eventName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                📸 Your Live Gallery is Ready
              </h1>
              <p style="margin:8px 0 0;color:#a0aec0;font-size:14px;">${opts.eventName}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#2d3748;font-size:16px;line-height:1.6;">
                Great news! Your <strong>QR Code Photo Sharing</strong> gallery is live and ready for your event.
                Share the QR code below with your guests so they can upload photos directly from their phones.
              </p>

              <!-- QR Code -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="background:#f7f8fc;border-radius:12px;padding:32px;">
                    <p style="margin:0 0 16px;color:#4a5568;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">
                      Guest Upload QR Code
                    </p>
                    <img src="cid:qr-code" alt="QR Code" width="200" style="display:block;border-radius:8px;" />
                    <p style="margin:16px 0 0;color:#718096;font-size:13px;">
                      Guests scan this to upload photos
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Links -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 6px;color:#4a5568;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">
                      🔗 Guest Upload Link
                    </p>
                    <p style="margin:0 0 10px;color:#718096;font-size:13px;">Share this link with guests who need to upload photos without scanning the QR code.</p>
                    <a href="${uploadUrl}" style="color:#4f46e5;font-size:14px;word-break:break-all;">${uploadUrl}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#4a5568;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">
                      🖥️ Display Screen URL
                    </p>
                    <p style="margin:0 0 10px;color:#718096;font-size:13px;">Open this on a large screen at your event to show the live photo feed as guests upload.</p>
                    <a href="${displayUrl}" style="color:#4f46e5;font-size:14px;word-break:break-all;">${displayUrl}</a>
                  </td>
                </tr>
              </table>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="padding:4px;">
                    <a href="${displayUrl}" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                      Open Display Screen →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#a0aec0;font-size:13px;line-height:1.6;border-top:1px solid #e2e8f0;padding-top:24px;">
                These links are specific to your event and do not require a login.
                If you have any questions, reply to this email or contact us at <a href="mailto:info@einvite.me" style="color:#4f46e5;">info@einvite.me</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f8fc;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#a0aec0;font-size:12px;">© ${new Date().getFullYear()} eInvite.me · All rights reserved</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await transport.sendMail({
    from: fromEmail,
    to: opts.to,
    subject,
    html,
    attachments: [
      {
        filename: "gallery-qr-code.png",
        content: qrBuffer,
        cid: "qr-code",
      },
    ],
  });

  console.log(`[email] Sent gallery QR code email to ${opts.to} for session ${opts.sessionId}`);
}
