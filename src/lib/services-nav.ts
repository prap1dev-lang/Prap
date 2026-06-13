import { Building2, Sparkles, Calculator, Scale, Landmark, Car, TrendingUp, Briefcase } from "lucide-react";

export type ServiceItem = { label: string; href: string };
export type ServiceColumn = { title: string; icon: any; items: ServiceItem[] };

/** Slug used by the public explore pages. */
export function serviceSlug(label: string) {
  return label
    .toLowerCase()
    .replace(/[™®]/g, "")
    .replace(/&/g, "and")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const E = (label: string): ServiceItem => ({ label, href: `/services/${serviceSlug(label)}` });

/** Public services mega-menu — grouped into columns for the navbar dropdown. */
export const SERVICES: ServiceColumn[] = [
  {
    title: "Properties",
    icon: Building2,
    items: [
      { label: "All Projects", href: "/projects" },
      E("Apartments"), E("Villas & Independent Houses"), E("Builder Floors"),
      E("Residential Plots"), E("Luxury Homes"), E("Affordable Housing"),
      E("Office Spaces"), E("Retail Shops"), E("Commercial Plots"),
      E("Co-working Spaces"), E("Warehouses"),
      E("Pre-Launch Projects"), E("New Launch Projects"),
      E("Under Construction Projects"), E("Ready-to-Move Properties"),
    ],
  },
  {
    title: "AI Property Tools",
    icon: Sparkles,
    items: [
      E("AI Property Matchmaker"),
      { label: "Property Health Score™", href: "/buyer-protection/health-score" },
      E("Builder Trust Index™"), E("Fair Price Meter™"),
      E("Delay Risk Predictor™"), E("Infrastructure Impact Map™"),
      E("AI Investment Score"), E("Location Intelligence"),
    ],
  },
  {
    title: "Calculators",
    icon: Calculator,
    items: [
      E("EMI Calculator"), E("Loan Eligibility Calculator"),
      E("Affordability Calculator"), E("Rental Yield Calculator"),
      E("ROI Calculator"), E("Stamp Duty Calculator"),
      E("Registration Cost Calculator"), E("Down Payment Calculator"),
    ],
  },
  {
    title: "Legalist Services",
    icon: Scale,
    items: [
      { label: "Property Verification", href: "/buyer-protection" },
      E("Legal Due Diligence"), E("Document Verification"),
      E("Registry Readiness Checker™"), E("Legalist Verification™"),
    ],
  },
  {
    title: "Loan Assistance",
    icon: Landmark,
    items: [
      E("Check Eligibility"), E("Apply for Loan"), E("Compare Banks"),
      E("EMI Bounce Assistance"), E("Loan Status"),
    ],
  },
  {
    title: "Customer Services",
    icon: Car,
    items: [
      E("Pick & Drop Booking"), E("Site Visit Scheduler"),
      E("Virtual Property Tour"), E("Property Consultation"),
    ],
  },
  {
    title: "Investor Zone",
    icon: TrendingUp,
    items: [
      E("Investment Opportunities"), E("High ROI Properties"),
      E("Commercial Investments"), E("Portfolio Tracker"), E("Market Insights"),
    ],
  },
  {
    title: "For Brokers",
    icon: Briefcase,
    items: [
      { label: "Broker Program", href: "/for-brokers" },
      E("Lead Management"), E("Client Management"),
      E("Commission Reports"), E("Marketing Materials"),
    ],
  },
];

/** Flat lookup for the public explore/service page. */
export function findService(slug: string): { label: string; group: string } | null {
  for (const col of SERVICES) {
    for (const it of col.items) {
      if (it.href === `/services/${slug}`) return { label: it.label, group: col.title };
    }
  }
  return null;
}
