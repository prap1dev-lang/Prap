// Shared validation + row-mapping for project create (POST) and edit (PUT).
import "server-only";
import { z } from "zod";

export const ProjectBody = z.object({
  name: z.string().min(1),
  builder: z.string().min(1),
  city: z.string().min(1),
  sector: z.string().optional().default(""),
  pincode: z.string().optional().default(""),
  lat: z.string().optional().default(""),
  lng: z.string().optional().default(""),
  location: z.string().optional().default(""),
  projectType: z.string().optional().default("Residential"),
  subType: z.string().optional().default(""),
  totalLandArea: z.string().optional().default(""),
  towers: z.string().optional().default(""),
  floors: z.string().optional().default(""),
  totalUnits: z.string().optional().default(""),
  status: z.string().optional().default("under_construction"),

  reraNumber: z.string().min(1),
  authorityApprovals: z.string().optional().default(""),
  landOwnership: z.string().optional().default(""),
  bankLoanPartners: z.string().optional().default(""),
  environmentApproval: z.string().optional().default(""),
  fireApproval: z.string().optional().default(""),
  ocApproved: z.string().optional().default(""),
  completionTimeline: z.string().optional().default(""),
  possessionDate: z.string().optional().default(""),

  // Price flags
  priceMode: z.string().optional().default("expected"),
  allInclusive: z.boolean().optional().default(false),
  taxIncluded: z.boolean().optional().default(false),
  priceNegotiable: z.boolean().optional().default(false),
  additionalPricing: z.string().optional().default(""),
  bookingAmount: z.string().optional().default(""),

  // Apartment specs
  facing: z.string().optional().default(""),
  furnishing: z.string().optional().default(""),
  constructionType: z.string().optional().default(""),
  vaastuCompliance: z.string().optional().default(""),
  ageOfProperty: z.string().optional().default(""),
  reservedParking: z.string().optional().default(""),
  videoUrl: z.string().optional().default(""),

  // Doors & windows
  doorMain: z.string().optional().default(""),
  doorInternal: z.string().optional().default(""),
  windowMaterial: z.string().optional().default(""),

  configurations: z.string().optional().default(""),
  superArea: z.string().optional().default(""),
  carpetArea: z.string().optional().default(""),
  ceilingHeight: z.string().optional().default(""),
  balconyArea: z.string().optional().default(""),
  unitsPerFloor: z.string().optional().default(""),
  liftsPerTower: z.string().optional().default(""),
  vaastuFacing: z.string().optional().default(""),

  startingPrice: z.string().optional().default("0"),

  clubhouseDetails: z.string().optional().default(""),
  swimmingPool: z.string().optional().default(""),
  gymnasium: z.string().optional().default(""),
  sportsFacilities: z.string().optional().default(""),
  kidsPlayArea: z.string().optional().default(""),
  landscapedGreens: z.string().optional().default(""),
  joggingTrack: z.string().optional().default(""),
  securityFeatures: z.string().optional().default(""),
  smartHome: z.string().optional().default(""),
  powerBackup: z.string().optional().default(""),

  flooringSpec: z.string().optional().default(""),
  kitchenSpec: z.string().optional().default(""),
  bathroomFittings: z.string().optional().default(""),
  doorWindowQuality: z.string().optional().default(""),
  electricalSpec: z.string().optional().default(""),
  acProvision: z.string().optional().default(""),
  constructionTech: z.string().optional().default(""),
  metroDistance: z.string().optional().default(""),
  nearbyExpressways: z.string().optional().default(""),
  nearbySchoolsHospitals: z.string().optional().default(""),
  nearbyMalls: z.string().optional().default(""),
  airportConnectivity: z.string().optional().default(""),
  futureInfra: z.string().optional().default(""),
  appreciationPotential: z.string().optional().default(""),
  rentalDemand: z.string().optional().default(""),
  builderTrackRecord: z.string().optional().default(""),
  densityPlanning: z.string().optional().default(""),

  fireSafety: z.string().optional().default(""),
  cctvSecurity: z.string().optional().default(""),
  gatedFeatures: z.string().optional().default(""),
  earthquakeResistant: z.string().optional().default(""),
  waterSewage: z.string().optional().default(""),
  openAreaPercent: z.string().optional().default(""),
  greenBeltFacing: z.string().optional().default(""),
  fourSideOpen: z.string().optional().default(""),
  ventilationPlan: z.string().optional().default(""),
  sampleFlat: z.string().optional().default(""),
  exitResalePolicy: z.string().optional().default(""),
  description: z.string().optional().default(""),
  highlights: z.string().optional().default(""),
  isListed: z.boolean().optional().default(true),
  isHighDemand: z.boolean().optional().default(false),
  isNewlyLaunched: z.boolean().optional().default(false),

  coverUrl: z.string().nullable().optional(),
  gallery: z.array(z.string()).optional().default([]),
  floorPlans: z.array(z.string()).optional().default([]),
  brochureUrl: z.string().nullable().optional(),

  // Selected amenity tag ids (from the amenities catalogue)
  amenityTags: z.array(z.string()).optional().default([]),

  // Auto-fetched nearby landmarks (railway, airport, schools, temple, …)
  localityInsights: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        name: z.string().optional().default(""),
        km: z.number().optional().default(0),
        text: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),

  // BHK-wise unit types (multiple per property)
  unitTypes: z
    .array(
      z.object({
        config: z.string().optional().default(""),
        superArea: z.string().optional().default(""),
        carpetArea: z.string().optional().default(""),
        bathrooms: z.string().optional().default(""),
        balconyArea: z.string().optional().default(""),
        price: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
});

export type ProjectPayload = z.infer<typeof ProjectBody>;

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Map a validated payload to the `projects` table row shape (insert or update). */
export function buildProjectRow(d: ProjectPayload) {
  const configList = Array.from(
    new Set([
      ...d.configurations.split(",").map((s) => s.trim()).filter(Boolean),
      ...d.unitTypes.map((u) => u.config.trim()).filter(Boolean),
    ]),
  );
  const highlightList = d.highlights.split(",").map((s) => s.trim()).filter(Boolean);
  const amenityList = [
    d.clubhouseDetails, d.swimmingPool, d.gymnasium, d.sportsFacilities,
    d.kidsPlayArea, d.landscapedGreens, d.joggingTrack, d.powerBackup,
  ].filter(Boolean);

  return {
    name: d.name,
    builder: d.builder,
    city: d.city,
    sector: d.sector || null,
    rera_number: d.reraNumber,
    configurations: configList,
    starting_price_inr: Number(d.startingPrice) || 0,
    max_price_inr: 0,
    possession: d.possessionDate || d.completionTimeline || null,
    amenities: amenityList,
    highlights: highlightList,
    cover_url: d.coverUrl || null,
    gallery: d.gallery,
    description: d.description || null,
    status: d.status,
    is_listed: d.isListed,
    meta: {
      projectType: d.projectType,
      subType: d.subType,
      isHighDemand: d.isHighDemand,
      isNewlyLaunched: d.isNewlyLaunched,
      totalLandArea: d.totalLandArea,
      towers: d.towers,
      floors: d.floors,
      totalUnits: d.totalUnits,
      location: d.location,
      pincode: d.pincode,
      lat: d.lat,
      lng: d.lng,
      localityInsights: d.localityInsights,
      authorityApprovals: d.authorityApprovals,
      landOwnership: d.landOwnership,
      bankLoanPartners: d.bankLoanPartners,
      environmentApproval: d.environmentApproval,
      ocApproved: d.ocApproved,
      completionTimeline: d.completionTimeline,
      possessionDate: d.possessionDate,
      priceMode: d.priceMode,
      allInclusive: d.allInclusive,
      taxIncluded: d.taxIncluded,
      priceNegotiable: d.priceNegotiable,
      additionalPricing: d.additionalPricing,
      bookingAmount: d.bookingAmount,
      facing: d.facing,
      furnishing: d.furnishing,
      constructionType: d.constructionType,
      vaastuCompliance: d.vaastuCompliance,
      ageOfProperty: d.ageOfProperty,
      reservedParking: d.reservedParking,
      videoUrl: d.videoUrl,
      doorMain: d.doorMain,
      doorInternal: d.doorInternal,
      windowMaterial: d.windowMaterial,
      superArea: d.superArea,
      carpetArea: d.carpetArea,
      ceilingHeight: d.ceilingHeight,
      balconyArea: d.balconyArea,
      unitsPerFloor: d.unitsPerFloor,
      liftsPerTower: d.liftsPerTower,
      vaastuFacing: d.vaastuFacing,
      securityFeatures: d.securityFeatures,
      smartHome: d.smartHome,
      flooringSpec: d.flooringSpec,
      kitchenSpec: d.kitchenSpec,
      bathroomFittings: d.bathroomFittings,
      doorWindowQuality: d.doorWindowQuality,
      electricalSpec: d.electricalSpec,
      acProvision: d.acProvision,
      constructionTech: d.constructionTech,
      metroDistance: d.metroDistance,
      nearbyExpressways: d.nearbyExpressways,
      nearbySchoolsHospitals: d.nearbySchoolsHospitals,
      nearbyMalls: d.nearbyMalls,
      airportConnectivity: d.airportConnectivity,
      futureInfra: d.futureInfra,
      appreciationPotential: d.appreciationPotential,
      rentalDemand: d.rentalDemand,
      builderTrackRecord: d.builderTrackRecord,
      densityPlanning: d.densityPlanning,
      fireSafety: d.fireSafety,
      cctvSecurity: d.cctvSecurity,
      gatedFeatures: d.gatedFeatures,
      earthquakeResistant: d.earthquakeResistant,
      waterSewage: d.waterSewage,
      openAreaPercent: d.openAreaPercent,
      greenBeltFacing: d.greenBeltFacing,
      fourSideOpen: d.fourSideOpen,
      ventilationPlan: d.ventilationPlan,
      sampleFlat: d.sampleFlat,
      exitResalePolicy: d.exitResalePolicy,
      floorPlans: d.floorPlans,
      brochureUrl: d.brochureUrl,
      unitTypes: d.unitTypes,
      amenityTags: d.amenityTags,
    },
  };
}
