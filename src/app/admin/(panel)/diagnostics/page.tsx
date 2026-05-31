"use client";
import { useState } from "react";
import { Loader2, Send, Check, AlertTriangle, RefreshCw } from "lucide-react";

type Result = {
  ok?: boolean;
  action?: string;
  env?: Record<string, any>;
  normalized?: string;
  provider?: any;
  error?: any;
  status?: number;
  raw?: string;
};

export default function DiagnosticsPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [last, setLast] = useState<Result | null>(null);

  async function call(action: "send" | "verify") {
    setBusy(action);
    setLast(null);
    try {
      const res = await fetch("/api/admin/diagnostics/msg91", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, phone, otp }),
      });
      const text = await res.text();
      let body: any = {};
      try { body = JSON.parse(text); } catch { body = { raw: text }; }
      setLast({ ...body, status: res.status });
    } catch (e: any) {
      setLast({ ok: false, error: e?.message || String(e), status: 0 });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Diagnostics — MSG91</h1>
        <p className="mt-2 text-ink-500">
          Test the SMS pipeline without going through the signup form. The full
          MSG91 response (including errors) is shown below.
        </p>
      </header>

      <section className="card p-6">
        <h2 className="font-bold">Send OTP</h2>
        <p className="text-sm text-ink-500 mt-1">
          Set <code>MSG91_DEV_BYPASS=false</code> in <code>.env.local</code> and
          restart dev to test a real send.
        </p>
        <div className="mt-4 grid sm:grid-cols-[1fr_auto] gap-3">
          <input
            className="input"
            placeholder="Your phone (10 digits or +91…)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={() => call("send")}
            disabled={busy !== null || phone.length < 8}
            className="btn-primary"
          >
            {busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send OTP
          </button>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-bold">Verify OTP</h2>
        <p className="text-sm text-ink-500 mt-1">
          After sending, enter the code that arrived (or the dev-bypass code).
        </p>
        <div className="mt-4 grid sm:grid-cols-[1fr_140px_auto] gap-3">
          <input className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input
            className="input tracking-[0.4em] text-center font-bold"
            placeholder="123456"
            value={otp}
            inputMode="numeric"
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
          />
          <button
            onClick={() => call("verify")}
            disabled={busy !== null || phone.length < 8 || otp.length < 4}
            className="btn-outline"
          >
            {busy === "verify" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Verify
          </button>
        </div>
      </section>

      {last && (
        <section className={`card p-6 ${last.ok ? "border-emerald-200" : "border-rose-200"}`}>
          <div className="flex items-center gap-2 mb-3">
            {last.ok ? (
              <span className="badge !bg-emerald-50 !text-emerald-700">
                <Check className="h-3.5 w-3.5" /> OK · HTTP {last.status}
              </span>
            ) : (
              <span className="badge !bg-rose-50 !text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5" /> Failed · HTTP {last.status}
              </span>
            )}
            {last.action && <span className="badge">{last.action}</span>}
            {last.env?.bypass && <span className="badge !bg-amber-50 !text-amber-700">DEV BYPASS active</span>}
          </div>

          {last.env && (
            <div className="mt-2 grid sm:grid-cols-2 gap-2 text-xs">
              <Kv k="MSG91_SENDER_ID" v={last.env.sender} />
              <Kv k="MSG91_TEMPLATE_ID" v={last.env.templateId} />
              <Kv k="MSG91_AUTH_KEY set?" v={last.env.hasAuthKey ? `yes (${last.env.authKeyPrefix})` : "NO"} />
              <Kv k="Normalized phone" v={last.normalized || "—"} />
            </div>
          )}

          {last.error && (
            <p className="mt-4 text-sm text-rose-800">
              <strong>Error:</strong> {typeof last.error === "string" ? last.error : JSON.stringify(last.error)}
            </p>
          )}

          <details className="mt-4" open>
            <summary className="cursor-pointer text-sm font-semibold">Raw provider response</summary>
            <pre className="mt-2 rounded-lg bg-ink-950 text-ink-100 p-4 text-xs overflow-x-auto">
{JSON.stringify(last.provider ?? last, null, 2)}
            </pre>
          </details>
        </section>
      )}

      <section className="card p-6 bg-ink-50/60">
        <h2 className="font-bold flex items-center gap-2"><RefreshCw className="h-4 w-4" /> How to read the result</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-700 list-disc pl-5">
          <li><strong>HTTP 200 + ok: true</strong> — MSG91 accepted the send. Check your phone.</li>
          <li><strong>"Please provide template_id"</strong> — your account needs a DLT template. Create one in MSG91 → OTP product → Templates, then paste the ID into <code>MSG91_TEMPLATE_ID</code>.</li>
          <li><strong>"Authkey is invalid"</strong> — wrong/expired key. Regenerate in MSG91 → API and update <code>MSG91_AUTH_KEY</code>.</li>
          <li><strong>"Sender id is not approved"</strong> — your <code>MSG91_SENDER_ID</code> is not registered. Either register the same 6-letter sender in MSG91, or change the env to match an approved one.</li>
          <li><strong>"User KYC pending"</strong> — complete your MSG91 KYC at the top of the dashboard.</li>
          <li><strong>"DND blocked"</strong> — the test phone has DND. Use a different number or whitelist it in MSG91 → DND.</li>
        </ul>
      </section>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: any }) {
  return (
    <div className="rounded-lg bg-ink-50 p-2">
      <p className="text-[10px] uppercase tracking-wider text-ink-500">{k}</p>
      <p className="font-mono">{String(v)}</p>
    </div>
  );
}
