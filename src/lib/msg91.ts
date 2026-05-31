// MSG91 OTP integration (https://msg91.com).
// Uses the dedicated OTP API: https://control.msg91.com/api/v5/otp
//
// Dev mode: set MSG91_DEV_BYPASS=true in .env.local and the fixed OTP
// in MSG91_DEV_OTP (default "123456") will be accepted without ever
// hitting MSG91. Use this while you wait on DLT/KYC clearance.

import "server-only";

const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const SENDER_ID = process.env.MSG91_SENDER_ID || "PRAPIN";
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

function requireKey() {
  if (!AUTH_KEY) throw new Msg91Error(500, "MSG91_AUTH_KEY not configured");
  return AUTH_KEY;
}

export function normalizeMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
}

type Json = Record<string, any>;
async function call(url: string, init: RequestInit & { timeout?: number } = {}): Promise<Json> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), init.timeout ?? 10_000);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        authkey: requireKey(),
        ...(init.headers || {}),
      },
      cache: "no-store",
    });
    const text = await res.text();
    let json: Json = {};
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    // Verbose logging so we can debug "OTP not sending" issues from the terminal.
    if (!res.ok || (json?.type && json.type !== "success")) {
      console.error("[MSG91] %s %s -> %s %j", init.method || "POST", url, res.status, json);
      throw new Msg91Error(
        res.status,
        json?.message || `MSG91 call failed (HTTP ${res.status})`,
        json,
      );
    }
    console.log("[MSG91] %s -> ok", url);
    return json;
  } finally {
    clearTimeout(t);
  }
}

export async function sendOtp(mobile: string) {
  const m = normalizeMobile(mobile);

  if (DEV_BYPASS) {
    console.warn(`[MSG91 DEV BYPASS] Pretending to send OTP "${DEV_OTP}" to +${m}`);
    return { ok: true, mobile: m, requestId: "dev-bypass", raw: { bypass: true } };
  }

  const params = new URLSearchParams({
    mobile: m,
    otp_length: String(OTP_LENGTH),
    otp_expiry: String(OTP_EXPIRY_MIN),
    sender: SENDER_ID,
  });
  if (TEMPLATE_ID) params.set("template_id", TEMPLATE_ID);
  const r = await call(`${BASE}?${params.toString()}`, { method: "POST" });
  return { ok: true, mobile: m, requestId: r?.request_id ?? null, raw: r };
}

export async function resendOtp(mobile: string, voice = false) {
  if (DEV_BYPASS) return { ok: true, raw: { bypass: true } };
  const params = new URLSearchParams({
    mobile: normalizeMobile(mobile),
    retrytype: voice ? "voice" : "text",
  });
  const r = await call(`${BASE}/retry?${params.toString()}`, { method: "POST" });
  return { ok: true, raw: r };
}

export async function verifyOtp(mobile: string, otp: string) {
  if (DEV_BYPASS) {
    const ok = otp === DEV_OTP;
    console.warn(`[MSG91 DEV BYPASS] verifyOtp ${ok ? "ACCEPTED" : "REJECTED"} for +${normalizeMobile(mobile)}`);
    return { ok, message: ok ? "OTP verified (bypass)" : "Invalid OTP (bypass)", raw: { bypass: true } };
  }
  const params = new URLSearchParams({ mobile: normalizeMobile(mobile), otp });
  const r = await call(`${BASE}/verify?${params.toString()}`, { method: "GET" });
  return { ok: r?.type === "success", message: r?.message, raw: r };
}
