// MSG91 OTP Widget — server-side access-token validator.
// The browser-side widget verifies the user's OTP with MSG91 and returns
// an opaque `access-token`. We exchange it here for proof that the phone
// number was indeed verified.
//
// Endpoint: POST https://api.msg91.com/api/v5/widget/verifyAccessToken
//   body: { authkey: <MSG91_AUTH_KEY>, "access-token": <client-token> }
//   ok:   { type: "success", message: "Token validated successfully" }
//   fail: { type: "error",   message: "..." }
//
// Docs: https://docs.msg91.com/widget-quick-start

import "server-only";

const AUTH_KEY = process.env.MSG91_AUTH_KEY;
// MSG91's dashboard sample uses this host. Both `api.msg91.com` and
// `control.msg91.com` resolve, but the integration page recommends `control`.
const ENDPOINT = "https://control.msg91.com/api/v5/widget/verifyAccessToken";

export class WidgetVerifyError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export async function verifyWidgetAccessToken(accessToken: string): Promise<{
  ok: boolean;
  message: string;
  raw: any;
}> {
  if (!AUTH_KEY) {
    throw new WidgetVerifyError(500, "MSG91_AUTH_KEY not configured");
  }
  if (!accessToken || accessToken.length < 10) {
    throw new WidgetVerifyError(400, "Missing access token");
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authkey: AUTH_KEY,
        "access-token": accessToken,
      }),
      signal: ctrl.signal,
      cache: "no-store",
    });
    const text = await res.text();
    let json: any = {};
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    const ok = res.ok && json?.type === "success";
    if (!ok) {
      console.error("[MSG91 WIDGET] verify failed:", res.status, json);
      throw new WidgetVerifyError(
        res.status,
        json?.message || `Widget token verify failed (HTTP ${res.status})`,
        json,
      );
    }
    return { ok: true, message: json?.message || "ok", raw: json };
  } finally {
    clearTimeout(t);
  }
}
