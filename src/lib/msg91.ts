// MSG91 OTP integration — direct API path (no widget).
// Endpoints:
//   POST https://control.msg91.com/api/v5/otp           (send)
//   POST https://control.msg91.com/api/v5/otp/verify    (verify)
//   POST https://control.msg91.com/api/v5/otp/retry     (resend)
//
// Auth: `authkey` header.
// Required: `template_id` (DLT-linked template configured in MSG91 dashboard).
//
// SERVER-ONLY. Never import in a Client Component.

import "server-only";

const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const OTP_LENGTH = Number(process.env.MSG91_OTP_LENGTH || 6);
const OTP_EXPIRY_MIN = Number(process.env.MSG91_OTP_EXPIRY_MIN || 5);
const BASE = "https://control.msg91.com/api/v5/otp";

const DEV_BYPASS = process.env.MSG91_DEV_BYPASS === "true";
const DEV_OTP = process.env.MSG91_DEV_OTP || "123456";

export class Msg91Error extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

/** Normalize an Indian phone to MSG91's expected `91XXXXXXXXXX` (no `+`). */
export function normalizeMobile(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("91") && d.length === 12) return d;
  if (d.length === 10) return `91${d}`;
  if (d.startsWith("0") && d.length === 11) return `91${d.slice(1)}`;
  return d;
}

type Json = Record<string, any>;
async function call(
  path: string,
  body: Json | null,
  method: "POST" | "GET" = "POST",
  timeoutMs = 10_000,
): Promise<Json> {
  if (!AUTH_KEY) throw new Msg91Error(500, "MSG91_AUTH_KEY not configured");

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authkey: AUTH_KEY,
      },
      body: body && method !== "GET" ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      cache: "no-store",
    });

    const text = await res.text();
    let json: Json = {};
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    const ok = res.ok && json?.type !== "error";
    if (!ok) {
      console.error("[MSG91] %s %s -> %s %j", method, `${BASE}${path}`, res.status, json);
      throw new Msg91Error(
        res.status,
        json?.message || `MSG91 ${path} failed (HTTP ${res.status})`,
        json,
      );
    }
    return json;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Send an OTP. MSG91 generates and stores the code on their side.
 * Body uses the official documented JSON shape.
 */
export async function sendOtp(mobile: string) {
  const m = normalizeMobile(mobile);

  if (DEV_BYPASS) {
    console.warn(`[MSG91 DEV BYPASS] Pretending to send OTP "${DEV_OTP}" to +${m}`);
    return { ok: true, mobile: m, requestId: "dev-bypass", raw: { bypass: true } };
  }

  if (!TEMPLATE_ID) {
    throw new Msg91Error(
      500,
      "MSG91_TEMPLATE_ID is not configured. Set it in .env.local to the template ID from your MSG91 dashboard.",
    );
  }

  const body = {
    template_id: TEMPLATE_ID,
    mobile: m,
    otp_length: OTP_LENGTH,
    otp_expiry: OTP_EXPIRY_MIN,
  };

  const r = await call("", body, "POST");
  return { ok: true, mobile: m, requestId: r?.request_id ?? null, raw: r };
}

/** Resend the same OTP. `channel`: "text" (SMS) or "voice". */
export async function resendOtp(mobile: string, channel: "text" | "voice" = "text") {
  if (DEV_BYPASS) return { ok: true, raw: { bypass: true } };

  const params = new URLSearchParams({
    mobile: normalizeMobile(mobile),
    retrytype: channel,
  });
  const r = await call(`/retry?${params.toString()}`, null, "POST");
  return { ok: true, raw: r };
}

/** Verify the OTP entered by the user. */
export async function verifyOtp(mobile: string, otp: string) {
  if (DEV_BYPASS) {
    const ok = otp === DEV_OTP;
    console.warn(`[MSG91 DEV BYPASS] verifyOtp ${ok ? "ACCEPTED" : "REJECTED"} for +${normalizeMobile(mobile)}`);
    return {
      ok,
      message: ok ? "OTP verified (bypass)" : "Invalid OTP (bypass)",
      raw: { bypass: true },
    };
  }

  const params = new URLSearchParams({ mobile: normalizeMobile(mobile), otp });
  const r = await call(`/verify?${params.toString()}`, null, "GET");
  return { ok: r?.type === "success", message: r?.message, raw: r };
}
