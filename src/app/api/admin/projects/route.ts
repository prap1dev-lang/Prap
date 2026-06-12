import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { revalidatePath, revalidateTag } from "next/cache";

const Body = z.object({
  name: z.string().min(1),
  builder: z.string().min(1),
  city: z.string().min(1),
  sector: z.string().optional().default(""),
  location: z.string().optional().default(""),
  projectType: z.string().optional().default("Residential"),
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
  completionTimeline: z.string().optional().default(""),
  possessionDate: z.string().optional().default(""),

  configurations: z.string().optional().default(""),
  superArea: z.string().optional().default(""),
  carpetArea: z.string().optional().default(""),
  ceilingHeight: z.string().optional().default(""),
  balconyArea: z.string().optional().default(""),
  unitsPerFloor: z.string().optional().default(""),
  liftsPerTower: z.string().optional().default(""),
  vaastuFacing: z.string().optional().default(""),

  bsp: z.string().optional().default(""),
  startingPrice: z.string().optional().default("0"),
  maxPrice: z.string().optional().default("0"),
  plcCharges: z.string().optional().default(""),
  parkingCharges: z.string().optional().default(""),
  clubMembership: z.string().optional().default(""),
  maintenanceCharges: z.string().optional().default(""),
  paymentPlan: z.string().optional().default(""),
  bookingAmount: z.string().optional().default(""),
  additionalCosts: z.string().optional().default(""),

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

  coverUrl: z.string().nullable().optional(),
  gallery: z.array(z.string()).optional().default([]),
  floorPlans: z.array(z.string()).optional().default([]),
  brochureUrl: z.string().nullable().optional(),
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const slug = slugify(`${d.name}-${d.city}`);

  const configList = d.configurations.split(",").map((s: string) => s.trim()).filter(Boolean);
  const highlightList = d.highlights.split(",").map((s: string) => s.trim()).filter(Boolean);
  const amenityList = [
    d.clubhouseDetails, d.swimmingPool, d.gymnasium, d.sportsFacilities,
    d.kidsPlayArea, d.landscapedGreens, d.joggingTrack, d.powerBackup,
  ].filter(Boolean);

  const sb = supabaseAdmin();
  const { error } = await sb.from("projects").insert({
    slug,
    name: d.name,
    builder: d.builder,
    city: d.city,
    sector: d.sector || null,
    rera_number: d.reraNumber,
    configurations: configList,
    starting_price_inr: Number(d.startingPrice) || 0,
    max_price_inr: Number(d.maxPrice) || 0,
    possession: d.possessionDate || d.completionTimeline || null,
    amenities: amenityList,
    highlights: highlightList,
    cover_url: d.coverUrl || null,
    gallery: d.gallery,
    description: d.description || null,
    status: d.status,
    is_listed: d.isListed,
    // Extended metadata stored in a JSONB column
    meta: {
      projectType: d.projectType,
      totalLandArea: d.totalLandArea,
      towers: d.towers,
      floors: d.floors,
      totalUnits: d.totalUnits,
      location: d.location,
      authorityApprovals: d.authorityApprovals,
      landOwnership: d.landOwnership,
      bankLoanPartners: d.bankLoanPartners,
      environmentApproval: d.environmentApproval,
      fireApproval: d.fireApproval,
      completionTimeline: d.completionTimeline,
      superArea: d.superArea,
      carpetArea: d.carpetArea,
      ceilingHeight: d.ceilingHeight,
      balconyArea: d.balconyArea,
      unitsPerFloor: d.unitsPerFloor,
      liftsPerTower: d.liftsPerTower,
      vaastuFacing: d.vaastuFacing,
      bsp: d.bsp,
      plcCharges: d.plcCharges,
      parkingCharges: d.parkingCharges,
      clubMembership: d.clubMembership,
      maintenanceCharges: d.maintenanceCharges,
      paymentPlan: d.paymentPlan,
      bookingAmount: d.bookingAmount,
      additionalCosts: d.additionalCosts,
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
    },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidateTag("projects"); // refresh the cached project list immediately
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");

  return NextResponse.json({ ok: true, slug });
}
