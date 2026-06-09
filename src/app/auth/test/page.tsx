"use client";
import { useState } from "react";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

export default function TestLoginPage() {
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function testLogin() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const normalizedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

      console.log("Testing with:", { phone: normalizedPhone, otp });

      const res = await fetch("/api/auth/test-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          mode: "signup",
          redirectTo: `${window.location.origin}/dashboard`,
        }),
      });

      const body = await res.json();
      console.log("Response:", { status: res.status, body });

      setResult(body);

      if (res.ok && body.ok && body.actionLink) {
        // Don't redirect yet, just show success
        setError(null);
      } else {
        setError(body.error || "Unknown error");
      }
    } catch (e: any) {
      console.error("Test failed:", e);
      setError(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-ink-50 p-4">
      <div className="max-w-md mx-auto mt-10">
        <div className="card p-6">
          <h1 className="text-2xl font-bold mb-2">Test Login (Dev Only)</h1>
          <p className="text-ink-600 text-sm mb-6">
            Use this to test the test-login endpoint without Firebase OTP.
          </p>

          <div className="space-y-4">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                disabled={loading}
              />
              <p className="text-xs text-ink-500 mt-1">
                Format: 10 digits (will be converted to +91...)
              </p>
            </div>

            <div>
              <label className="label">OTP (for reference)</label>
              <input
                type="text"
                className="input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                disabled={loading}
              />
              <p className="text-xs text-ink-500 mt-1">
                The endpoint creates a user directly (no OTP needed)
              </p>
            </div>

            <button
              onClick={testLogin}
              disabled={loading || phone.length < 10}
              className="btn-primary w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test Login"}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="h-5 w-5 text-rose-600 flex-none mt-0.5" />
                <div className="text-sm text-rose-700">
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {result?.ok && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex gap-2 items-start">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-none mt-0.5" />
                <div className="text-sm text-emerald-700 flex-1">
                  <p className="font-semibold">Success!</p>
                  <p className="mt-1">User created/found. Magic link ready.</p>
                  <p className="mt-2 text-xs">
                    <strong>Phone:</strong> {result.phone}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs underline">
                      Show action link
                    </summary>
                    <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
                      {result.actionLink}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          )}

          {result && !result.ok && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>Raw response:</strong>
              </p>
              <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 pt-6 border-t text-xs text-ink-500">
            <p>📝 <strong>How this works:</strong></p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Enter any 10-digit phone number</li>
              <li>Click "Test Login"</li>
              <li>Endpoint auto-creates user if needed</li>
              <li>Generates a Supabase magic link</li>
              <li>Check browser console for logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
