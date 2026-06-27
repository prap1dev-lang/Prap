"use client";
import { useState, useRef } from "react";
import {
  CheckCircle2, ChevronRight, ChevronLeft, Loader2, Upload, X,
  Building2, Scale, Home, Star, Wrench, MapPin,
  TrendingUp, ShieldCheck, Eye, FileText, Check,
} from "lucide-react";
import { AMENITY_GROUPS } from "@/lib/amenities";
import { INDIAN_BANKS } from "@/lib/banks";
import { INDIAN_BUILDERS } from "@/lib/builders";
import { PROPERTY_TYPES, subtypesFor } from "@/lib/property-types";
import {
  FACING, FURNISHING, CONSTRUCTION_TYPE, FLOORING, KITCHEN, BATHROOM, VAASTU,
  PARKING, DOOR_MAIN, DOOR_INTERNAL, WINDOW_MATERIAL, OAP_PERCENT, PRICE_MODE, opt,
} from "@/lib/listing-options";

// A nearby point-of-interest with its straight-line distance.
interface LocalityPoi { key: string; label: string; name: string; km: number; text: string }

// ─── Types ───────────────────────────────────────────────────────────────────

interface UploadedFile {
  name: string;
  url: string;
  publicId: string;
}

// A single BHK-wise unit type within a project (multiple per property).
interface UnitType {
  config: string;       // e.g. "2 BHK", "3 BHK", "1 RK"
  superArea: string;    // sq.ft.
  carpetArea: string;   // sq.ft.
  bathrooms: string;
  balconyArea: string;
  price: string;        // starting price for this type (₹)
}

const EMPTY_UNIT: UnitType = {
  config: "", superArea: "", carpetArea: "", bathrooms: "", balconyArea: "", price: "",
};

interface FormState {
  // Step 1 — Basic Information
  name: string;
  builder: string;
  location: string;
  city: string;
  sector: string;
  pincode: string;
  projectType: string;   // Residential | Commercial
  subType: string;       // depends on projectType
  totalLandArea: string;
  towers: string;
  floors: string;
  totalUnits: string;
  status: string;
  startingPrice: string; // kept here so listing cards can show "From ₹…"
  priceMode: string;     // expected | persqft
  allInclusive: boolean;
  taxIncluded: boolean;
  priceNegotiable: boolean;
  additionalPricing: string;  // optional free-text — extra charges, payment plan etc.

  // Step 2 — Legal & Approvals
  reraNumber: string;
  authorityApprovals: string;
  landOwnership: string;
  bankLoanPartners: string;
  environmentApproval: string;
  ocApproved: string;          // OC approved (Yes/No) — replaces completion timeline
  completionTimeline: string;  // kept for back-compat (no longer shown)
  fireApproval: string;        // kept for back-compat (no longer shown)
  possessionDate: string;

  // Step 3 — Apartment Details
  configurations: string;
  superArea: string;
  carpetArea: string;
  ceilingHeight: string;
  balconyArea: string;
  unitsPerFloor: string;
  liftsPerTower: string;
  vaastuFacing: string;
  facing: string;              // single facing/direction
  furnishing: string;
  constructionType: string;
  vaastuCompliance: string;
  ageOfProperty: string;
  reservedParking: string;     // CSV: Open, Covered
  videoUrl: string;            // YouTube / property video link

  // Step 4 — Amenities
  clubhouseDetails: string;
  swimmingPool: string;
  gymnasium: string;
  sportsFacilities: string;
  kidsPlayArea: string;
  landscapedGreens: string;
  joggingTrack: string;
  securityFeatures: string;
  smartHome: string;
  powerBackup: string;

  // Step 5 — Construction, Location & Investment
  flooringSpec: string;
  kitchenSpec: string;
  bathroomFittings: string;
  doorWindowQuality: string;
  electricalSpec: string;
  acProvision: string;
  constructionTech: string;
  doorMain: string;        // CSV
  doorInternal: string;    // CSV
  windowMaterial: string;  // CSV
  metroDistance: string;
  nearbyExpressways: string;
  nearbySchoolsHospitals: string;
  nearbyMalls: string;
  airportConnectivity: string;
  futureInfra: string;
  appreciationPotential: string;
  rentalDemand: string;
  builderTrackRecord: string;
  densityPlanning: string;

  // Step 6 — Safety, Buyer Checks & Media
  fireSafety: string;
  cctvSecurity: string;
  gatedFeatures: string;
  earthquakeResistant: string;
  waterSewage: string;
  openAreaPercent: string;
  greenBeltFacing: string;
  fourSideOpen: string;
  ventilationPlan: string;
  sampleFlat: string;
  exitResalePolicy: string;
  bookingAmount: string;
  description: string;
  highlights: string;
  isListed: boolean;
  isHighDemand: boolean;    // shows in the "Projects in High Demand" rail
  isNewlyLaunched: boolean; // shows in the "Newly Launched" rail
}

const INITIAL: FormState = {
  name: "", builder: "", location: "", city: "Noida", sector: "", pincode: "",
  projectType: "Residential", subType: "", totalLandArea: "", towers: "", floors: "",
  totalUnits: "", status: "under_construction", startingPrice: "",
  priceMode: "expected", allInclusive: false, taxIncluded: false, priceNegotiable: false,
  additionalPricing: "",
  reraNumber: "", authorityApprovals: "", landOwnership: "", bankLoanPartners: "",
  environmentApproval: "", ocApproved: "", completionTimeline: "", fireApproval: "", possessionDate: "",
  configurations: "", superArea: "", carpetArea: "", ceilingHeight: "", balconyArea: "",
  unitsPerFloor: "", liftsPerTower: "", vaastuFacing: "",
  facing: "", furnishing: "", constructionType: "", vaastuCompliance: "",
  ageOfProperty: "", reservedParking: "", videoUrl: "",
  clubhouseDetails: "", swimmingPool: "", gymnasium: "", sportsFacilities: "",
  kidsPlayArea: "", landscapedGreens: "", joggingTrack: "", securityFeatures: "",
  smartHome: "", powerBackup: "",
  flooringSpec: "", kitchenSpec: "", bathroomFittings: "", doorWindowQuality: "",
  electricalSpec: "", acProvision: "", constructionTech: "",
  doorMain: "", doorInternal: "", windowMaterial: "",
  metroDistance: "", nearbyExpressways: "", nearbySchoolsHospitals: "", nearbyMalls: "",
  airportConnectivity: "", futureInfra: "",
  appreciationPotential: "", rentalDemand: "", builderTrackRecord: "", densityPlanning: "",
  fireSafety: "", cctvSecurity: "", gatedFeatures: "", earthquakeResistant: "",
  waterSewage: "", openAreaPercent: "", greenBeltFacing: "", fourSideOpen: "",
  ventilationPlan: "", sampleFlat: "", exitResalePolicy: "", bookingAmount: "",
  description: "", highlights: "", isListed: true,
  isHighDemand: false, isNewlyLaunched: false,
};

// ─── Steps definition ─────────────────────────────────────────────────────────

// Step sequence modelled on 99acres' "Post Property" flow.
// `color` gives each step a distinct accent so the admin can tell at a glance
// which stage they're on (colourful icon chips).
const STEPS = [
  { id: 1, title: "Basic Details", icon: Building2, color: "bg-sky-100 text-sky-700" },
  { id: 2, title: "Legal & RERA", icon: Scale, color: "bg-violet-100 text-violet-700" },
  { id: 3, title: "Property Profile", icon: Home, color: "bg-emerald-100 text-emerald-700" },
  { id: 4, title: "Amenities", icon: Star, color: "bg-pink-100 text-pink-700" },
  { id: 5, title: "Locality & Investment", icon: MapPin, color: "bg-teal-100 text-teal-700" },
  { id: 6, title: "Photos & Publish", icon: ShieldCheck, color: "bg-indigo-100 text-indigo-700" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-ink-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder = "", type = "text", mono = false, list }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean; list?: string;
}) {
  return (
    <input
      className={`input ${mono ? "font-mono text-sm" : ""}`}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      list={list}
    />
  );
}

function Textarea({ value, onChange, placeholder = "", rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      className="input"
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// Predefined unit-size / configuration options for projects.
const CONFIG_OPTIONS = [
  "1 RK", "1 BHK", "2 BHK", "2 BHK + Study", "3 BHK", "3 BHK + Study",
  "3 BHK + Servant Room", "3 BHK + Servant + Powder Room",
  "4 BHK", "4 BHK + Servant Room", "4 BHK + Servant + Powder Room", "5 BHK",
  "Penthouse", "Duplex", "Villa", "Bungalow", "Studio Apartment",
  "Shop / Retail", "Office Space", "Plot",
];

/** Single-select button group (99acres-style chooser). */
function ButtonGroup({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              active
                ? "bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500"
                : "bg-white border-ink-200 text-ink-600 hover:border-brand-400"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Grouped amenity picker — icon chips toggled on/off, stored as id list. */
function AmenityPicker({ selected, onToggle }: {
  selected: string[]; onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {AMENITY_GROUPS.map((group) => (
        <div key={group.category}>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">{group.category}</p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((a) => {
              const Icon = a.icon;
              const active = selected.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onToggle(a.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "bg-white border-ink-200 text-ink-600 hover:border-brand-400 hover:bg-brand-50/40"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {a.label}
                  {active && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Multi-select chip group. Stores selection as a comma-separated string. */
function MultiSelectChips({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  const selected = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next.join(", "));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              active
                ? "bg-brand-500 border-brand-500 text-white"
                : "bg-white border-ink-200 text-ink-600 hover:border-brand-400"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/** Circular completion indicator (0–100%). */
function CircularProgress({ percent, size = 56, stroke = 6 }: {
  percent: number; size?: number; stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, Math.max(0, percent)) / 100) * circ;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor" strokeWidth={stroke}
          className="text-ink-100"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="text-brand-600 transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink-800">
        {percent}%
      </span>
    </div>
  );
}

// ─── Image/PDF uploader ───────────────────────────────────────────────────────

function FileUploader({
  label, hint, accept, multiple = false, folder, files, onChange, useFirebase = false,
}: {
  label: string; hint?: string; accept: string; multiple?: boolean;
  folder: string; files: UploadedFile[]; onChange: (files: UploadedFile[]) => void;
  // Upload directly to Firebase Storage from the browser (bypasses the API
  // request-body size limit — use for large files like PDF brochures).
  useFirebase?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(picked: FileList | null) {
    if (!picked || picked.length === 0) return;
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const results: UploadedFile[] = [];
      for (const file of Array.from(picked)) {
        if (useFirebase) {
          const { uploadToFirebase } = await import("@/lib/firebase-upload");
          const r = await uploadToFirebase(file, folder, setProgress);
          results.push({ name: r.name, url: r.url, publicId: r.path });
          continue;
        }

        const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);
        if (isPdf) fd.append("type", "raw");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });

        // The server may return a non-JSON error (e.g. a plain-text
        // "Request Entity Too Large" when the file exceeds the body limit),
        // which would make res.json() throw "Unexpected token R…".
        const raw = await res.text();
        let body: any;
        try {
          body = JSON.parse(raw);
        } catch {
          throw new Error(
            res.status === 413
              ? "File is too large to upload."
              : raw.trim() || `Upload failed (HTTP ${res.status})`,
          );
        }

        if (!res.ok || !body.ok) throw new Error(body.error || "Upload failed");
        results.push({ name: file.name, url: body.url, publicId: body.publicId });
      }
      onChange(multiple ? [...files, ...results] : results);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function remove(publicId: string) {
    onChange(files.filter((f) => f.publicId !== publicId));
  }

  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-ink-400 mb-1">{hint}</p>}
      <div
        className="relative border-2 border-dashed border-ink-200 rounded-xl p-4 text-center cursor-pointer hover:border-brand-400 transition"
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-ink-500 text-sm py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {useFirebase && progress > 0 ? `Uploading… ${progress}%` : "Uploading…"}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-ink-500 text-sm py-2">
            <Upload className="h-4 w-4" />
            <span>Click to upload {multiple ? "files" : "file"}</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f) => (
            <div key={f.publicId} className="relative group">
              {f.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                <img src={f.url} alt={f.name} className="h-16 w-20 object-cover rounded-lg border border-ink-200" />
              ) : (
                <div className="h-16 w-20 flex items-center justify-center rounded-lg border border-ink-200 bg-ink-50">
                  <FileText className="h-6 w-6 text-ink-400" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(f.publicId); }}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white items-center justify-center hidden group-hover:flex"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="mt-0.5 text-[10px] text-ink-400 truncate max-w-[5rem]">{f.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

// Data shape used to pre-fill the wizard when editing an existing project.
export interface ProjectInitial {
  slug: string;
  form: Partial<FormState>;
  cover?: UploadedFile | null;
  gallery?: UploadedFile[];
  floorPlans?: UploadedFile[];
  brochure?: UploadedFile | null;
  unitTypes?: UnitType[];
  amenityTags?: string[];
  insights?: LocalityPoi[];
}

export default function ProjectWizard({ initial }: { initial?: ProjectInitial } = {}) {
  const isEdit = !!initial;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...INITIAL, ...(initial?.form ?? {}) });
  const [coverImages, setCoverImages] = useState<UploadedFile[]>(initial?.cover ? [initial.cover] : []);
  const [galleryImages, setGalleryImages] = useState<UploadedFile[]>(initial?.gallery ?? []);
  const [floorPlans, setFloorPlans] = useState<UploadedFile[]>(initial?.floorPlans ?? []);
  const [brochure, setBrochure] = useState<UploadedFile[]>(initial?.brochure ? [initial.brochure] : []);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>(
    initial?.unitTypes && initial.unitTypes.length ? initial.unitTypes : [{ ...EMPTY_UNIT }],
  );
  const [amenityTags, setAmenityTags] = useState<string[]>(initial?.amenityTags ?? []);
  const [insights, setInsights] = useState<LocalityPoi[]>(initial?.insights ?? []);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof FormState) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ── BHK-wise unit type rows ──
  const addUnitType = () => setUnitTypes((rows) => [...rows, { ...EMPTY_UNIT }]);
  const removeUnitType = (i: number) =>
    setUnitTypes((rows) => (rows.length === 1 ? rows : rows.filter((_, idx) => idx !== i)));
  const setUnitField = (i: number, k: keyof UnitType) => (v: string) =>
    setUnitTypes((rows) => rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  const toggleAmenity = (id: string) =>
    setAmenityTags((tags) => (tags.includes(id) ? tags.filter((t) => t !== id) : [...tags, id]));

  // ── Auto-fetch neighbourhood: address/pincode → geocode → nearby POIs ──
  async function fetchInsights() {
    setInsightsError(null);
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/property-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: form.location, pincode: form.pincode, city: form.city }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || "Could not fetch locality details.");
      const list: LocalityPoi[] = body.insights || [];
      setInsights(list);

      // Auto-fill the connectivity text fields (these render on the website
      // and in the admin panel via the shared Location & Connectivity section).
      const find = (k: string) => list.find((i) => i.key === k);
      type TextKey = "metroDistance" | "airportConnectivity" | "nearbySchoolsHospitals" | "nearbyMalls";
      const set2 = (k: TextKey, v: string) =>
        setForm((f) => ({ ...f, [k]: f[k] ? f[k] : v }));
      const metro = find("metro") || find("railwayStation");
      if (metro) set2("metroDistance", `${metro.name} — ${metro.text}`);
      const air = find("airport");
      if (air) set2("airportConnectivity", `${air.name} — ${air.text}`);
      const sch = find("school");
      const hosp = find("hospital");
      if (sch || hosp) {
        const parts = [sch && `${sch.name} ${sch.text}`, hosp && `${hosp.name} ${hosp.text}`].filter(Boolean);
        set2("nearbySchoolsHospitals", parts.join(", "));
      }
      const mall = find("mall");
      if (mall) set2("nearbyMalls", `${mall.name} — ${mall.text}`);

      // Append a connectivity summary to the description when it's empty.
      if (body.summary && !form.description.trim()) {
        setForm((f) => ({ ...f, description: body.summary }));
      }
    } catch (e: any) {
      setInsightsError(e?.message || "Could not fetch locality details.");
    } finally {
      setInsightsLoading(false);
    }
  }

  // ── Compose Key Highlights from already-filled details ──
  function autoHighlights() {
    const parts: string[] = [];
    if (form.configurations) parts.push(form.configurations.split(",")[0].trim() + " homes");
    if (form.subType) parts.push(form.subType);
    if (form.facing) parts.push(`${form.facing} facing`);
    if (form.furnishing) parts.push(form.furnishing);
    if (form.startingPrice) parts.push(`From ₹${Number(form.startingPrice).toLocaleString("en-IN")}`);
    if (form.ocApproved === "Yes") parts.push("OC approved");
    if (form.reraNumber) parts.push("RERA registered");
    // Nearest landmarks from the auto-fetched insights.
    for (const i of insights.slice(0, 2)) parts.push(`${i.label} ${i.text}`);
    // Top amenities (first 2 by id → label not available here; use raw count).
    if (amenityTags.length) parts.push(`${amenityTags.length}+ amenities`);
    const next = Array.from(new Set(parts)).slice(0, 8).join(", ");
    if (next) set("highlights")(next);
  }

  // ── Geo-locate: fetch device GPS → reverse-geocode → fill city/locality ──
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const KNOWN_CITIES = ["Noida", "Greater Noida", "Yamuna Expressway", "Gurgaon", "Delhi"];
  function pickLocation() {
    setGeoError(null);
    if (!("geolocation" in navigator)) { setGeoError("Location not supported on this device."); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const body = await res.json().catch(() => ({}));
          if (!res.ok || !body.ok) throw new Error(body.error || "Could not detect location.");
          setForm((f) => ({
            ...f,
            city: KNOWN_CITIES.includes(body.city) ? body.city : "Other",
            sector: body.locality || f.sector,
            location: f.location || body.formatted || "",
          }));
        } catch (e: any) {
          setGeoError(e?.message || "Could not detect location.");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(err.code === err.PERMISSION_DENIED ? "Permission denied — enable location access." : "Couldn't get location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  // Overall completion: share of fillable fields that have a value, including
  // the four media uploads. `isListed` is a default toggle and not counted.
  const completion = (() => {
    const textFields = Object.entries(form).filter(
      ([k]) => !["isListed", "isHighDemand", "isNewlyLaunched"].includes(k),
    );
    const filledText = textFields.filter(
      ([, v]) => typeof v === "string" && v.trim() !== "",
    ).length;
    const media = [
      coverImages.length > 0,
      galleryImages.length > 0,
      floorPlans.length > 0,
      brochure.length > 0,
    ];
    const filledMedia = media.filter(Boolean).length;
    const total = textFields.length + media.length;
    return Math.round(((filledText + filledMedia) / total) * 100);
  })();

  async function submit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        coverUrl: coverImages[0]?.url ?? null,
        gallery: galleryImages.map((f) => f.url),
        floorPlans: floorPlans.map((f) => f.url),
        brochureUrl: brochure[0]?.url ?? null,
        // Only send rows that have at least a configuration selected.
        unitTypes: unitTypes.filter((u) => u.config.trim() !== ""),
        amenityTags,
        localityInsights: insights,
      };
      const res = await fetch(
        isEdit ? `/api/admin/projects/${initial!.slug}` : "/api/admin/projects",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || `Failed to ${isEdit ? "update" : "create"} project`);
      setDone(true);
    } catch (e: any) {
      setSubmitError(e?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card p-12 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-extrabold text-ink-900">{isEdit ? "Project updated!" : "Project created!"}</h2>
        <p className="text-ink-500">The project has been saved and {form.isListed ? "published" : "saved as draft"}.</p>
        <div className="flex gap-3 justify-center pt-2">
          <a href="/admin/projects" className="btn-primary">Back to projects</a>
          {isEdit ? (
            <a href={`/admin/projects/${initial!.slug}`} className="btn-outline">View details</a>
          ) : (
            <button onClick={() => { setForm(INITIAL); setStep(1); setDone(false); }} className="btn-outline">Add another</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step progress bar */}
      <div className="card p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
        {/* Mobile: compact current-step label */}
        <div className="sm:hidden flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold text-ink-900">
            {(() => {
              const cur = STEPS.find((s) => s.id === step);
              if (!cur) return null;
              const CurIcon = cur.icon;
              return (
                <span className={`grid h-7 w-7 place-items-center rounded-lg ${cur.color}`}>
                  <CurIcon className="h-4 w-4" />
                </span>
              );
            })()}
            {STEPS.find((s) => s.id === step)?.title}
          </span>
          <span className="text-xs font-medium text-ink-400">Step {step} / {STEPS.length}</span>
        </div>
        {/* Desktop: full step list */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => isDone && setStep(s.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : isDone
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                      : "bg-ink-50 text-ink-400 cursor-default"
                  }`}
                >
                  <span className={`grid h-6 w-6 place-items-center rounded-lg shrink-0 ${isActive ? "bg-white/20 text-white" : isDone ? "bg-emerald-100 text-emerald-700" : s.color}`}>
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="whitespace-nowrap">{s.title}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className={`h-4 w-4 shrink-0 ${isDone ? "text-emerald-400" : "text-ink-200"}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <CircularProgress percent={completion} />
          <span className="text-[10px] font-medium text-ink-400 whitespace-nowrap">Completed</span>
        </div>
      </div>

      {/* Step panels */}
      <div className="card p-6 md:p-8 flex flex-col">
        {/* ── STEP 1: Basic Information ── */}
        {step === 1 && (
          <StepShell title="Basic Details" subtitle="Tell us about your project — like posting on 99acres.">
            <div className="mb-6 space-y-5">
              <Field label="What kind of property is this? *" hint="Choose Residential or Commercial">
                <ButtonGroup
                  value={form.projectType}
                  onChange={(v) => { set("projectType")(v); set("subType")(""); }}
                  options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
                />
              </Field>
              <Field label="Property sub-type" hint="Pick the option that best fits">
                <ButtonGroup
                  value={form.subType}
                  onChange={set("subType")}
                  options={subtypesFor(form.projectType).map((s) => ({ value: s, label: s }))}
                />
              </Field>
              <Field label="Project Status *" hint="Current construction stage">
                <ButtonGroup value={form.status} onChange={set("status")} options={[
                  { value: "pre_launch", label: "Pre-launch" },
                  { value: "new_launch", label: "New Launch" },
                  { value: "under_construction", label: "Under Construction" },
                  { value: "ready_to_move", label: "Ready to Move" },
                ]} />
              </Field>
            </div>
            <div className="mb-5 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={pickLocation}
                disabled={geoLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-50 text-brand-700 px-4 py-2 text-sm font-medium hover:bg-brand-100 transition disabled:opacity-60"
              >
                {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                {geoLoading ? "Detecting…" : "Pick my location (GPS)"}
              </button>
              <span className="text-xs text-ink-400">Auto-fills city &amp; locality from your device.</span>
              {geoError && <span className="text-xs text-rose-600">{geoError}</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Project Name *">
                <Input value={form.name} onChange={set("name")} placeholder="e.g. VVIP Namah" />
              </Field>
              <Field label="Developer / Builder Name *" hint="Start typing — pick from India's builders or enter your own">
                <Input value={form.builder} onChange={set("builder")} placeholder="e.g. VVIP Group" list="builder-list" />
                <datalist id="builder-list">
                  {INDIAN_BUILDERS.map((b) => <option key={b} value={b} />)}
                </datalist>
              </Field>
              <Field label="Project Location / Address *">
                <Input value={form.location} onChange={set("location")} placeholder="Plot No. 5, Sector 16C…" />
              </Field>
              <Field label="City *">
                <Select value={form.city} onChange={set("city")} options={[
                  { value: "Noida", label: "Noida" },
                  { value: "Greater Noida", label: "Greater Noida" },
                  { value: "Yamuna Expressway", label: "Yamuna Expressway" },
                  { value: "Gurgaon", label: "Gurgaon" },
                  { value: "Delhi", label: "Delhi" },
                  { value: "Other", label: "Other" },
                ]} />
              </Field>
              <Field label="Sector / Locality">
                <Input value={form.sector} onChange={set("sector")} placeholder="Sector 16C" />
              </Field>
              <Field label="Total Land Area">
                <Input value={form.totalLandArea} onChange={set("totalLandArea")} placeholder="e.g. 10 acres" />
              </Field>
              <Field label="Number of Towers">
                <Input value={form.towers} onChange={set("towers")} placeholder="e.g. 4" type="number" />
              </Field>
              <Field label="Number of Floors per Tower">
                <Input value={form.floors} onChange={set("floors")} placeholder="e.g. 30" type="number" />
              </Field>
              <Field label="Total Number of Units">
                <Input value={form.totalUnits} onChange={set("totalUnits")} placeholder="e.g. 800" type="number" />
              </Field>
              <Field label="Starting Price (₹)" hint="Shown as “From ₹…” on listing cards">
                <Input value={form.startingPrice} onChange={set("startingPrice")} placeholder="e.g. 9500000" type="number" />
              </Field>
              <Field label="Price Basis">
                <ButtonGroup value={form.priceMode} onChange={set("priceMode")} options={PRICE_MODE} />
              </Field>
            </div>

            {/* Price flags */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {([
                ["allInclusive", "All inclusive"],
                ["taxIncluded", "Tax & govt. charges included"],
                ["priceNegotiable", "Price negotiable"],
              ] as const).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-brand-600 h-4 w-4"
                    checked={form[k]}
                    onChange={(e) => set(k)(e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* Optional extra pricing notes — payment plans, extra charges, offers */}
            <div className="mt-4">
              <Field label="Additional Pricing Details" hint="Optional — payment plan, extra charges (PLC, IFMS, parking), current offers">
                <Textarea
                  value={form.additionalPricing}
                  onChange={set("additionalPricing")}
                  placeholder="e.g. 10:90 payment plan, ₹250/sq.ft. PLC for park-facing, no floor-rise up to 5th floor"
                  rows={2}
                />
              </Field>
            </div>

            {/* Auto-fetch nearby landmarks from the address / PIN code */}
            <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50/40 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-ink-800">Nearby landmarks &amp; connectivity</p>
                  <p className="text-xs text-ink-400">Auto-detects railway, airport, schools, temples, hospitals, malls &amp; EV charging by the property location.</p>
                </div>
                <button
                  type="button"
                  onClick={fetchInsights}
                  disabled={insightsLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60"
                >
                  {insightsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  {insightsLoading ? "Detecting…" : "Auto-fetch nearby"}
                </button>
              </div>
              {insightsError && <p className="mt-2 text-xs text-rose-600">{insightsError}</p>}
              {insights.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.map((i) => (
                    <span key={i.key} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink-200 px-3 py-1 text-xs text-ink-700">
                      <span className="font-medium">{i.label}:</span> {i.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </StepShell>
        )}

        {/* ── STEP 2: Legal & Approvals ── */}
        {step === 2 && (
          <StepShell title="Legal & Approval Details" subtitle="Regulatory and ownership details.">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="RERA Registration Number *">
                <Input value={form.reraNumber} onChange={set("reraNumber")} placeholder="UPRERAPRJXXXXXX" mono />
              </Field>
              <Field label="Authority Approval">
                <Select value={form.authorityApprovals} onChange={set("authorityApprovals")} options={[
                  { value: "", label: "Select…" },
                  { value: "GNIDA", label: "GNIDA" },
                  { value: "YEIDA", label: "YEIDA" },
                  { value: "Noida Authority", label: "Noida Authority" },
                  { value: "HPDA", label: "HPDA" },
                  { value: "GDA", label: "GDA" },
                  { value: "DDA", label: "DDA" },
                  { value: "Other", label: "Other" },
                ]} />
              </Field>
              <Field label="Land Ownership Details">
                <Select value={form.landOwnership} onChange={set("landOwnership")} options={[
                  { value: "", label: "Select…" },
                  { value: "Freehold", label: "Freehold" },
                  { value: "Leasehold", label: "Leasehold" },
                  { value: "Collaboration", label: "Collaboration / JV" },
                  { value: "Power of Attorney", label: "Power of Attorney" },
                  { value: "Other", label: "Other" },
                ]} />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Bank Loan Approval Partners" hint="Select all banks/lenders offering loans on this project">
                <MultiSelectChips value={form.bankLoanPartners} onChange={set("bankLoanPartners")} options={INDIAN_BANKS} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <Field label="Environmental Clearance">
                <Select value={form.environmentApproval} onChange={set("environmentApproval")} options={[
                  { value: "", label: "Select…" },
                  { value: "Approved", label: "Approved" },
                  { value: "Pending", label: "Pending" },
                  { value: "Not required", label: "Not required" },
                ]} />
              </Field>
              <Field label="OC Approved" hint="Occupancy Certificate received?">
                <Select value={form.ocApproved} onChange={set("ocApproved")} options={[
                  { value: "", label: "Select…" },
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]} />
              </Field>
              <Field label="Possession Date">
                <Input value={form.possessionDate} onChange={set("possessionDate")} placeholder="Dec 2027" />
              </Field>
            </div>
          </StepShell>
        )}

        {/* ── STEP 3: Apartment Details ── */}
        {step === 3 && (
          <StepShell title="Apartment Details" subtitle="Unit types, sizes and specifications.">
            <Field label="Unit Configurations / Sizes *" hint="Select all the BHK types and unit sizes available in this project">
              <MultiSelectChips
                value={form.configurations}
                onChange={set("configurations")}
                options={CONFIG_OPTIONS}
              />
            </Field>

            {/* BHK-wise unit types — add multiple per property */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="label">Unit Types (BHK-wise)</label>
                  <p className="text-xs text-ink-400 mb-1">
                    Add each apartment type separately with its own area & price.
                  </p>
                </div>
                <button type="button" onClick={addUnitType} className="btn-outline text-sm py-1.5 px-3">
                  + Add unit type
                </button>
              </div>

              <div className="space-y-4 mt-3">
                {unitTypes.map((u, i) => (
                  <div key={i} className="rounded-xl border border-ink-200 p-4 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-ink-600">
                        {u.config || `Unit type ${i + 1}`}
                      </span>
                      {unitTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUnitType(i)}
                          className="text-rose-500 hover:text-rose-700"
                          aria-label="Remove unit type"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Field label="Configuration">
                        <Select
                          value={u.config}
                          onChange={setUnitField(i, "config")}
                          options={[
                            { value: "", label: "Select…" },
                            ...CONFIG_OPTIONS.map((c) => ({ value: c, label: c })),
                          ]}
                        />
                      </Field>
                      <Field label="Super Area (sq.ft.)">
                        <Input value={u.superArea} onChange={setUnitField(i, "superArea")} placeholder="e.g. 1450" />
                      </Field>
                      <Field label="Carpet Area (sq.ft.)">
                        <Input value={u.carpetArea} onChange={setUnitField(i, "carpetArea")} placeholder="e.g. 1100" />
                      </Field>
                      <Field label="Bathrooms">
                        <Input value={u.bathrooms} onChange={setUnitField(i, "bathrooms")} placeholder="e.g. 2" type="number" />
                      </Field>
                      <Field label="Balcony Area (sq.ft.)">
                        <Input value={u.balconyArea} onChange={setUnitField(i, "balconyArea")} placeholder="e.g. 120" />
                      </Field>
                      <Field label="Starting Price (₹)">
                        <Input value={u.price} onChange={setUnitField(i, "price")} placeholder="e.g. 9500000" type="number" />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <Field label="Super Area Range (sq.ft.)" hint="e.g. 1050–2100 sq.ft.">
                <Input value={form.superArea} onChange={set("superArea")} placeholder="1050–2100 sq.ft." />
              </Field>
              <Field label="Carpet Area Range (sq.ft.)">
                <Input value={form.carpetArea} onChange={set("carpetArea")} placeholder="840–1680 sq.ft." />
              </Field>
              <Field label="Ceiling Height">
                <Input value={form.ceilingHeight} onChange={set("ceilingHeight")} placeholder="e.g. 10 ft" />
              </Field>
              <Field label="Balcony & Utility Area">
                <Input value={form.balconyArea} onChange={set("balconyArea")} placeholder="e.g. 120 sq.ft." />
              </Field>
              <Field label="Apartments per Floor (per Tower)">
                <Input value={form.unitsPerFloor} onChange={set("unitsPerFloor")} placeholder="e.g. 4" type="number" />
              </Field>
              <Field label="Number of Lifts per Tower">
                <Input value={form.liftsPerTower} onChange={set("liftsPerTower")} placeholder="e.g. 3" type="number" />
              </Field>
            </div>

            {/* Facing & furnishing */}
            <div className="mt-6 space-y-5">
              <Field label="Facing / Direction">
                <ButtonGroup value={form.facing} onChange={set("facing")} options={opt(FACING)} />
              </Field>
              <Field label="Furnishing">
                <ButtonGroup value={form.furnishing} onChange={set("furnishing")} options={opt(FURNISHING)} />
              </Field>
            </div>

            {/* Construction & finishing specs */}
            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <Field label="Construction Type">
                <Select value={form.constructionType} onChange={set("constructionType")} options={[{ value: "", label: "Select…" }, ...opt(CONSTRUCTION_TYPE)]} />
              </Field>
              <Field label="Age of Property">
                <Input value={form.ageOfProperty} onChange={set("ageOfProperty")} placeholder="e.g. New / 2 years" />
              </Field>
            </div>
            <div className="mt-5 space-y-5">
              <Field label="Flooring Specification" hint="Select all that apply">
                <MultiSelectChips value={form.flooringSpec} onChange={set("flooringSpec")} options={FLOORING} />
              </Field>
              <Field label="Kitchen Specification">
                <ButtonGroup value={form.kitchenSpec} onChange={set("kitchenSpec")} options={opt(KITCHEN)} />
              </Field>
              <Field label="Bathroom Fittings">
                <ButtonGroup value={form.bathroomFittings} onChange={set("bathroomFittings")} options={opt(BATHROOM)} />
              </Field>
              <Field label="Vaastu Compliance">
                <ButtonGroup value={form.vaastuCompliance} onChange={set("vaastuCompliance")} options={opt(VAASTU)} />
              </Field>
              <Field label="Reserved Parking" hint="Select all that apply">
                <MultiSelectChips value={form.reservedParking} onChange={set("reservedParking")} options={PARKING} />
              </Field>
              <Field label="Property Video / YouTube Link" hint="Optional — a walkthrough or promo video">
                <Input value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://youtube.com/watch?v=…" />
              </Field>
            </div>

            {/* Floor plan uploads */}
            <div className="mt-6">
              <FileUploader
                label="Floor Plans & Layouts"
                hint="Upload PDF or image files for each BHK type"
                accept="image/*,.pdf"
                multiple
                folder="prap/projects/floor-plans"
                files={floorPlans}
                onChange={setFloorPlans}
              />
            </div>
          </StepShell>
        )}

        {/* ── STEP 4: Amenities ── */}
        {step === 4 && (
          <StepShell title="Amenities & Lifestyle Features" subtitle="Select all amenities this project offers — these show as icon tags on the website.">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="label !mb-0">Project amenities</label>
                <span className="text-xs text-ink-400">{amenityTags.length} selected</span>
              </div>
              <AmenityPicker selected={amenityTags} onToggle={toggleAmenity} />
            </div>

            <SectionHeading icon={Star} label="Additional details (optional)" className="mb-4" />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Clubhouse Details">
                <Input value={form.clubhouseDetails} onChange={set("clubhouseDetails")} placeholder="e.g. 30,000 sq.ft. multi-activity clubhouse" />
              </Field>
              <Field label="Swimming Pool">
                <Input value={form.swimmingPool} onChange={set("swimmingPool")} placeholder="e.g. Olympic-size + kids pool" />
              </Field>
              <Field label="Gymnasium">
                <Input value={form.gymnasium} onChange={set("gymnasium")} placeholder="e.g. Fully equipped, 5000 sq.ft." />
              </Field>
              <Field label="Sports Facilities" hint="Comma-separated">
                <Input value={form.sportsFacilities} onChange={set("sportsFacilities")} placeholder="Tennis, Basketball, Cricket Net, Squash" />
              </Field>
              <Field label="Kids Play Area">
                <Input value={form.kidsPlayArea} onChange={set("kidsPlayArea")} placeholder="e.g. Themed outdoor play zone" />
              </Field>
              <Field label="Landscaped Greens">
                <Input value={form.landscapedGreens} onChange={set("landscapedGreens")} placeholder="e.g. 70% open green area" />
              </Field>
              <Field label="Jogging / Walking Track">
                <Input value={form.joggingTrack} onChange={set("joggingTrack")} placeholder="e.g. 1.2 km tree-lined track" />
              </Field>
              <Field label="Security Features">
                <Input value={form.securityFeatures} onChange={set("securityFeatures")} placeholder="3-tier security, RFID, video door phone" />
              </Field>
              <Field label="Smart Home Features">
                <Input value={form.smartHome} onChange={set("smartHome")} placeholder="App-controlled lighting, locks, AC" />
              </Field>
              <Field label="Power Backup">
                <Input value={form.powerBackup} onChange={set("powerBackup")} placeholder="e.g. 100% DG backup for all units" />
              </Field>
            </div>
          </StepShell>
        )}

        {/* ── STEP 5: Construction, Location & Investment ── */}
        {step === 5 && (
          <StepShell title="Location, Construction & Investment" subtitle="Specifications, connectivity and investment outlook.">
            <SectionHeading icon={Wrench} label="Doors, Windows & Construction" />
            <div className="mt-4 space-y-5">
              <Field label="Main Door" hint="Select all that apply">
                <MultiSelectChips value={form.doorMain} onChange={set("doorMain")} options={DOOR_MAIN} />
              </Field>
              <Field label="Internal Doors" hint="Select all that apply">
                <MultiSelectChips value={form.doorInternal} onChange={set("doorInternal")} options={DOOR_INTERNAL} />
              </Field>
              <Field label="Window Material" hint="Select all that apply">
                <MultiSelectChips value={form.windowMaterial} onChange={set("windowMaterial")} options={WINDOW_MATERIAL} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <Field label="Electrical Specifications">
                <Input value={form.electricalSpec} onChange={set("electricalSpec")} placeholder="e.g. Legrand/Havells modular switches" />
              </Field>
              <Field label="Air Conditioning Provision">
                <Input value={form.acProvision} onChange={set("acProvision")} placeholder="e.g. Provision in all rooms" />
              </Field>
              <Field label="Construction Technology">
                <Input value={form.constructionTech} onChange={set("constructionTech")} placeholder="e.g. MIVAN / Alu-form" />
              </Field>
            </div>

            <SectionHeading icon={MapPin} label="Location & Connectivity" className="mt-8" />
            <div className="grid sm:grid-cols-2 gap-5 mt-4">
              <Field label="Distance from Metro Station">
                <Input value={form.metroDistance} onChange={set("metroDistance")} placeholder="e.g. 2 km from YEIDA metro" />
              </Field>
              <Field label="Nearby Expressways">
                <Input value={form.nearbyExpressways} onChange={set("nearbyExpressways")} placeholder="YEA, Noida Expressway, FNG" />
              </Field>
              <Field label="Nearby Schools & Hospitals">
                <Input value={form.nearbySchoolsHospitals} onChange={set("nearbySchoolsHospitals")} placeholder="Ryan Int'l 3 km, Jaypee Hospital 5 km" />
              </Field>
              <Field label="Shopping Malls & Markets">
                <Input value={form.nearbyMalls} onChange={set("nearbyMalls")} placeholder="Logix City Centre 4 km, Gardens Galleria 6 km" />
              </Field>
              <Field label="Airport Connectivity">
                <Input value={form.airportConnectivity} onChange={set("airportConnectivity")} placeholder="e.g. 25 min to Jewar International Airport" />
              </Field>
              <Field label="Future Infrastructure Developments">
                <Input value={form.futureInfra} onChange={set("futureInfra")} placeholder="Jewar Airport, YEIDA metro, Film City" />
              </Field>
            </div>

            <SectionHeading icon={TrendingUp} label="Investment Perspective" className="mt-8" />
            <div className="grid sm:grid-cols-2 gap-5 mt-4">
              <Field label="Expected Appreciation Potential">
                <Input value={form.appreciationPotential} onChange={set("appreciationPotential")} placeholder="e.g. 12–15% p.a. over 5 years" />
              </Field>
              <Field label="Rental Demand in Area">
                <Input value={form.rentalDemand} onChange={set("rentalDemand")} placeholder="e.g. High — IT corridor nearby" />
              </Field>
              <Field label="Builder's Past Delivery Record">
                <Input value={form.builderTrackRecord} onChange={set("builderTrackRecord")} placeholder="e.g. 8 projects delivered on time since 2010" />
              </Field>
              <Field label="Density Planning">
                <Input value={form.densityPlanning} onChange={set("densityPlanning")} placeholder="e.g. Low density — 800 units on 10 acres" />
              </Field>
            </div>
          </StepShell>
        )}

        {/* ── STEP 6: Safety, Buyer Checks & Media ── */}
        {step === 6 && (
          <StepShell title="Safety, Buyer Checks & Media" subtitle="Final checks, description and file uploads.">
            <SectionHeading icon={ShieldCheck} label="Safety & Maintenance" />
            <div className="grid sm:grid-cols-2 gap-5 mt-4">
              <Field label="Fire Safety Systems">
                <Input value={form.fireSafety} onChange={set("fireSafety")} placeholder="Sprinklers, fire hydrants, smoke detectors" />
              </Field>
              <Field label="CCTV & Security Systems">
                <Input value={form.cctvSecurity} onChange={set("cctvSecurity")} placeholder="360° coverage, 24x7 monitoring" />
              </Field>
              <Field label="Gated Society Features">
                <Input value={form.gatedFeatures} onChange={set("gatedFeatures")} placeholder="Boom barriers, intercoms, visitor management" />
              </Field>
              <Field label="Earthquake Resistant Structure">
                <Select value={form.earthquakeResistant} onChange={set("earthquakeResistant")} options={[
                  { value: "", label: "Select…" },
                  { value: "Yes — Zone IV compliant", label: "Yes — Zone IV compliant" },
                  { value: "Yes — Zone V compliant", label: "Yes — Zone V compliant" },
                  { value: "Standard RCC", label: "Standard RCC" },
                ]} />
              </Field>
              <Field label="Water & Sewage Management">
                <Input value={form.waterSewage} onChange={set("waterSewage")} placeholder="STP, RO plant, rainwater harvesting" />
              </Field>
            </div>

            <SectionHeading icon={Eye} label="Buyer Verification Checks" className="mt-8" />
            <div className="grid sm:grid-cols-2 gap-5 mt-4">
              <Field label="Open Area Percentage">
                <Select value={form.openAreaPercent} onChange={set("openAreaPercent")} options={[{ value: "", label: "Select…" }, ...opt(OAP_PERCENT)]} />
              </Field>
              <Field label="Booking Amount (₹)">
                <Input value={form.bookingAmount} onChange={set("bookingAmount")} placeholder="e.g. 500000" type="number" />
              </Field>
              <Field label="Green Belt / Park Facing">
                <Input value={form.greenBeltFacing} onChange={set("greenBeltFacing")} placeholder="e.g. Most towers face central greens" />
              </Field>
              <Field label="Four-side Open">
                <Select value={form.fourSideOpen} onChange={set("fourSideOpen")} options={[
                  { value: "", label: "Select…" },
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                  { value: "Partial", label: "Partial" },
                ]} />
              </Field>
              <Field label="Ventilation & Sunlight Planning">
                <Input value={form.ventilationPlan} onChange={set("ventilationPlan")} placeholder="e.g. Cross-ventilation in all units" />
              </Field>
              <Field label="Sample Flat Available">
                <Select value={form.sampleFlat} onChange={set("sampleFlat")} options={[
                  { value: "", label: "Select…" },
                  { value: "Yes — open for visits", label: "Yes — open for visits" },
                  { value: "Yes — by appointment", label: "Yes — by appointment" },
                  { value: "No", label: "No" },
                ]} />
              </Field>
              <Field label="Exit & Resale Policy">
                <Input value={form.exitResalePolicy} onChange={set("exitResalePolicy")} placeholder="e.g. Free resale after 1 year, builder buy-back option" />
              </Field>
            </div>

            <div className="mt-8 space-y-5">
              <Field label="Project Description" hint="Highlights the story, vision and USPs — shown on the project detail page">
                <Textarea value={form.description} onChange={set("description")} placeholder="Located on the Yamuna Expressway with unmatched connectivity to Jewar International Airport…" rows={4} />
              </Field>
              <Field label="Key Highlights" hint="Comma-separated short bullets — shown on cards">
                <div className="flex items-center justify-end mb-1">
                  <button type="button" onClick={autoHighlights} className="btn-outline text-xs py-1 px-2">
                    ✨ Auto-generate from details
                  </button>
                </div>
                <Input value={form.highlights} onChange={set("highlights")} placeholder="Earn 75k Coins, 5 min from Expressway, Low density" />
              </Field>
            </div>

            {/* Media uploads */}
            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              <FileUploader
                label="Cover Image *"
                hint="16:9 recommended — this appears on the home page and listing cards"
                accept="image/*"
                folder="prap/projects/covers"
                files={coverImages}
                onChange={setCoverImages}
              />
              <FileUploader
                label="Gallery Images"
                hint="Up to 10 images — project photos, renders, amenities"
                accept="image/*"
                multiple
                folder="prap/projects/gallery"
                files={galleryImages}
                onChange={setGalleryImages}
              />
              <FileUploader
                label="PDF Brochure"
                hint="Official project brochure — shown as download on detail page (uploaded directly to Firebase, no size limit)"
                accept=".pdf"
                folder="projects/brochures"
                files={brochure}
                onChange={setBrochure}
                useFirebase
              />
            </div>

            {/* Review summary — confirm before publishing (99acres-style) */}
            <div className="mt-8 rounded-xl border border-ink-200 bg-ink-50/50 p-4">
              <h3 className="font-bold text-ink-900 mb-3">Review your listing</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <ReviewItem label="Project" value={form.name} />
                <ReviewItem label="Builder" value={form.builder} />
                <ReviewItem label="Type" value={form.projectType} />
                <ReviewItem label="City" value={[form.sector, form.city].filter(Boolean).join(", ")} />
                <ReviewItem label="Configurations" value={form.configurations} />
                <ReviewItem label="Unit types added" value={String(unitTypes.filter((u) => u.config).length)} />
                <ReviewItem label="Starting price" value={form.startingPrice ? `₹${Number(form.startingPrice).toLocaleString("en-IN")}` : ""} />
                <ReviewItem label="RERA" value={form.reraNumber} />
                <ReviewItem label="Cover image" value={coverImages.length ? "Uploaded" : "Missing"} />
                <ReviewItem label="Brochure" value={brochure.length ? "Uploaded" : "—"} />
              </dl>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex items-center gap-3 text-sm text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand-600 h-4 w-4"
                  checked={form.isListed}
                  onChange={(e) => set("isListed")(e.target.checked)}
                />
                <span><span className="font-semibold">Publish immediately</span> — uncheck to save as draft</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand-600 h-4 w-4"
                  checked={form.isHighDemand}
                  onChange={(e) => set("isHighDemand")(e.target.checked)}
                />
                <span><span className="font-semibold">Mark as “In High Demand”</span> — shows in the High Demand carousel</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand-600 h-4 w-4"
                  checked={form.isNewlyLaunched}
                  onChange={(e) => set("isNewlyLaunched")(e.target.checked)}
                />
                <span><span className="font-semibold">Mark as “Newly Launched”</span> — shows in the Newly Launched carousel</span>
              </label>
            </div>

            {submitError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                {submitError}
              </div>
            )}
          </StepShell>
        )}

        {/* Navigation — sticky bottom bar on mobile, inline on desktop */}
        <div className="mt-8 border-t border-ink-100 pt-6 sticky bottom-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 -mx-6 px-6 md:-mx-8 md:px-8 pb-4 md:pb-0 md:static md:bg-transparent md:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="btn-outline flex-1 sm:flex-none justify-center"
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <span className="hidden sm:inline text-xs text-ink-400 font-medium">Step {step} of {STEPS.length}</span>
            {step < STEPS.length ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
                className="btn-primary flex-1 sm:flex-none justify-center"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !form.name || !form.builder || !form.reraNumber}
                className="btn-primary flex-1 sm:flex-none justify-center"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : isEdit ? "Update Project" : "Save & Publish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-extrabold text-ink-900">{title}</h2>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-ink-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink-100 py-1.5">
      <dt className="text-ink-500">{label}</dt>
      <dd className={`font-medium text-right ${value && value !== "Missing" ? "text-ink-900" : "text-ink-400"}`}>
        {value || "—"}
      </dd>
    </div>
  );
}

function SectionHeading({ icon: Icon, label, className = "" }: {
  icon: React.ComponentType<any>; label: string; className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="font-bold text-ink-900">{label}</h3>
    </div>
  );
}
