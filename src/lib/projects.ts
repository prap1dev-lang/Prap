export type Project = {
  slug: string;
  name: string;
  builder: string;
  city: "Noida" | "Greater Noida" | "Yamuna Expressway";
  sector: string;
  rera: string;
  configuration: string[];
  startingPrice: number;
  maxPrice: number;
  possession: string;
  amenities: string[];
  highlights: string[];
  cover: string;
  gallery: string[];
  description: string;
  status: "Under Construction" | "Ready to Move" | "New Launch";
  // BHK-wise unit types (optional — present on DB-backed projects).
  unitTypes?: UnitType[];
  // Selected amenity tag ids (from the amenities catalogue).
  amenityTags?: string[];
  // All extended fields captured by the admin form, stored in the DB `meta`
  // JSONB column (legal, pricing, specs, location, investment, safety, …).
  meta?: Record<string, any>;
};

export type UnitType = {
  config: string;
  superArea?: string;
  carpetArea?: string;
  bathrooms?: string;
  balconyArea?: string;
  price?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "vvip-namah-noida",
    name: "VVIP Namah",
    builder: "VVIP Group",
    city: "Noida",
    sector: "Sector 16C",
    rera: "UPRERAPRJ123456",
    configuration: ["2 BHK", "3 BHK", "4 BHK"],
    startingPrice: 9500000,
    maxPrice: 32000000,
    possession: "Dec 2027",
    amenities: ["Clubhouse", "Swimming Pool", "Gym", "Kids Play", "EV Charging", "24x7 Security"],
    highlights: [
      "5 min from Noida-Greater Noida Expressway",
      "Earn up to 75,000 PRAP Coins on investment",
      "Direct from builder — zero brokerage",
    ],
    cover:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "VVIP Namah is a landmark residential development in the heart of Noida Sector 16C, featuring premium 2/3/4 BHK residences with world-class amenities, RERA approved and ready for institutional investment.",
    status: "Under Construction",
  },
  {
    slug: "irish-platinum-greater-noida",
    name: "Irish Platinum",
    builder: "Irish Developers",
    city: "Greater Noida",
    sector: "Sector Tech Zone IV",
    rera: "UPRERAPRJ654321",
    configuration: ["3 BHK", "4 BHK", "Penthouse"],
    startingPrice: 13500000,
    maxPrice: 45000000,
    possession: "Mar 2026",
    amenities: ["Sky Lounge", "Infinity Pool", "Concierge", "Spa", "Smart Home", "Helipad"],
    highlights: [
      "Premium high-rise with skyline views",
      "Tier-1 schools & metro within 2 km",
      "Earn 25k onboarding + up to 75k on investment",
    ],
    cover:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Irish Platinum redefines luxury living in Greater Noida — limited 3/4 BHK and penthouses with premium amenities and a curated investor experience.",
    status: "New Launch",
  },
  {
    slug: "skyline-residency-noida-expressway",
    name: "Skyline Residency",
    builder: "Skyline Infratech",
    city: "Noida",
    sector: "Sector 150",
    rera: "UPRERAPRJ778899",
    configuration: ["2 BHK", "3 BHK"],
    startingPrice: 8200000,
    maxPrice: 18500000,
    possession: "Jun 2028",
    amenities: ["Jogging Track", "Yoga Deck", "Clubhouse", "Cricket Ground"],
    highlights: ["Sports-themed township", "Bordering golf course belt", "Excellent investment IRR"],
    cover:
      "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1600&q=80",
    gallery: [],
    description:
      "Skyline Residency in Sector 150 — Noida's greenest sports-themed township with strong rental yields and capital appreciation.",
    status: "Under Construction",
  },
  {
    slug: "ats-yamuna-greens",
    name: "ATS Yamuna Greens",
    builder: "ATS Group",
    city: "Yamuna Expressway",
    sector: "Sector 22D",
    rera: "UPRERAPRJ334455",
    configuration: ["2 BHK", "3 BHK"],
    startingPrice: 5800000,
    maxPrice: 14000000,
    possession: "Dec 2028",
    amenities: ["Clubhouse", "Pool", "Tennis", "Amphitheatre"],
    highlights: ["Walking distance to upcoming Jewar Airport", "High capital appreciation belt"],
    cover:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    gallery: [],
    description:
      "ATS Yamuna Greens — strategically placed on the Yamuna Expressway, minutes from the upcoming Jewar International Airport. Strong long-term appreciation play.",
    status: "New Launch",
  },
];

export const CITY_SLUGS = ["noida", "greater-noida", "yamuna-expressway"] as const;
export type CitySlug = (typeof CITY_SLUGS)[number];

export const CITY_INFO: Record<CitySlug, { name: string; tagline: string; description: string; keywords: string[] }> = {
  noida: {
    name: "Noida",
    tagline: "Premium RERA-verified properties in Noida with PRAP Coin rewards",
    description:
      "Explore RERA-verified residential and commercial projects across Noida sectors. Earn PRAP Coins on every site visit and unlock cashback once you book your home.",
    keywords: [
      "property in Noida",
      "buy flat in Noida",
      "Noida 3 BHK",
      "RERA Noida",
      "Noida real estate",
      "Noida sector 150",
      "Noida expressway property",
    ],
  },
  "greater-noida": {
    name: "Greater Noida",
    tagline: "Affordable luxury & investment-ready Greater Noida properties",
    description:
      "Discover premium projects in Greater Noida West, Tech Zone & Pari Chowk belt. Earn PRAP Coins worth ₹25,000 just on signup, plus visit bonuses every step.",
    keywords: [
      "property Greater Noida",
      "Greater Noida West flats",
      "Pari Chowk projects",
      "Jewar airport real estate",
      "RERA Greater Noida",
    ],
  },
  "yamuna-expressway": {
    name: "Yamuna Expressway",
    tagline: "Future-ready investments on the Yamuna Expressway corridor",
    description:
      "Be where the Jewar International Airport is rising. Discover plots, villas, and apartments along the Yamuna Expressway with PRAP's exclusive coin rewards.",
    keywords: [
      "Yamuna Expressway property",
      "Jewar airport real estate",
      "YEIDA sector plots",
      "Yamuna Expressway investment",
    ],
  },
};

export function formatINR(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
