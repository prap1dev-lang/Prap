"use client";
import { useMemo, useState } from "react";
import { IndianRupee, Percent, CalendarClock, MessageCircle } from "lucide-react";
import { calculateEmi } from "@/lib/scoring";
import { formatINR, formatINRCompact } from "@/lib/utils";
import { waLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";

// Compact EMI estimator seeded with the property's starting price, plus a
// WhatsApp CTA to discuss financing with an expert.
export default function EmiMini({
  price, projectName, slug,
}: { price: number; projectName: string; slug: string }) {
  const seed = price > 0 ? price : 75_00_000;
  const [amount, setAmount] = useState(Math.round(seed * 0.8)); // 80% loan
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const r = useMemo(() => calculateEmi(amount, rate, years), [amount, rate, years]);

  const waMsg =
    `Hi PRAP, I'd like EMI / home-loan help for *${projectName}*.\n` +
    `Loan ${formatINRCompact(amount)} · ${rate}% · ${years} yr → EMI ~${formatINR(r.emi)}/mo.\n` +
    `Please connect me with a loan expert. Ref: /projects/${slug}`;

  return (
    <div className="rounded-2xl border border-ink-100 bg-paper p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-500">Estimated EMI</p>
        <p className="text-xs text-ink-400">{formatINRCompact(amount)} loan</p>
      </div>
      <p className="mt-1 font-serif text-3xl sm:text-4xl font-light text-gradient">{formatINR(r.emi)}<span className="text-base text-ink-400">/mo</span></p>

      <div className="mt-5 space-y-4">
        <Range icon={<IndianRupee className="h-4 w-4" />} label="Loan amount" value={formatINRCompact(amount)}
          min={5_00_000} max={Math.max(10_00_000, Math.round(seed * 1.2))} step={1_00_000} raw={amount} onChange={setAmount} />
        <Range icon={<Percent className="h-4 w-4" />} label="Interest rate" value={`${rate.toFixed(2)}%`}
          min={6} max={14} step={0.05} raw={rate} onChange={setRate} />
        <Range icon={<CalendarClock className="h-4 w-4" />} label="Tenure" value={`${years} yr`}
          min={1} max={30} step={1} raw={years} onChange={setYears} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white border border-ink-100 p-3">
          <p className="text-ink-500 text-xs">Total interest</p>
          <p className="font-bold text-ink-900">{formatINRCompact(r.totalInterest)}</p>
        </div>
        <div className="rounded-xl bg-white border border-ink-100 p-3">
          <p className="text-ink-500 text-xs">Total payable</p>
          <p className="font-bold text-ink-900">{formatINRCompact(r.totalPayable)}</p>
        </div>
      </div>

      <a
        href={waLink(waMsg)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white font-semibold hover:brightness-105 transition"
      >
        <MessageCircle className="h-5 w-5" /> Get EMI help on WhatsApp
      </a>
      {!WHATSAPP_NUMBER && (
        <p className="mt-1.5 text-[11px] text-amber-600 text-center">Set NEXT_PUBLIC_WHATSAPP_NUMBER to enable.</p>
      )}
      <p className="mt-2 text-[11px] text-ink-400 text-center">Indicative only — final rate depends on the bank &amp; profile.</p>
    </div>
  );
}

function Range({ icon, label, value, min, max, step, raw, onChange }: {
  icon: React.ReactNode; label: string; value: string; min: number; max: number; step: number;
  raw: number; onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-500 inline-flex items-center gap-1.5"><span className="text-brand-600">{icon}</span> {label}</span>
        <span className="text-sm font-semibold text-ink-900 tabular-nums">{value}</span>
      </div>
      <input type="range" className="mt-2 w-full accent-brand-600" min={min} max={max} step={step} value={raw} onChange={(e) => onChange(+e.target.value)} />
    </div>
  );
}
