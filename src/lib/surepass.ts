// Surepass.io KYC integration.
// Docs: https://docs.surepass.io/  (account-specific token required)
//
// Auth model: a single Bearer token issued in the Surepass dashboard.
// IMPORTANT: this module MUST only be called from server code (route handlers
// or server actions). Never bundle SUREPASS_TOKEN into the browser.

import "server-only";

const BASE_URL = process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.io/api/v1";
const TOKEN = process.env.SUREPASS_TOKEN;

export class SurepassError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function call<T = any>(path: string, body: unknown, timeoutMs = 12000): Promise<T> {
  if (!TOKEN) {
    throw new SurepassError(500, "SUREPASS_TOKEN not configured");
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      const msg =
        json?.message ||
        json?.message_code ||
        json?.error ||
        `Surepass call to ${path} failed (HTTP ${res.status})`;
      throw new SurepassError(res.status, msg, json);
    }
    return json as T;
  } finally {
    clearTimeout(t);
  }
}

// ---------- PAN ----------
// Verifies the PAN exists with NSDL and returns full name on PAN.
export async function verifyPan(panNumber: string) {
  const r = await call<any>("/pan/pan", { id_number: panNumber });
  const d = r?.data ?? {};
  return {
    raw: r,
    valid: Boolean(d?.pan_number) && (d?.aadhaar_seeding_status === "Y" || d?.full_name),
    panNumber: d?.pan_number ?? panNumber,
    fullName: d?.full_name ?? null,
    aadhaarSeeded: d?.aadhaar_seeding_status === "Y",
    category: d?.category ?? null,
  };
}

// ---------- AADHAAR (OTP-based) ----------
// Step 1: generate an OTP — UIDAI sends SMS to the holder's registered mobile.
export async function aadhaarGenerateOtp(aadhaarNumber: string) {
  const r = await call<any>("/aadhaar-v2/generate-otp", { id_number: aadhaarNumber });
  return {
    raw: r,
    clientId: r?.data?.client_id as string,
    otpSent: Boolean(r?.data?.otp_sent ?? true),
    message: r?.message ?? "OTP sent",
  };
}

// Step 2: submit the OTP — Surepass returns the full Aadhaar profile.
export async function aadhaarSubmitOtp(clientId: string, otp: string) {
  const r = await call<any>("/aadhaar-v2/submit-otp", { client_id: clientId, otp });
  const d = r?.data ?? {};
  return {
    raw: r,
    valid: Boolean(d?.aadhaar_number),
    aadhaarNumber: d?.aadhaar_number ?? null,   // masked / last-4 only on most plans
    fullName: d?.full_name ?? null,
    dob: d?.dob ?? null,
    gender: d?.gender ?? null,
    address: d?.address ?? null,
    photoBase64: d?.profile_image ?? null,
  };
}

// ---------- RERA ----------
// Two flavours: agent (broker) lookup and project lookup.
// Different Surepass plans expose slightly different paths; we try the common ones.
export async function verifyReraAgent(reraNumber: string, state = "UP") {
  // Most accounts use this endpoint; if your account is on a different SKU,
  // change to "/corporate/rera" or "/rera-verification/agent" in the dashboard.
  const r = await call<any>("/corporate/rera-agent", {
    id_number: reraNumber,
    state_code: state,
  });
  const d = r?.data ?? {};
  return {
    raw: r,
    valid: Boolean(d?.name || d?.agent_name),
    name: d?.name ?? d?.agent_name ?? null,
    status: d?.status ?? null,
    validUntil: d?.validity ?? d?.valid_upto ?? null,
    state: d?.state ?? state,
  };
}

export async function verifyReraProject(reraNumber: string, state = "UP") {
  const r = await call<any>("/corporate/rera-project", {
    id_number: reraNumber,
    state_code: state,
  });
  const d = r?.data ?? {};
  return {
    raw: r,
    valid: Boolean(d?.project_name),
    projectName: d?.project_name ?? null,
    promoter: d?.promoter_name ?? null,
    status: d?.project_status ?? d?.status ?? null,
    validUntil: d?.validity ?? null,
  };
}

// ---------- BANK / UPI (used during payout verification) ----------
export async function verifyBankAccount(ifsc: string, accountNumber: string, name?: string) {
  const r = await call<any>("/bank-verification/", {
    id_number: accountNumber,
    ifsc,
    ifsc_details: true,
    name,
  });
  const d = r?.data ?? {};
  return {
    raw: r,
    valid: Boolean(d?.account_exists),
    accountName: d?.full_name ?? null,
    bank: d?.ifsc_details?.bank ?? null,
    branch: d?.ifsc_details?.branch ?? null,
  };
}

export async function verifyUpi(upiId: string) {
  const r = await call<any>("/upi/upi-validation", { upi_id: upiId });
  const d = r?.data ?? {};
  return {
    raw: r,
    valid: Boolean(d?.account_exists ?? d?.valid),
    name: d?.full_name ?? d?.customer_name ?? null,
  };
}
