/**
 * PRAP / Legalist Property Intelligence — scoring toolkit.
 *
 * Every tool returns a 0–100 score (or a {score, ...} verdict) so results can
 * be composed into the Master Legalist Property Intelligence Score and the
 * PRAP Property Health Score (PHS-100).
 *
 * Pure functions, no side-effects — safe to call from API routes or the client.
 */

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// ---------------------------------------------------------------------------
// 1. Property Health Score™
// ---------------------------------------------------------------------------
export type PropertyHealthInput = {
  structure: number;
  legal: number;
  location: number;
  amenities: number;
  maintenance: number;
};
export function propertyHealthScore(d: PropertyHealthInput): number {
  return Math.round(
    clamp(d.structure) * 0.3 +
      clamp(d.legal) * 0.25 +
      clamp(d.location) * 0.2 +
      clamp(d.amenities) * 0.15 +
      clamp(d.maintenance) * 0.1,
  );
}

// ---------------------------------------------------------------------------
// 2. Registry Readiness Checker™
// ---------------------------------------------------------------------------
export type RegistryReadinessInput = {
  saleDeed: boolean;
  titleClear: boolean;
  ecAvailable: boolean;
  taxPaid: boolean;
  ownerVerified: boolean;
};
export function registryReadiness(d: RegistryReadinessInput): number {
  let score = 0;
  if (d.saleDeed) score += 25;
  if (d.titleClear) score += 25;
  if (d.ecAvailable) score += 20;
  if (d.taxPaid) score += 15;
  if (d.ownerVerified) score += 15;
  return score;
}

// ---------------------------------------------------------------------------
// 3. Builder Trust Index™
// ---------------------------------------------------------------------------
export type BuilderTrustInput = {
  reraCompliance: number;
  deliveryRecord: number;
  customerReviews: number;
  financialStrength: number;
};
export function builderTrustIndex(d: BuilderTrustInput): number {
  return Math.round(
    clamp(d.reraCompliance) * 0.3 +
      clamp(d.deliveryRecord) * 0.3 +
      clamp(d.customerReviews) * 0.2 +
      clamp(d.financialStrength) * 0.2,
  );
}

// ---------------------------------------------------------------------------
// 4. Fair Price Meter™
// ---------------------------------------------------------------------------
export type FairPriceVerdict = { score: number; status: "Undervalued" | "Fair Price" | "Overpriced"; diffPct: number };
export function fairPriceMeter(propertyPrice: number, marketPrice: number): FairPriceVerdict {
  const diff = marketPrice > 0 ? ((propertyPrice - marketPrice) / marketPrice) * 100 : 0;
  if (diff <= -10) return { score: 95, status: "Undervalued", diffPct: diff };
  if (diff <= 10) return { score: 80, status: "Fair Price", diffPct: diff };
  return { score: 40, status: "Overpriced", diffPct: diff };
}

// ---------------------------------------------------------------------------
// 5. Delay Risk Predictor™
// ---------------------------------------------------------------------------
export type DelayRiskInput = { builderTrackRecord: number; constructionProgress: number; approvalsStatus: number };
export type DelayRiskVerdict = { riskScore: number; riskLevel: "Low" | "Medium" | "High" };
export function delayRiskPredictor(d: DelayRiskInput): DelayRiskVerdict {
  const risk =
    (100 - clamp(d.builderTrackRecord)) * 0.4 +
    (100 - clamp(d.constructionProgress)) * 0.3 +
    (100 - clamp(d.approvalsStatus)) * 0.3;
  const riskScore = Math.round(risk);
  return { riskScore, riskLevel: risk > 70 ? "High" : risk > 40 ? "Medium" : "Low" };
}

// ---------------------------------------------------------------------------
// 6. Legalist Verification™
// ---------------------------------------------------------------------------
export type LegalistVerificationInput = {
  titleClear: boolean;
  reraVerified: boolean;
  encumbranceClear: boolean;
  approvalsAvailable: boolean;
  ownerVerified: boolean;
};
export function legalistVerification(d: LegalistVerificationInput): number {
  let score = 0;
  if (d.titleClear) score += 20;
  if (d.reraVerified) score += 20;
  if (d.encumbranceClear) score += 20;
  if (d.approvalsAvailable) score += 20;
  if (d.ownerVerified) score += 20;
  return score;
}

// ---------------------------------------------------------------------------
// 7. AI Property Matchmaker™
// ---------------------------------------------------------------------------
export type MatchUser = { location: string; budget: number; bhk: number; purpose: string };
export type MatchProperty = { location: string; price: number; bhk: number; purpose: string };
export function propertyMatchmaker(user: MatchUser, property: MatchProperty): number {
  let score = 0;
  if (user.location.trim().toLowerCase() === property.location.trim().toLowerCase()) score += 30;
  if (user.budget >= property.price) score += 30;
  if (user.bhk === property.bhk) score += 20;
  if (user.purpose.trim().toLowerCase() === property.purpose.trim().toLowerCase()) score += 20;
  return score;
}

// ---------------------------------------------------------------------------
// 8. Infrastructure Impact Map™
// ---------------------------------------------------------------------------
export type InfraInput = { metroConnectivity: number; highways: number; schoolsHospitals: number; futureProjects: number };
export function infrastructureImpact(d: InfraInput): number {
  return Math.round(
    clamp(d.metroConnectivity) * 0.35 +
      clamp(d.highways) * 0.25 +
      clamp(d.schoolsHospitals) * 0.2 +
      clamp(d.futureProjects) * 0.2,
  );
}

// ---------------------------------------------------------------------------
// 9. Sunlight & Ventilation Analyzer™
// ---------------------------------------------------------------------------
export type SunlightInput = { sunlightHours: number; windowCoverage: number; airflowRating: number };
export function sunlightVentilation(d: SunlightInput): number {
  return clamp(
    Math.round(clamp(d.sunlightHours, 0, 10) * 10 * 0.5 + clamp(d.windowCoverage) * 0.3 + clamp(d.airflowRating) * 0.2),
  );
}

// ---------------------------------------------------------------------------
// 10. Buyer Negotiation Toolkit™
// ---------------------------------------------------------------------------
export type NegotiationInput = { marketPriceGap: number; daysOnMarket: number; sellerUrgency: number; projectDelay: boolean };
export type NegotiationVerdict = { score: number; recommendation: string };
export function negotiationToolkit(d: NegotiationInput): NegotiationVerdict {
  let power = 0;
  if (d.marketPriceGap > 10) power += 30;
  if (d.daysOnMarket > 90) power += 30;
  if (d.sellerUrgency > 70) power += 20;
  if (d.projectDelay) power += 20;
  return {
    score: power,
    recommendation:
      power > 70 ? "Strong Negotiation Position" : power > 40 ? "Moderate Negotiation Position" : "Weak Negotiation Position",
  };
}

// ---------------------------------------------------------------------------
// Master Legalist Property Intelligence Score™
// ---------------------------------------------------------------------------
export type MasterScoreInput = {
  propertyHealth: number;
  registryReadiness: number;
  builderTrust: number;
  fairPrice: number;
  delayRisk: number; // raw risk (higher = worse); inverted internally
  legalVerification: number;
  propertyMatch: number;
  infrastructure: number;
  sunlight: number;
  negotiation: number;
};
export type Grade = "A+" | "A" | "B" | "C" | "D";
export type MasterScoreVerdict = { overallScore: number; grade: Grade; recommendation: string };

export function legalistPropertyIntelligence(s: MasterScoreInput): MasterScoreVerdict {
  const overallScore = Math.round(
    s.propertyHealth * 0.15 +
      s.registryReadiness * 0.1 +
      s.builderTrust * 0.15 +
      s.fairPrice * 0.1 +
      (100 - s.delayRisk) * 0.1 +
      s.legalVerification * 0.15 +
      s.propertyMatch * 0.05 +
      s.infrastructure * 0.08 +
      s.sunlight * 0.05 +
      s.negotiation * 0.07,
  );
  const { grade, recommendation } = gradeFor(overallScore);
  return { overallScore, grade, recommendation };
}

function gradeFor(score: number): { grade: Grade; recommendation: string } {
  if (score >= 90) return { grade: "A+", recommendation: "Strong Buy" };
  if (score >= 80) return { grade: "A", recommendation: "Buy" };
  if (score >= 70) return { grade: "B", recommendation: "Recommended" };
  if (score >= 60) return { grade: "C", recommendation: "Proceed with Caution" };
  return { grade: "D", recommendation: "High Risk — Review" };
}

// ---------------------------------------------------------------------------
// PRAP Property Health Score bands (PHS-100)
// ---------------------------------------------------------------------------
export type PhsBand = {
  label: string;
  tone: "platinum" | "gold" | "recommended" | "caution" | "risk";
  range: string;
};
export function phsBand(score: number): PhsBand {
  if (score >= 90) return { label: "PRAP Platinum Verified", tone: "platinum", range: "90–100" };
  if (score >= 80) return { label: "PRAP Gold Verified", tone: "gold", range: "80–89" };
  if (score >= 70) return { label: "PRAP Recommended", tone: "recommended", range: "70–79" };
  if (score >= 60) return { label: "PRAP Caution", tone: "caution", range: "60–69" };
  return { label: "PRAP Risk Alert", tone: "risk", range: "Below 60" };
}

// ---------------------------------------------------------------------------
// Home-loan math — EMI, affordability & eligibility
// ---------------------------------------------------------------------------
export type EmiResult = {
  emi: number;
  totalInterest: number;
  totalPayable: number;
  principal: number;
};
/** Standard reducing-balance EMI. rateAnnualPct e.g. 8.5, tenureYears e.g. 20. */
export function calculateEmi(principal: number, rateAnnualPct: number, tenureYears: number): EmiResult {
  const n = Math.max(1, Math.round(tenureYears * 12));
  const r = rateAnnualPct / 12 / 100;
  let emi: number;
  if (r === 0) {
    emi = principal / n;
  } else {
    const f = Math.pow(1 + r, n);
    emi = (principal * r * f) / (f - 1);
  }
  const totalPayable = emi * n;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalPayable - principal),
    totalPayable: Math.round(totalPayable),
    principal: Math.round(principal),
  };
}

export type LoanEligibilityInput = {
  monthlyIncome: number;
  monthlyObligations: number; // existing EMIs / debts
  rateAnnualPct: number;
  tenureYears: number;
  foirPct?: number; // share of income allowed toward EMIs (default 50%)
};
export type LoanEligibilityResult = {
  maxEmi: number;
  eligibleLoan: number;
  tenureYears: number;
  rateAnnualPct: number;
};
/** Back-solve the maximum loan from an affordable EMI (FOIR-based). */
export function loanEligibility(d: LoanEligibilityInput): LoanEligibilityResult {
  const foir = (d.foirPct ?? 50) / 100;
  const maxEmi = Math.max(0, d.monthlyIncome * foir - d.monthlyObligations);
  const n = Math.max(1, Math.round(d.tenureYears * 12));
  const r = d.rateAnnualPct / 12 / 100;
  let eligibleLoan: number;
  if (r === 0) {
    eligibleLoan = maxEmi * n;
  } else {
    const f = Math.pow(1 + r, n);
    eligibleLoan = (maxEmi * (f - 1)) / (r * f);
  }
  return {
    maxEmi: Math.round(maxEmi),
    eligibleLoan: Math.round(eligibleLoan),
    tenureYears: d.tenureYears,
    rateAnnualPct: d.rateAnnualPct,
  };
}
