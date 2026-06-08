// Resend transactional email — server-only.
// Uses the HTTP API directly (no SDK dep needed).
// Docs: https://resend.com/docs/api-reference/emails/send-email

import "server-only";

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "PRAP <noreply@prap.in>";
const ENDPOINT = "https://api.resend.com/emails";

export class ResendError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export function isResendConfigured(): boolean {
  return Boolean(API_KEY && API_KEY.startsWith("re_"));
}

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tag?: string;
};

export async function sendEmail(args: SendArgs): Promise<{ id: string }> {
  if (!API_KEY) {
    // Soft-fail: log but don't break flows that fire email "best effort".
    console.warn(`[resend] RESEND_API_KEY missing — skipping email "${args.subject}"`);
    return { id: "noop" };
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: Array.isArray(args.to) ? args.to : [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
      reply_to: args.replyTo,
      tags: args.tag ? [{ name: "category", value: args.tag }] : undefined,
    }),
    cache: "no-store",
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || !json?.id) {
    throw new ResendError(res.status, json?.message || `Resend send failed (HTTP ${res.status})`, json);
  }
  return { id: json.id };
}

// ---------- Templates ----------
// Minimal inline-styled HTML. Modern email clients hate <style> tags.

function wrap(content: string) {
  return `<!doctype html>
  <html><body style="margin:0;padding:0;background:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1f18">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:32px 0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ecece4;border-radius:16px;overflow:hidden;max-width:92%">
        <tr><td style="padding:24px 32px;border-bottom:1px solid #ecece4">
          <span style="display:inline-block;font-weight:800;font-size:18px;color:#1B4332">PRAP<span style="color:#A3B18A">.</span></span>
        </td></tr>
        <tr><td style="padding:32px">${content}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #ecece4;font-size:12px;color:#6b6f63">
          PRAP Technologies Pvt. Ltd. · Noida, Uttar Pradesh, India<br/>
          You're receiving this because you signed up for PRAP.
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#1B4332;color:#fff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px">${label}</a>`;

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  role: string;
  coins: number;
}) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://prap.in"}/dashboard`;
  const html = wrap(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#1B4332">Welcome to PRAP, ${opts.name} 👋</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
      Your account is live as a <strong>${opts.role}</strong>.
      We've credited <strong>${opts.coins.toLocaleString("en-IN")} PRAP Coins</strong> (≈ ₹${opts.coins.toLocaleString("en-IN")}) to your wallet.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px">
      Visit a RERA-verified project, complete your first site visit, and you'll earn another <strong>10,000 coins</strong>.
      Book your home — pay 50% — and unlock redemption to your bank.
    </p>
    <p>${btn(dashboardUrl, "Open your dashboard →")}</p>
    <p style="font-size:13px;color:#6b6f63;margin-top:24px">Need help? Just reply to this email — we read every message.</p>
  `);
  return sendEmail({
    to: opts.to,
    subject: `Welcome to PRAP — ${opts.coins.toLocaleString("en-IN")} coins credited`,
    html,
    tag: "welcome",
  });
}

export async function sendPaymentReceipt(opts: {
  to: string;
  name: string;
  projectName: string;
  milestone: string;
  grossInr: number;
  coinDiscountInr: number;
  netInr: number;
  rzpPaymentId: string;
}) {
  const html = wrap(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#1B4332">Payment receipt</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
      Hi ${opts.name}, we've received your ${opts.milestone} milestone payment for <strong>${opts.projectName}</strong>.
    </p>
    <table style="width:100%;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:8px 0;color:#6b6f63">Gross</td><td align="right" style="padding:8px 0">₹${opts.grossInr.toLocaleString("en-IN")}</td></tr>
      <tr><td style="padding:8px 0;color:#6b6f63">Coin discount</td><td align="right" style="padding:8px 0">− ₹${opts.coinDiscountInr.toLocaleString("en-IN")}</td></tr>
      <tr><td style="padding:12px 0;font-weight:700;border-top:1px solid #ecece4">Paid</td><td align="right" style="padding:12px 0;font-weight:700;border-top:1px solid #ecece4">₹${opts.netInr.toLocaleString("en-IN")}</td></tr>
    </table>
    <p style="font-size:12px;color:#6b6f63;margin-top:16px">Razorpay payment ID: <span style="font-family:monospace">${opts.rzpPaymentId}</span></p>
  `);
  return sendEmail({
    to: opts.to,
    subject: `Receipt · ${opts.projectName} · ${opts.milestone}`,
    html,
    tag: "receipt",
  });
}

export async function sendRedemptionConfirmation(opts: {
  to: string;
  name: string;
  amountInr: number;
  method: "upi" | "bank";
  destination: string;
}) {
  const html = wrap(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#1B4332">Redemption initiated</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
      Hi ${opts.name}, we're sending <strong>₹${opts.amountInr.toLocaleString("en-IN")}</strong> to your
      ${opts.method.toUpperCase()} <span style="font-family:monospace">${opts.destination}</span>.
      Funds usually land within 24 banking hours.
    </p>
  `);
  return sendEmail({
    to: opts.to,
    subject: `₹${opts.amountInr.toLocaleString("en-IN")} on its way`,
    html,
    tag: "redemption",
  });
}

export async function sendCorporateReferralCode(opts: {
  to: string;
  name: string;
  code: string;
}) {
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://prap.in"}/auth/signup?ref=${opts.code}`;
  const html = wrap(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#1B4332">Your referral code is live</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
      Hi ${opts.name}, your unique PRAP corporate referral code:
    </p>
    <p style="font-family:monospace;font-size:24px;font-weight:800;color:#1B4332;background:#f1f6f3;padding:16px 24px;border-radius:12px;text-align:center">${opts.code}</p>
    <p style="font-size:15px;line-height:1.6;margin:16px 0 24px">
      Share this with employees & partners. You earn <strong>5,000 PRAP Coins</strong> every time a referred
      user completes a site visit (first two visits).
    </p>
    <p>${btn(shareUrl, "Copy share link")}</p>
  `);
  return sendEmail({
    to: opts.to,
    subject: `Your PRAP referral code: ${opts.code}`,
    html,
    tag: "referral-code",
  });
}
