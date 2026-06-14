import Link from "next/link";
import Image from "next/image";
import { formatINR } from "@/lib/projects";
import { listProjects } from "@/lib/projects-db";
import { buildMetadata } from "@/lib/seo";
import { BadgeCheck, MapPin, Search, X, Building2 } from "lucide-react";
import NearbyButton from "./NearbyButton";
import AmenityFilter from "./AmenityFilter";
import { amenitiesFromIds } from "@/lib/amenities";

export const metadata = buildMetadata({
  title: "All RERA-verified projects in Noida, Greater Noida & beyond",
  description:
    "Browse every RERA-verified residential & commercial project on PRAP. Filter by city, builder, budget & possession. Earn PRAP Coins on every site visit & booking.",
  path: "/projects",
  keywords: ["all projects in noida", "rera projects greater noida", "buy 3 bhk noida"],
});

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "New Launch", label: "New Launch" },
  { value: "Under Construction", label: "Under Construction" },
  { value: "Ready to Move", label: "Ready to Move" },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: { q?: string; city?: string; status?: string; near?: string; amenities?: string };
}) {
  const amenityIds = (searchParams?.amenities || "").split(",").map((s) => s.trim()).filter(Boolean);
  const list = await listProjects({
    q: searchParams?.q,
    city: searchParams?.city,
    status: searchParams?.status,
    amenities: amenityIds,
  });

  const selectedAmenities = amenitiesFromIds(amenityIds);
  const hasFilters = !!(searchParams?.q || searchParams?.city || searchParams?.status || searchParams?.near || amenityIds.length);

  return (
    <>
      <section className="bg-ink-950 text-white">
        <div className="container py-14 sm:py-16">
          <span className="eyebrow !text-sage-400">Discover projects</span>
          <h1 className="font-serif text-4xl md:text-6xl font-light tracking-[-0.02em] mt-4">Find projects near you</h1>
          <p className="mt-4 text-ink-200 max-w-2xl">
            RERA-verified residential & commercial projects in Noida, Greater Noida
            and across India. Search by area, filter by status, or use your location.
          </p>
          <form className="mt-7 grid md:grid-cols-12 gap-3" action="/projects">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-500" />
              <input
                name="q"
                defaultValue={searchParams?.q || ""}
                placeholder="Search by area, locality, project or builder…"
                className="input !text-ink-900 !pl-10"
              />
            </div>
            <select name="city" defaultValue={searchParams?.city || ""} className="input md:col-span-2 !text-ink-900">
              <option value="">All cities</option>
              <option>Noida</option>
              <option>Greater Noida</option>
              <option>Yamuna Expressway</option>
            </select>
            <select name="status" defaultValue={searchParams?.status || ""} className="input md:col-span-2 !text-ink-900">
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button className="btn-primary md:col-span-2">Search</button>
            {/* Preserve the amenity filter when submitting the text/city/status form */}
            {amenityIds.length > 0 && <input type="hidden" name="amenities" value={amenityIds.join(",")} />}
            <div className="md:col-span-12 flex flex-wrap gap-3">
              <NearbyButton />
              <AmenityFilter />
            </div>
          </form>
        </div>
      </section>

      <section className="container py-10 sm:py-12">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-ink-500">{list.length} project{list.length === 1 ? "" : "s"} found</p>
            {searchParams?.near && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1">
                <MapPin className="h-3.5 w-3.5" /> Near {searchParams.near}
              </span>
            )}
            {searchParams?.status && (
              <span className="rounded-full bg-ink-100 text-ink-700 text-xs font-medium px-3 py-1">{searchParams.status}</span>
            )}
            {searchParams?.q && (
              <span className="rounded-full bg-ink-100 text-ink-700 text-xs font-medium px-3 py-1">“{searchParams.q}”</span>
            )}
            {selectedAmenities.map((a) => {
              const Icon = a.icon;
              return (
                <span key={a.id} className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1">
                  <Icon className="h-3.5 w-3.5" /> {a.label}
                </span>
              );
            })}
          </div>
          {hasFilters && (
            <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-brand-700">
              <X className="h-4 w-4" /> Clear filters
            </Link>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="card overflow-hidden group hover:-translate-y-1 hover:shadow-soft transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                {p.cover ? (
                  <Image
                    src={p.cover}
                    alt={`${p.name} — ${p.builder} in ${p.city}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover hover-scale"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center bg-brand-50">
                    <Building2 className="h-10 w-10 text-brand-200" strokeWidth={1.2} />
                  </div>
                )}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[0.7rem] font-medium text-ink-900">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> RERA
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-white/85 backdrop-blur-md px-3 py-1 text-[0.7rem] font-medium text-ink-700">{p.status}</span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-xl text-ink-900 group-hover:text-brand-700 transition-colors">{p.name}</h3>
                <p className="text-sm text-ink-500 mt-0.5">{p.builder}</p>
                <p className="mt-2 text-sm text-ink-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} /> {p.sector ? `${p.sector}, ` : ""}{p.city}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-ink-700">{p.configuration.join(" · ")}</span>
                  <span className="font-bold text-brand-700">{formatINR(p.startingPrice)}+</span>
                </div>
                {(() => {
                  const tags = amenitiesFromIds(p.amenityTags ?? []);
                  if (tags.length === 0) return null;
                  return (
                    <div className="mt-3 flex items-center gap-3 text-ink-400 border-t border-ink-100 pt-3">
                      {tags.slice(0, 4).map((a) => {
                        const Icon = a.icon;
                        return <Icon key={a.id} className="h-4 w-4" aria-label={a.label} />;
                      })}
                      {tags.length > 4 && <span className="text-xs">+{tags.length - 4}</span>}
                    </div>
                  );
                })()}
              </div>
            </Link>
          ))}
          {list.length === 0 && (
            <p className="text-ink-500 col-span-full text-center py-10">No projects match your filters.</p>
          )}
        </div>
      </section>
    </>
  );
}
