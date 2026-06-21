// Shared field-section config for rendering ALL project details captured by the
// admin form (stored in the DB `meta` JSONB). Used by both the public project
// detail page and the admin project detail view so they stay in sync.

export type FieldSection = {
  title: string;
  fields: { key: string; label: string }[];
};

export const DETAIL_SECTIONS: FieldSection[] = [
  {
    title: "Project Overview",
    fields: [
      { key: "projectType", label: "Property type" },
      { key: "subType", label: "Sub-type" },
      { key: "totalLandArea", label: "Total land area" },
      { key: "towers", label: "Towers" },
      { key: "floors", label: "Floors per tower" },
      { key: "totalUnits", label: "Total units" },
      { key: "location", label: "Location / address" },
      { key: "completionTimeline", label: "Completion timeline" },
    ],
  },
  {
    title: "Legal & Approvals",
    fields: [
      { key: "authorityApprovals", label: "Authority approvals" },
      { key: "landOwnership", label: "Land ownership" },
      { key: "bankLoanPartners", label: "Bank loan partners" },
      { key: "environmentApproval", label: "Environmental clearance" },
      { key: "fireApproval", label: "Fire NOC" },
    ],
  },
  {
    title: "Apartment Specifications",
    fields: [
      { key: "superArea", label: "Super area range" },
      { key: "carpetArea", label: "Carpet area range" },
      { key: "ceilingHeight", label: "Ceiling height" },
      { key: "balconyArea", label: "Balcony & utility area" },
      { key: "unitsPerFloor", label: "Apartments per floor" },
      { key: "liftsPerTower", label: "Lifts per tower" },
      { key: "vaastuFacing", label: "Vaastu / facing" },
    ],
  },
  {
    title: "Construction & Finishing",
    fields: [
      { key: "flooringSpec", label: "Flooring" },
      { key: "kitchenSpec", label: "Kitchen" },
      { key: "bathroomFittings", label: "Bathroom fittings" },
      { key: "doorWindowQuality", label: "Doors & windows" },
      { key: "electricalSpec", label: "Electrical" },
      { key: "acProvision", label: "AC provision" },
      { key: "constructionTech", label: "Construction technology" },
    ],
  },
  {
    title: "Location & Connectivity",
    fields: [
      { key: "metroDistance", label: "Metro distance" },
      { key: "nearbyExpressways", label: "Nearby expressways" },
      { key: "nearbySchoolsHospitals", label: "Schools & hospitals" },
      { key: "nearbyMalls", label: "Malls & retail" },
      { key: "airportConnectivity", label: "Airport connectivity" },
      { key: "futureInfra", label: "Upcoming infrastructure" },
    ],
  },
  {
    title: "Investment Outlook",
    fields: [
      { key: "appreciationPotential", label: "Appreciation potential" },
      { key: "rentalDemand", label: "Rental demand" },
      { key: "builderTrackRecord", label: "Builder track record" },
      { key: "densityPlanning", label: "Density & planning" },
    ],
  },
  {
    title: "Safety & Buyer Checks",
    fields: [
      { key: "fireSafety", label: "Fire safety" },
      { key: "cctvSecurity", label: "CCTV & security" },
      { key: "gatedFeatures", label: "Gated features" },
      { key: "earthquakeResistant", label: "Earthquake resistant" },
      { key: "waterSewage", label: "Water & sewage" },
      { key: "openAreaPercent", label: "Open area %" },
      { key: "greenBeltFacing", label: "Green belt facing" },
      { key: "fourSideOpen", label: "Four-side open" },
      { key: "ventilationPlan", label: "Ventilation plan" },
      { key: "sampleFlat", label: "Sample flat" },
      { key: "exitResalePolicy", label: "Exit / resale policy" },
      { key: "securityFeatures", label: "Security features" },
      { key: "smartHome", label: "Smart home" },
    ],
  },
];
