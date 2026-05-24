"use client";
import { useMemo, useState } from "react";
import { Coins, Sparkles } from "lucide-react";
import { COIN, investmentBonus, visitBonus } from "@/lib/coins";

export default function RewardCalculator() {
  const [investment, setInvestment] = useState(1_50_00_000); // ₹1.5 Cr
  const [visits, setVisits] = useState(2);
  const [role, setRole] = useState<"referrer" | "corporate" | "broker">("referrer");

  const calc = useMemo(() => {
    const onboarding = COIN.ONBOARDING_BONUS;
    const inv = investmentBonus(investment);
    let visitTotal = 0;
    for (let v = 1; v <= visits; v++) {
      const b = visitBonus(v);
      visitTotal += role === "corporate" ? b.corporate : role === "referrer" ? b.referrer : 0;
    }
    const total = onboarding + inv + visitTotal;
    return { onboarding, inv, visitTotal, total };
  }, [investment, visits, role]);

  return (
    <section className="section bg-white">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Live calculator</span>
          <h2 className="h2 mt-4">See how much you'll earn — instantly.</h2>
          <p className="mt-4 text-ink-700 text-lg">
            Drag the sliders. PRAP shows your projected coin earnings across signup,
            visits and investment tiers in real time.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="label">I am a…</label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["referrer", "corporate", "broker"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`btn ${role === r ? "btn-primary" : "btn-outline"} capitalize !py-2 !px-3 text-sm`}
                    type="button"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Property investment: ₹{(investment / 1_00_00_000).toFixed(2)} Cr</label>
              <input
                type="range"
                min={50_00_000}
                max={3_50_00_000}
                step={5_00_000}
                value={investment}
                onChange={(e) => setInvestment(+e.target.value)}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-ink-500 mt-1">
                <span>₹50 L</span><span>₹3.5 Cr</span>
              </div>
            </div>

            <div>
              <label className="label">Site visits completed: {visits}</label>
              <input
                type="range"
                min={0}
                max={3}
                step={1}
                value={visits}
                onChange={(e) => setVisits(+e.target.value)}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-ink-500 mt-1">
                <span>0</span><span>1</span><span>2</span><span>3</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-7">
          <div className="flex items-center gap-3">
            <span className="h-12 w-12 rounded-2xl bg-brand-600 text-white grid place-items-center shadow-card">
              <Coins className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-ink-500">Projected total</p>
              <p className="text-3xl font-extrabold text-ink-900">
                {calc.total.toLocaleString("en-IN")} <span className="text-brand-600">Coins</span>
              </p>
              <p className="text-sm text-ink-500">≈ ₹{calc.total.toLocaleString("en-IN")} value</p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-ink-100 text-sm">
            <Row k="Onboarding bonus" v={calc.onboarding} />
            <Row k={`Visit bonuses (${visits})`} v={calc.visitTotal} />
            <Row k="Investment-tier bonus" v={calc.inv} />
          </div>

          <p className="mt-5 text-xs text-ink-500 leading-relaxed">
            * Visit bonuses apply to first 2 visits only. Investment-tier bonus credited
            on milestone closure. Redemption unlocks after 50% property payment is paid.
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-ink-700">{k}</span>
      <span className="font-semibold text-ink-900">+ {v.toLocaleString("en-IN")}</span>
    </div>
  );
}
