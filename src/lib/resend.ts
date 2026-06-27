// Resend transactional email — server-only.
// Uses the HTTP API directly (no SDK dep needed).
// Docs: https://resend.com/docs/api-reference/emails/send-email

import "server-only";

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "PRAP <noreply@prap.in>";
const ENDPOINT = "https://api.resend.com/emails";

// Where replies and unsubscribe requests go. A real, monitored reply-to address
// improves sender reputation (silent no-reply senders are downranked).
const REPLY_TO = process.env.EMAIL_REPLY_TO || "support@prap.in";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://prap.in";

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
  // Set false for one-to-one transactional mail (receipts, password resets) that
  // legally need no unsubscribe. Defaults to true so marketing-ish mail (welcome,
  // referral) carries List-Unsubscribe headers required by Gmail/Yahoo.
  unsubscribe?: boolean;
};

/** Derive a plain-text body from HTML. A missing text/plain part is a strong
 *  spam signal (Gmail/Outlook downrank HTML-only mail), so we always send one. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<\/(p|div|tr|h1|h2|h3|li|table)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** True if the address has opted out of marketing email. Best-effort: any error
 *  (incl. a missing email_optouts table) is treated as "not suppressed". */
async function isSuppressed(email: string): Promise<boolean> {
  try {
    // Lazy import keeps this module usable in contexts without the admin client.
    const { supabaseAdmin } = await import("@/lib/supabase-server");
    const { data } = await supabaseAdmin()
      .from("email_optouts")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function sendEmail(args: SendArgs): Promise<{ id: string }> {
  if (!API_KEY) {
    // Soft-fail: log but don't break flows that fire email "best effort".
    console.warn(`[resend] RESEND_API_KEY missing — skipping email "${args.subject}"`);
    return { id: "noop" };
  }

  // Respect unsubscribes for marketing-ish mail. Transactional mail
  // (unsubscribe === false) is always delivered. Only checked for single
  // recipients — bulk arrays are assumed pre-filtered by the caller.
  if (args.unsubscribe !== false && typeof args.to === "string") {
    if (await isSuppressed(args.to)) {
      console.warn(`[resend] recipient opted out — skipping "${args.subject}"`);
      return { id: "suppressed" };
    }
  }
  // Deliverability headers. List-Unsubscribe (+ One-Click) is effectively
  // mandatory for bulk senders under Gmail/Yahoo's 2024 rules; omitting it is a
  // strong spam signal. We add it to all but explicitly one-to-one mail.
  const headers: Record<string, string> = {};
  if (args.unsubscribe !== false) {
    const unsubUrl = `${SITE_URL}/api/email/unsubscribe?e=${encodeURIComponent(
      Array.isArray(args.to) ? args.to[0] : args.to,
    )}`;
    headers["List-Unsubscribe"] = `<${unsubUrl}>, <mailto:${REPLY_TO}?subject=unsubscribe>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
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
      // Always include a plain-text alternative for deliverability.
      text: args.text || htmlToText(args.html),
      // A monitored reply-to beats a silent no-reply for reputation.
      reply_to: args.replyTo || REPLY_TO,
      headers: Object.keys(headers).length ? headers : undefined,
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
    <h1 style="font-size:22px;margin:0 0 8px;color:#1B4332">Welcome to PRAP, ${opts.name}</h1>
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
    subject: `Welcome to PRAP, ${opts.name}`,
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
    subject: `Your payment receipt for ${opts.projectName}`,
    html,
    tag: "receipt",
    unsubscribe: false, // transactional — buyer needs this regardless
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
    subject: `Your PRAP redemption of ₹${opts.amountInr.toLocaleString("en-IN")} is being processed`,
    html,
    tag: "redemption",
    unsubscribe: false, // transactional payout confirmation
  });
}

export async function sendQueryAck(opts: { to: string; name: string; intent?: string }) {
  const html = wrap(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#1B4332">Thank you for reaching out</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
      Hi ${opts.name}, thank you for querying on our platform${opts.intent ? ` regarding <strong>${opts.intent}</strong>` : ""}.
      Our team has received your request and we will shortly reach out to you soon.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 8px">
      In the meantime, you can explore RERA-verified projects and your PRAP Coin rewards on our website.
    </p>
    <p style="font-size:13px;color:#6b6f63;margin-top:24px">— Team PRAP</p>
  `);
  return sendEmail({
    to: opts.to,
    subject: "We received your query — PRAP will reach out soon",
    html,
    tag: "query-ack",
    unsubscribe: false, // direct reply to a user-initiated contact request
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
