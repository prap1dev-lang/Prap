import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { uploadProjectImage } from "@/lib/storage";
import { slugify } from "@/lib/utils";

export const metadata = buildMetadata({ title: "Add project · Admin", path: "/admin/projects/new", noIndex: true });
export const dynamic = "force-dynamic";

async function createProject(formData: FormData) {
  "use server";
  await requireAdmin();

  const get = (k: string) => String(formData.get(k) || "").trim();
  const getList = (k: string) =>
    get(k).split(",").map((s) => s.trim()).filter(Boolean);

  const name = get("name");
  const builder = get("builder");
  const city = get("city");
  if (!name || !builder || !city) {
    throw new Error("Name, builder and city are required");
  }

  const slug = slugify(`${name}-${city}`);

  // ---- Upload cover (single) ----
  const cover = formData.get("cover") as File | null;
  let coverUrl: string | null = null;
  if (cover && cover.size > 0) {
    coverUrl = await uploadProjectImage(cover, { folder: "covers", filename: cover.name });
  }

  // ---- Upload gallery (multi) ----
  const galleryFiles = formData.getAll("gallery").filter((f): f is File => f instanceof File && f.size > 0);
  const galleryUrls: string[] = [];
  for (const f of galleryFiles) {
    galleryUrls.push(await uploadProjectImage(f, { folder: "gallery", filename: f.name }));
  }

  const sb = supabaseAdmin();
  const { error } = await sb.from("projects").insert({
    slug,
    name,
    builder,
    city,
    sector: get("sector") || null,
    rera_number: get("rera_number"),
    configurations: getList("configurations"),
    starting_price_inr: Number(get("starting_price_inr") || 0),
    max_price_inr: Number(get("max_price_inr") || get("starting_price_inr") || 0),
    possession: get("possession") || null,
    amenities: getList("amenities"),
    highlights: getList("highlights"),
    cover_url: coverUrl,
    gallery: galleryUrls,
    description: get("description") || null,
    status: get("status") || "under_construction",
    is_listed: get("is_listed") === "on" || get("is_listed") === "true",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  redirect("/admin/projects");
}

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <div className="max-w-3xl">
      <nav className="text-sm text-ink-500 mb-3">
        <Link href="/admin/projects" className="hover:text-brand-700">← Back to projects</Link>
      </nav>
      <h1 className="text-3xl font-extrabold tracking-tight">Add a new property</h1>
      <p className="mt-2 text-ink-500">Listed projects appear on the home page and <Link href="/projects" className="underline">/projects</Link>.</p>

      <form action={createProject} encType="multipart/form-data" className="card p-6 mt-8 space-y-6">
        <fieldset className="grid sm:grid-cols-2 gap-4">
          <legend className="font-bold mb-3">Basics</legend>
          <Field label="Project name" name="name" required placeholder="e.g. VVIP Namah" />
          <Field label="Builder" name="builder" required placeholder="e.g. VVIP Group" />
          <div>
            <label className="label">City</label>
            <select name="city" required className="input">
              <option>Noida</option>
              <option>Greater Noida</option>
              <option>Yamuna Expressway</option>
            </select>
          </div>
          <Field label="Sector / locality" name="sector" placeholder="Sector 16C" />
          <Field label="RERA number" name="rera_number" required placeholder="UPRERAPRJXXXXXX" mono />
          <div>
            <label className="label">Status</label>
            <select name="status" className="input">
              <option value="new_launch">New Launch</option>
              <option value="under_construction" defaultChecked>Under construction</option>
              <option value="ready_to_move">Ready to move</option>
            </select>
          </div>
        </fieldset>

        <fieldset className="grid sm:grid-cols-2 gap-4">
          <legend className="font-bold mb-3">Pricing & possession</legend>
          <Field label="Starting price (INR)" name="starting_price_inr" type="number" placeholder="9500000" />
          <Field label="Max price (INR)" name="max_price_inr" type="number" placeholder="32000000" />
          <Field label="Possession" name="possession" placeholder="Dec 2027" />
          <Field label="Configurations (comma-separated)" name="configurations" placeholder="2 BHK, 3 BHK, 4 BHK" />
        </fieldset>

        <fieldset>
          <legend className="font-bold mb-3">Description & features</legend>
          <div className="space-y-4">
            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                rows={4}
                className="input"
                placeholder="Tell the story of this project — location, vision, USPs…"
              />
            </div>
            <Field
              label="Highlights (comma-separated)"
              name="highlights"
              placeholder="5 min from Expressway, Earn 75k Coins, Direct from builder"
            />
            <Field
              label="Amenities (comma-separated)"
              name="amenities"
              placeholder="Clubhouse, Swimming Pool, Gym, EV Charging, 24x7 Security"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-bold mb-3">Images</legend>
          <div className="space-y-4">
            <div>
              <label className="label">Cover image <span className="text-xs text-ink-500 font-normal">(shown on home & listings — 16:9 recommended)</span></label>
              <input name="cover" type="file" accept="image/*" className="input !p-2" />
            </div>
            <div>
              <label className="label">Gallery images <span className="text-xs text-ink-500 font-normal">(up to 6)</span></label>
              <input name="gallery" type="file" accept="image/*" multiple className="input !p-2" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input name="is_listed" type="checkbox" defaultChecked className="accent-brand-600" />
            <span>Publish immediately (uncheck to keep as draft)</span>
          </label>
        </fieldset>

        <div className="flex gap-2">
          <button className="btn-primary">Create project</button>
          <Link href="/admin/projects" className="btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
  mono = false,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-rose-600"> *</span>}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={`input ${mono ? "font-mono text-sm" : ""}`}
      />
    </div>
  );
}
