"use client";
import { useMemo, useState } from "react";
import { Scale, Building2, Wallet, FileCheck2, MapPin, TrendingUp, Gauge } from "lucide-react";
import {
  propertyHealthScore, registryReadiness, builderTrustIndex, fairPriceMeter,
  delayRiskPredictor, legalistVerification, infrastructureImpact, sunlightVentilation,
  negotiationToolkit, legalistPropertyIntelligence, phsBand,
} from "@/lib/scoring";

const toneRing: Record<string, string> = {
  platinum: "from-emerald-500 to-emerald-600",
  gold: "from-emerald-400 to-emerald-500",
  recommended: "from-amber-400 to-amber-500",
  caution: "from-orange-400 to-orange-500",
  risk: "from-rose-400 to-rose-500",
};

export default function HealthScoreCalculator() {
  // Six headline dimension scores (0–100) the user drags.
  const [legal, setLegal] = useState(85);
  const [builder, setBuilder] = useState(80);
  const [financial, setFinancial] = useState(75);
  const [registry, setRegistry] = useState(80);
  const [location, setLocation] = useState(78);
  const [investment, setInvestment] = useState(72);

  const result = useMemo(() => {
    // Derive the master inputs from the six dimensions so a single set of
    // sliders drives the full Legalist Property Intelligence model.
    const propertyHealth = propertyHealthScore({
      structure: builder, legal, location, amenities: location, maintenance: registry,
    });
    const registryReady = registryReadiness({
      saleDeed: registry >= 60, titleClear: legal >= 60, ecAvailable: registry >= 50,
      taxPaid: registry >= 70, ownerVerified: legal >= 70,
    });
    const builderTrust = builderTrustIndex({
      reraCompliance: legal, deliveryRecord: builder, customerReviews: builder, financialStrength: builder,
    });
    const fair = fairPriceMeter(100 - financial / 2, 100); // higher financial score = better value
    const delay = delayRiskPredictor({
      builderTrackRecord: builder, constructionProgress: registry, approvalsStatus: legal,
    });
    const legalVer = legalistVerification({
      titleClear: legal >= 60, reraVerified: legal >= 50, encumbranceClear: legal >= 70,
      approvalsAvailable: legal >= 55, ownerVerified: legal >= 65,
    });
    const infra = infrastructureImpact({
      metroConnectivity: location, highways: location, schoolsHospitals: location, futureProjects: investment,
    });
    const sun = sunlightVentilation({ sunlightHours: 7, windowCoverage: location, airflowRating: location });
    const negotiation = negotiationToolkit({
      marketPriceGap: 100 - financial, daysOnMarket: 100 - investment, sellerUrgency: 100 - investment, projectDelay: delay.riskLevel === "High",
    }).score;

    const master = legalistPropertyIntelligence({
      propertyHealth, registryReadiness: registryReady, builderTrust, fairPrice: fair.score,
      delayRisk: delay.riskScore, legalVerification: legalVer, propertyMatch: 80,
      infrastructure: infra, sunlight: sun, negotiation,
    });
    return { master, band: phsBand(master.overallScore), delay, fair };
  }, [legal, builder, financial, registry, location, investment]);

  const tone = result.band.tone;
  const score = result.master.overallScore;

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      {/* Inputs */}
      <div className="card p-7 space-y-6">
        <h3 className="font-bold">Rate the property (0–100 per dimension)</h3>
        <Dim icon={<Scale className="h-4 w-4" />} label="Legal & Compliance" value={legal} onChange={setLegal} hint="Title · RERA · litigation · approvals" />
        <Dim icon={<Building2 className="h-4 w-4" />} label="Builder Credibility" value={builder} onChange={setBuilder} hint="Track record · delivery · finances" />
        <Dim icon={<Wallet className="h-4 w-4" />} label="Financial Transparency" value={financial} onChange={setFinancial} hint="Fair price · hidden charges" />
        <Dim icon={<FileCheck2 className="h-4 w-4" />} label="Registry Readiness" value={registry} onChange={setRegistry} hint="Docs · possession · handover" />
        <Dim icon={<MapPin className="h-4 w-4" />} label="Location & Connectivity" value={location} onChange={setLocation} hint="Metro · schools · hospitals" />
        <Dim icon={<TrendingUp className="h-4 w-4" />} label="Investment Potential" value={investment} onChange={setInvestment} hint="Appreciation · rental yield · exit" />
      </div>

      {/* Result */}
      <div className="card p-7 lg:sticky lg:top-24">
        <div className="flex flex-col items-center text-center">
          <div className={`relative h-44 w-44 rounded-full bg-gradient-to-br ${toneRing[tone]} grid place-items-center shadow-card`}>
            <div className="h-36 w-36 rounded-full bg-white grid place-items-center">
              <div>
                <p className="text-5xl font-extrabold text-ink-900 tabular-nums">{score}</p>
                <p className="text-xs uppercase tracking-wider font-semibold text-ink-500">PHS-100</p>
              </div>
            </div>
          </div>
          <p className="mt-5 text-xl font-extrabold text-ink-900">{result.band.label}</p>
          <p className="text-sm text-ink-500">Band {result.band.range} · Grade {result.master.grade} · {result.master.recommendation}</p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 text-sm">
          <Mini icon={<Gauge className="h-4 w-4" />} label="Delay risk" value={`${result.delay.riskLevel} (${result.delay.riskScore})`} />
          <Mini icon={<Wallet className="h-4 w-4" />} label="Price verdict" value={result.fair.status} />
        </div>

        <p className="mt-6 text-xs text-ink-500 leading-relaxed">
          Indicative score from the Master Legalist Property Intelligence model. PRAP's verified
          listings carry a Legalist-reviewed PHS-100 with documentary evidence behind each dimension.
        </p>
      </div>
    </div>
  );
}

function Dim({
  icon, label, value, onChange, hint,
}: { icon: React.ReactNode; label: string; value: number; onChange: (n: number) => void; hint: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label flex items-center gap-2 !mb-0"><span className="text-brand-600">{icon}</span> {label}</label>
        <span className="font-bold text-ink-900 tabular-nums">{value}</span>
      </div>
      <input type="range" min={0} max={100} step={1} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-2 w-full accent-brand-600" />
      <p className="text-xs text-ink-400">{hint}</p>
    </div>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 border border-ink-100 p-4">
      <p className="flex items-center gap-1.5 text-ink-500"><span className="text-brand-600">{icon}</span> {label}</p>
      <p className="mt-1 font-bold text-ink-900">{value}</p>
    </div>
  );
}
