"use client";
import { useState, useRef } from "react";
import {
  CheckCircle2, ChevronRight, ChevronLeft, Loader2, Upload, X,
  Building2, Scale, Home, DollarSign, Star, Wrench, MapPin,
  TrendingUp, ShieldCheck, Eye, FileText,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UploadedFile {
  name: string;
  url: string;
  publicId: string;
}

interface FormState {
  // Step 1 — Basic Information
  name: string;
  builder: string;
  location: string;
  city: string;
  sector: string;
  projectType: string;
  totalLandArea: string;
  towers: string;
  floors: string;
  totalUnits: string;
  status: string;

  // Step 2 — Legal & Approvals
  reraNumber: string;
  authorityApprovals: string;
  landOwnership: string;
  bankLoanPartners: string;
  environmentApproval: string;
  fireApproval: string;
  completionTimeline: string;
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

  // Step 4 — Pricing & Payment
  bsp: string;
  startingPrice: string;
  maxPrice: string;
  plcCharges: string;
  parkingCharges: string;
  clubMembership: string;
  maintenanceCharges: string;
  paymentPlan: string;
  bookingAmount: string;
  additionalCosts: string;

  // Step 5 — Amenities
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

  // Step 6 — Construction, Location & Investment
  flooringSpec: string;
  kitchenSpec: string;
  bathroomFittings: string;
  doorWindowQuality: string;
  electricalSpec: string;
  acProvision: string;
  constructionTech: string;
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

  // Step 7 — Safety, Buyer Checks & Media
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
  description: string;
  highlights: string;
  isListed: boolean;
}

const INITIAL: FormState = {
  name: "", builder: "", location: "", city: "Noida", sector: "",
  projectType: "Residential", totalLandArea: "", towers: "", floors: "",
  totalUnits: "", status: "under_construction",
  reraNumber: "", authorityApprovals: "", landOwnership: "", bankLoanPartners: "",
  environmentApproval: "", fireApproval: "", completionTimeline: "", possessionDate: "",
  configurations: "", superArea: "", carpetArea: "", ceilingHeight: "", balconyArea: "",
  unitsPerFloor: "", liftsPerTower: "", vaastuFacing: "",
  bsp: "", startingPrice: "", maxPrice: "", plcCharges: "", parkingCharges: "",
  clubMembership: "", maintenanceCharges: "", paymentPlan: "", bookingAmount: "", additionalCosts: "",
  clubhouseDetails: "", swimmingPool: "", gymnasium: "", sportsFacilities: "",
  kidsPlayArea: "", landscapedGreens: "", joggingTrack: "", securityFeatures: "",
  smartHome: "", powerBackup: "",
  flooringSpec: "", kitchenSpec: "", bathroomFittings: "", doorWindowQuality: "",
  electricalSpec: "", acProvision: "", constructionTech: "",
  metroDistance: "", nearbyExpressways: "", nearbySchoolsHospitals: "", nearbyMalls: "",
  airportConnectivity: "", futureInfra: "",
  appreciationPotential: "", rentalDemand: "", builderTrackRecord: "", densityPlanning: "",
  fireSafety: "", cctvSecurity: "", gatedFeatures: "", earthquakeResistant: "",
  waterSewage: "", openAreaPercent: "", greenBeltFacing: "", fourSideOpen: "",
  ventilationPlan: "", sampleFlat: "", exitResalePolicy: "",
  description: "", highlights: "", isListed: true,
};

// ─── Steps definition ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "Basic Info", icon: Building2 },
  { id: 2, title: "Legal & Approvals", icon: Scale },
  { id: 3, title: "Apartment Details", icon: Home },
  { id: 4, title: "Pricing & Payment", icon: DollarSign },
  { id: 5, title: "Amenities", icon: Star },
  { id: 6, title: "Location & Investment", icon: MapPin },
  { id: 7, title: "Safety & Media", icon: ShieldCheck },
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

function Input({ value, onChange, placeholder = "", type = "text", mono = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean;
}) {
  return (
    <input
      className={`input ${mono ? "font-mono text-sm" : ""}`}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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

// ─── Image/PDF uploader ───────────────────────────────────────────────────────

function FileUploader({
  label, hint, accept, multiple = false, folder, files, onChange,
}: {
  label: string; hint?: string; accept: string; multiple?: boolean;
  folder: string; files: UploadedFile[]; onChange: (files: UploadedFile[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(picked: FileList | null) {
    if (!picked || picked.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const results: UploadedFile[] = [];
      for (const file of Array.from(picked)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const body = await res.json();
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
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
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

export default function ProjectWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [coverImages, setCoverImages] = useState<UploadedFile[]>([]);
  const [galleryImages, setGalleryImages] = useState<UploadedFile[]>([]);
  const [floorPlans, setFloorPlans] = useState<UploadedFile[]>([]);
  const [brochure, setBrochure] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof FormState) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

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
      };
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "Failed to create project");
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
        <h2 className="text-2xl font-extrabold text-ink-900">Project created!</h2>
        <p className="text-ink-500">The project has been saved and {form.isListed ? "published" : "saved as draft"}.</p>
        <div className="flex gap-3 justify-center pt-2">
          <a href="/admin/projects" className="btn-primary">Back to projects</a>
          <button onClick={() => { setForm(INITIAL); setStep(1); setDone(false); }} className="btn-outline">Add another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step progress bar */}
      <div className="card p-4">
        <div className="flex items-center gap-1 overflow-x-auto">
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
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <Icon className="h-4 w-4 shrink-0" />
                  )}
                  <span className="hidden sm:inline whitespace-nowrap">{s.title}</span>
                  <span className="sm:hidden">{s.id}</span>
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

      {/* Step panels */}
      <div className="card p-6 md:p-8">
        {/* ── STEP 1: Basic Information ── */}
        {step === 1 && (
          <StepShell title="Project Basic Information" subtitle="Core details about the project.">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Project Name *">
                <Input value={form.name} onChange={set("name")} placeholder="e.g. VVIP Namah" />
              </Field>
              <Field label="Developer / Builder Name *">
                <Input value={form.builder} onChange={set("builder")} placeholder="e.g. VVIP Group" />
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
              <Field label="Project Type *">
                <Select value={form.projectType} onChange={set("projectType")} options={[
                  { value: "Residential", label: "Residential" },
                  { value: "Commercial", label: "Commercial" },
                  { value: "Mixed Use", label: "Mixed Use" },
                  { value: "Plots", label: "Plots / Villas" },
                ]} />
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
              <Field label="Project Status *">
                <Select value={form.status} onChange={set("status")} options={[
                  { value: "new_launch", label: "Pre-launch / New Launch" },
                  { value: "under_construction", label: "Under Construction" },
                  { value: "ready_to_move", label: "Ready to Move" },
                ]} />
              </Field>
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
              <Field label="Authority Approvals" hint="e.g. GNIDA, YEIDA, HPDA — comma separated">
                <Input value={form.authorityApprovals} onChange={set("authorityApprovals")} placeholder="GNIDA, YEIDA" />
              </Field>
              <Field label="Land Ownership Details">
                <Input value={form.landOwnership} onChange={set("landOwnership")} placeholder="Freehold / Leasehold" />
              </Field>
              <Field label="Bank Loan Approval Partners" hint="Comma-separated bank names">
                <Input value={form.bankLoanPartners} onChange={set("bankLoanPartners")} placeholder="SBI, HDFC, ICICI" />
              </Field>
              <Field label="Environmental Clearance">
                <Select value={form.environmentApproval} onChange={set("environmentApproval")} options={[
                  { value: "", label: "Select…" },
                  { value: "Approved", label: "Approved" },
                  { value: "Pending", label: "Pending" },
                  { value: "Not required", label: "Not required" },
                ]} />
              </Field>
              <Field label="Fire NOC / Approval">
                <Select value={form.fireApproval} onChange={set("fireApproval")} options={[
                  { value: "", label: "Select…" },
                  { value: "Approved", label: "Approved" },
                  { value: "Pending", label: "Pending" },
                ]} />
              </Field>
              <Field label="Completion Timeline">
                <Input value={form.completionTimeline} onChange={set("completionTimeline")} placeholder="e.g. Q4 2027" />
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
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Unit Configurations *" hint="Comma-separated: 2 BHK, 3 BHK, 4 BHK">
                <Input value={form.configurations} onChange={set("configurations")} placeholder="2 BHK, 3 BHK, 4 BHK" />
              </Field>
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
              <Field label="Vaastu / Facing Details">
                <Input value={form.vaastuFacing} onChange={set("vaastuFacing")} placeholder="e.g. East & North facing, Vaastu compliant" />
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

        {/* ── STEP 4: Pricing & Payment ── */}
        {step === 4 && (
          <StepShell title="Pricing & Payment Information" subtitle="All cost components and payment terms.">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="BSP / Price per sq.ft. (₹)">
                <Input value={form.bsp} onChange={set("bsp")} placeholder="e.g. 6500" type="number" />
              </Field>
              <Field label="Starting Price (₹) *">
                <Input value={form.startingPrice} onChange={set("startingPrice")} placeholder="e.g. 9500000" type="number" />
              </Field>
              <Field label="Max Price (₹)">
                <Input value={form.maxPrice} onChange={set("maxPrice")} placeholder="e.g. 32000000" type="number" />
              </Field>
              <Field label="PLC Charges" hint="Preferential location charges">
                <Input value={form.plcCharges} onChange={set("plcCharges")} placeholder="e.g. ₹150/sq.ft." />
              </Field>
              <Field label="Car Parking Charges">
                <Input value={form.parkingCharges} onChange={set("parkingCharges")} placeholder="e.g. ₹3,00,000" />
              </Field>
              <Field label="Club Membership Charges">
                <Input value={form.clubMembership} onChange={set("clubMembership")} placeholder="e.g. ₹1,50,000" />
              </Field>
              <Field label="Maintenance Charges (per sq.ft./month)">
                <Input value={form.maintenanceCharges} onChange={set("maintenanceCharges")} placeholder="e.g. ₹3/sq.ft./month" />
              </Field>
              <Field label="Booking Amount">
                <Input value={form.bookingAmount} onChange={set("bookingAmount")} placeholder="e.g. ₹5,00,000" />
              </Field>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-5">
              <Field label="Payment Plan" hint="e.g. 10:80:10, construction-linked, subvention">
                <Textarea value={form.paymentPlan} onChange={set("paymentPlan")} placeholder="10% on booking, 80% linked to construction milestones, 10% on possession…" rows={3} />
              </Field>
              <Field label="Additional / Hidden Costs to Note">
                <Textarea value={form.additionalCosts} onChange={set("additionalCosts")} placeholder="GST, stamp duty, legal charges…" rows={3} />
              </Field>
            </div>
          </StepShell>
        )}

        {/* ── STEP 5: Amenities ── */}
        {step === 5 && (
          <StepShell title="Amenities & Lifestyle Features" subtitle="Club and lifestyle details.">
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

        {/* ── STEP 6: Construction, Location & Investment ── */}
        {step === 6 && (
          <StepShell title="Location, Construction & Investment" subtitle="Specifications, connectivity and investment outlook.">
            <SectionHeading icon={Wrench} label="Construction Specifications" />
            <div className="grid sm:grid-cols-2 gap-5 mt-4">
              <Field label="Flooring Specifications">
                <Input value={form.flooringSpec} onChange={set("flooringSpec")} placeholder="e.g. Italian marble in living, vitrified in bedrooms" />
              </Field>
              <Field label="Kitchen Specifications">
                <Input value={form.kitchenSpec} onChange={set("kitchenSpec")} placeholder="e.g. Modular with Hettich fittings" />
              </Field>
              <Field label="Bathroom Fittings">
                <Input value={form.bathroomFittings} onChange={set("bathroomFittings")} placeholder="e.g. Jaguar/Kohler CP fittings" />
              </Field>
              <Field label="Door & Window Quality">
                <Input value={form.doorWindowQuality} onChange={set("doorWindowQuality")} placeholder="e.g. UPVC double-glazed windows" />
              </Field>
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

        {/* ── STEP 7: Safety, Buyer Checks & Media ── */}
        {step === 7 && (
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
                <Input value={form.openAreaPercent} onChange={set("openAreaPercent")} placeholder="e.g. 72%" />
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
                hint="Official project brochure — shown as download on detail page"
                accept=".pdf"
                folder="prap/projects/brochures"
                files={brochure}
                onChange={setBrochure}
              />
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-3 text-sm text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand-600 h-4 w-4"
                  checked={form.isListed}
                  onChange={(e) => set("isListed")(e.target.checked)}
                />
                <span><span className="font-semibold">Publish immediately</span> — uncheck to save as draft</span>
              </label>
            </div>

            {submitError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                {submitError}
              </div>
            )}
          </StepShell>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-100 pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="btn-outline"
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-xs text-ink-400 font-medium">Step {step} of {STEPS.length}</span>
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
              className="btn-primary"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !form.name || !form.builder || !form.reraNumber}
              className="btn-primary"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Create Project"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-ink-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {children}
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
