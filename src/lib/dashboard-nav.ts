import {
  LayoutDashboard, Building2, Sparkles, Calculator, Users, Wallet, Landmark,
  Car, Scale, TrendingUp, Briefcase, Bell, BookOpen, UserRound,
} from "lucide-react";

export type NavItem = { label: string; href: string };
export type NavGroup = {
  title: string;
  icon: any;
  defaultOpen?: boolean;
  /** Only show this group to these roles (omit = everyone). */
  roles?: ("broker" | "corporate" | "referrer" | "admin")[];
  items: NavItem[];
};

/** Slug for the dynamic explore page. */
export function exploreSlug(label: string) {
  return label
    .toLowerCase()
    .replace(/[™®]/g, "")
    .replace(/&/g, "and")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const E = (label: string): NavItem => ({ label, href: `/dashboard/explore/${exploreSlug(label)}` });

export const DASHBOARD_NAV: NavGroup[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { label: "Overview", href: "/dashboard" },
      { label: "Referral Earnings", href: "/dashboard/wallet" },
      { label: "Coin Wallet", href: "/dashboard/wallet" },
      E("Recent Activities"),
    ],
  },
  {
    title: "Properties",
    icon: Building2,
    items: [
      { label: "All Projects", href: "/dashboard/projects" },
      E("Apartments"), E("Flats"), E("Builder Floors"), E("Villas & Independent Houses"),
      E("Farmhouses"), E("Residential Plots"), E("Luxury Homes"), E("Affordable Housing"),
      E("Office Spaces"), E("Retail Shops"), E("Showrooms"), E("Food Courts"),
      E("Commercial Plots"), E("Co-working Spaces"), E("Warehouses"), E("Industrial Units"),
      E("Pre-Launch Projects"), E("New Launch Projects"), E("Under Construction Projects"),
      E("Ready-to-Move Properties"), E("Rental Income Properties"), E("High ROI Opportunities"),
      E("Residential Land"), E("Commercial Land"), E("Agricultural Land"), E("Industrial Land"),
      E("Hot Deals"), E("Featured Properties"), E("Verified Properties"),
      E("RERA Approved Projects"), E("Luxury Collection"), E("Smart Investment Picks"),
    ],
  },
  {
    title: "AI Property Tools",
    icon: Sparkles,
    items: [
      E("AI Property Matchmaker"),
      { label: "Property Health Score™", href: "/buyer-protection/health-score" },
      E("Builder Trust Index™"), E("Fair Price Meter™"), E("Delay Risk Predictor™"),
      E("Infrastructure Impact Map™"), E("AI Investment Score"), E("Location Intelligence"),
    ],
  },
  {
    title: "Calculators",
    icon: Calculator,
    items: [
      { label: "EMI Calculator", href: "/dashboard/calculators#emi" },
      { label: "Loan Eligibility Calculator", href: "/dashboard/calculators#eligibility" },
      E("Affordability Calculator"), E("Rental Yield Calculator"), E("ROI Calculator"),
      E("Stamp Duty Calculator"), E("Registration Cost Calculator"), E("Down Payment Calculator"),
    ],
  },
  {
    title: "Referral Program",
    icon: Users,
    items: [
      { label: "My Referrals", href: "/dashboard/settings" },
      E("Invite Friends"), E("Referral Tree"),
      { label: "Referral Earnings", href: "/dashboard/wallet" },
      E("Coin Rewards"), E("Leaderboard"),
    ],
  },
  {
    title: "Wallet & Rewards",
    icon: Wallet,
    items: [
      { label: "Coin Wallet", href: "/dashboard/wallet" },
      { label: "Redeem Rewards", href: "/dashboard/redeem" },
      { label: "Transaction History", href: "/dashboard/wallet" },
      E("Bonus Programs"),
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
      E("Pick & Drop Booking"),
      { label: "Site Visit Scheduler", href: "/dashboard/bookings" },
      E("Virtual Property Tour"), E("Property Consultation"),
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
    title: "Investor Zone",
    icon: TrendingUp,
    roles: ["referrer", "corporate", "admin"],
    items: [
      E("Investment Opportunities"), E("High ROI Properties"), E("Commercial Investments"),
      E("Portfolio Tracker"), E("Market Insights"),
    ],
  },
  {
    title: "Broker / Agent Zone",
    icon: Briefcase,
    roles: ["broker", "admin"],
    items: [
      E("Lead Management"), E("Client Management"), E("Referral Tracking"),
      E("Commission Reports"), E("Marketing Materials"),
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      E("Property Alerts"), E("Reward Alerts"), E("Loan Updates"), E("Service Updates"),
    ],
  },
  {
    title: "Resources",
    icon: BookOpen,
    items: [
      E("Real Estate News"), E("Buying Guide"), E("Investment Guide"),
      { label: "FAQs", href: "/faq" }, E("Blog"),
    ],
  },
  {
    title: "Account",
    icon: UserRound,
    defaultOpen: true,
    items: [
      { label: "My Profile", href: "/dashboard/settings" },
      { label: "KYC Verification", href: "/dashboard/settings" },
      { label: "Settings", href: "/dashboard/settings" },
      { label: "Support", href: "/contact" },
    ],
  },
];

/** Flat lookup of every explore slug → {label, group} for the dynamic page. */
export function findExplore(slug: string): { label: string; group: string } | null {
  for (const g of DASHBOARD_NAV) {
    for (const it of g.items) {
      if (it.href === `/dashboard/explore/${slug}`) return { label: it.label, group: g.title };
    }
  }
  return null;
}
