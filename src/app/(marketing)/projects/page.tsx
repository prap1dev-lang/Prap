import Link from "next/link";
import { formatINR } from "@/lib/projects";
import { listProjects } from "@/lib/projects-db";
import { buildMetadata } from "@/lib/seo";
import { BadgeCheck, MapPin, Search } from "lucide-react";

export const metadata = buildMetadata({
  title: "All RERA-verified projects in Noida, Greater Noida & beyond",
  description:
    "Browse every RERA-verified residential & commercial project on PRAP. Filter by city, builder, budget & possession. Earn PRAP Coins on every site visit & booking.",
  path: "/projects",
  keywords: ["all projects in noida", "rera projects greater noida", "buy 3 bhk noida"],
});

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: { q?: string; city?: string };
}) {
  const list = await listProjects({ q: searchParams?.q, city: searchParams?.city });

  return (
    <>
      <section className="bg-ink-950 text-white">
        <div className="container py-14">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">All projects on PRAP</h1>
          <p className="mt-3 text-ink-200 max-w-2xl">
            Hand-curated, RERA-verified residential & commercial projects in Noida,
            Greater Noida and across India. Every visit earns you real money.
          </p>
          <form className="mt-7 grid md:grid-cols-12 gap-3" action="/projects">
            <div className="md:col-span-7 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-500" />
              <input
                name="q"
                defaultValue={searchParams?.q || ""}
                placeholder="Search projects, builders or sectors…"
                className="input !text-ink-900 !pl-10"
              />
            </div>
            <select name="city" defaultValue={searchParams?.city || ""} className="input md:col-span-3 !text-ink-900">
              <option value="">All cities</option>
              <option>Noida</option>
              <option>Greater Noida</option>
              <option>Yamuna Expressway</option>
            </select>
            <button className="btn-primary md:col-span-2">Search</button>
          </form>
        </div>
      </section>

      <section className="container py-12">
        <p className="text-sm text-ink-500 mb-4">{list.length} project{list.length === 1 ? "" : "s"} found</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="card overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
                {p.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover} alt={`${p.name} — ${p.builder} in ${p.city}`} className="h-full w-full object-cover group-hover:scale-105 transition" loading="lazy" />
                )}
                <span className="absolute top-3 left-3 badge !bg-white/95 !text-ink-900">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> RERA
                </span>
                <span className="absolute top-3 right-3 badge">{p.status}</span>
              </div>
              <div className="p-5">
                <h2 className="font-bold text-ink-900 text-lg group-hover:text-brand-700 transition">{p.name}</h2>
                <p className="text-sm text-ink-500 mt-0.5">{p.builder}</p>
                <p className="mt-2 text-sm text-ink-700 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {p.sector}, {p.city}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-ink-700">{p.configuration.join(" · ")}</span>
                  <span className="font-bold text-brand-700">{formatINR(p.startingPrice)}+</span>
                </div>
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
