"use client";
import { useMemo, useState } from "react";
import { Calculator, IndianRupee, Percent, CalendarClock, Wallet, TrendingDown } from "lucide-react";
import { calculateEmi, loanEligibility } from "@/lib/scoring";
import { formatINR, formatINRCompact } from "@/lib/utils";

type Tab = "emi" | "eligibility";

export default function EmiCalculator() {
  const [tab, setTab] = useState<Tab>("emi");

  return (
    <section className="section bg-paper">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Home-loan tools</span>
          <h2 className="h2 mt-4">Plan your loan,<br />calmly &amp; clearly.</h2>
          <p className="mt-5 text-ink-600 text-lg font-light">
            Estimate your monthly EMI or discover how much you qualify for —
            instant, transparent, bank-standard math.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full bg-white/70 backdrop-blur-md p-1 shadow-card">
            <TabBtn active={tab === "emi"} onClick={() => setTab("emi")}>EMI calculator</TabBtn>
            <TabBtn active={tab === "eligibility"} onClick={() => setTab("eligibility")}>Loan eligibility</TabBtn>
          </div>
        </div>

        <div className="mt-10">
          {tab === "emi" ? <EmiPanel /> : <EligibilityPanel />}
        </div>
      </div>
    </section>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 ${
        active ? "bg-brand-600 text-ivory shadow-soft" : "text-ink-500 hover:text-ink-900"
      }`}
    >
      {children}
    </button>
  );
}

/* ----------------------------- EMI panel ----------------------------- */
function EmiPanel() {
  const [amount, setAmount] = useState(75_00_000); // ₹75 L
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const r = useMemo(() => calculateEmi(amount, rate, years), [amount, rate, years]);
  const interestPct = r.totalPayable > 0 ? (r.totalInterest / r.totalPayable) * 100 : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-stretch">
      <div className="card p-7 space-y-7">
        <Slider
          icon={<IndianRupee className="h-4 w-4" />}
          label="Loan amount"
          value={formatINRCompact(amount)}
          min={5_00_000}
          max={5_00_00_000}
          step={1_00_000}
          raw={amount}
          onChange={setAmount}
          minLabel="₹5 L"
          maxLabel="₹5 Cr"
        />
        <Slider
          icon={<Percent className="h-4 w-4" />}
          label="Interest rate (p.a.)"
          value={`${rate.toFixed(2)}%`}
          min={6}
          max={14}
          step={0.05}
          raw={rate}
          onChange={setRate}
          minLabel="6%"
          maxLabel="14%"
        />
        <Slider
          icon={<CalendarClock className="h-4 w-4" />}
          label="Tenure"
          value={`${years} yr`}
          min={1}
          max={30}
          step={1}
          raw={years}
          onChange={setYears}
          minLabel="1 yr"
          maxLabel="30 yr"
        />
      </div>

      <div className="card p-7 flex flex-col">
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-500">Monthly EMI</p>
        <p className="mt-2 font-serif text-5xl md:text-6xl font-light text-gradient">{formatINR(r.emi)}</p>

        <div className="mt-7">
          <Bar interestPct={interestPct} />
          <div className="mt-3 flex justify-between text-sm">
            <Legend color="bg-brand-600" label="Principal" value={formatINRCompact(r.principal)} />
            <Legend color="bg-amber-400" label="Interest" value={formatINRCompact(r.totalInterest)} align="right" />
          </div>
        </div>

        <div className="mt-auto pt-7 grid grid-cols-2 gap-4 text-sm">
          <Stat label="Total interest" value={formatINR(r.totalInterest)} />
          <Stat label="Total payable" value={formatINR(r.totalPayable)} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Eligibility panel ------------------------- */
function EligibilityPanel() {
  const [income, setIncome] = useState(1_50_000); // ₹1.5 L / month
  const [obligations, setObligations] = useState(15_000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [foir, setFoir] = useState(50);

  const r = useMemo(
    () => loanEligibility({ monthlyIncome: income, monthlyObligations: obligations, rateAnnualPct: rate, tenureYears: years, foirPct: foir }),
    [income, obligations, rate, years, foir],
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-stretch">
      <div className="card p-7 space-y-6">
        <Slider icon={<Wallet className="h-4 w-4" />} label="Net monthly income" value={formatINR(income)} min={25_000} max={10_00_000} step={5_000} raw={income} onChange={setIncome} minLabel="₹25 K" maxLabel="₹10 L" />
        <Slider icon={<TrendingDown className="h-4 w-4" />} label="Existing EMIs / obligations" value={formatINR(obligations)} min={0} max={5_00_000} step={2_500} raw={obligations} onChange={setObligations} minLabel="₹0" maxLabel="₹5 L" />
        <Slider icon={<Percent className="h-4 w-4" />} label="Interest rate (p.a.)" value={`${rate.toFixed(2)}%`} min={6} max={14} step={0.05} raw={rate} onChange={setRate} minLabel="6%" maxLabel="14%" />
        <Slider icon={<CalendarClock className="h-4 w-4" />} label="Tenure" value={`${years} yr`} min={1} max={30} step={1} raw={years} onChange={setYears} minLabel="1 yr" maxLabel="30 yr" />
        <Slider icon={<Percent className="h-4 w-4" />} label="FOIR (income toward EMIs)" value={`${foir}%`} min={30} max={65} step={5} raw={foir} onChange={setFoir} minLabel="30%" maxLabel="65%" />
      </div>

      <div className="card p-7 flex flex-col">
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-500">You may be eligible for</p>
        <p className="mt-2 font-serif text-5xl md:text-6xl font-light text-gradient">{formatINRCompact(r.eligibleLoan)}</p>
        <p className="mt-1 text-sm text-ink-500">{formatINR(r.eligibleLoan)}</p>

        <div className="mt-auto pt-7 grid grid-cols-2 gap-4 text-sm">
          <Stat label="Max affordable EMI" value={formatINR(r.maxEmi)} />
          <Stat label="At rate / tenure" value={`${r.rateAnnualPct}% · ${r.tenureYears} yr`} />
        </div>
        <p className="mt-5 text-xs text-ink-500 leading-relaxed">
          * Indicative estimate using a {foir}% FOIR. Final sanction depends on credit score, employer
          category and bank policy. PRAP's loan desk compares offers across partner banks.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ shared ------------------------------ */
function Slider({
  icon, label, value, min, max, step, raw, onChange, minLabel, maxLabel,
}: {
  icon: React.ReactNode; label: string; value: string; min: number; max: number; step: number;
  raw: number; onChange: (n: number) => void; minLabel: string; maxLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label flex items-center gap-2 !mb-0"><span className="text-brand-600">{icon}</span> {label}</label>
        <span className="font-bold text-ink-900 tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        className="mt-3 w-full accent-brand-600"
        min={min}
        max={max}
        step={step}
        value={raw}
        onChange={(e) => onChange(+e.target.value)}
      />
      <div className="flex justify-between text-xs text-ink-400 mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function Bar({ interestPct }: { interestPct: number }) {
  return (
    <div className="h-3 w-full rounded-full bg-brand-600 overflow-hidden flex">
      <div className="h-full bg-brand-600" style={{ width: `${100 - interestPct}%` }} />
      <div className="h-full bg-amber-400" style={{ width: `${interestPct}%` }} />
    </div>
  );
}

function Legend({ color, label, value, align }: { color: string; label: string; value: string; align?: "right" }) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <span className="inline-flex items-center gap-1.5 text-ink-600">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {label}
      </span>
      <p className="font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 border border-ink-100 p-4">
      <p className="text-ink-500">{label}</p>
      <p className="mt-1 font-bold text-ink-900">{value}</p>
    </div>
  );
}
