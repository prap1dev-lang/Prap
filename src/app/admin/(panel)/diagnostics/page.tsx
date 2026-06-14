"use client";

export default function DiagnosticsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Diagnostics</h1>
        <p className="mt-2 text-ink-500">
          Coming soon: diagnostics for Firebase Phone Auth and other services.
        </p>
      </header>

      <section className="card p-6 bg-brand-50 border border-brand-200">
        <h2 className="font-bold">Firebase Phone Auth</h2>
        <p className="mt-2 text-sm text-ink-700">
          Phone authentication is currently handled by Firebase Auth. For testing, use the test OTP:
        </p>
        <div className="mt-3 p-3 bg-white rounded-lg border border-brand-200">
          <p className="text-sm"><strong>Test Phone:</strong> Any valid phone number</p>
          <p className="text-sm"><strong>Test OTP:</strong> 123456</p>
        </div>
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
