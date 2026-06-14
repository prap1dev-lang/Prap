import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatINR } from "@/lib/projects";
import { getProjectBySlug, listProjectSlugs } from "@/lib/projects-db";
import { DETAIL_SECTIONS } from "@/lib/project-fields";
import Gallery from "./Gallery";
import { amenitiesFromIds } from "@/lib/amenities";
import { buildMetadata, SITE } from "@/lib/seo";
import {
  BadgeCheck, MapPin, Coins, CheckCircle2, Calendar, Building2,
  IndianRupee, Ruler, Download, Phone, Home, Sparkles,
} from "lucide-react";

type Params = { params: { slug: string } };

export const revalidate = 60; // ISR — fresh every minute

export async function generateStaticParams() {
  const slugs = await listProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params) {
  const p = await getProjectBySlug(params.slug);
  if (!p) return buildMetadata({ title: "Project not found", noIndex: true });
  return buildMetadata({
    title: `${p.name} by ${p.builder} — ${p.sector}, ${p.city}`,
    description: `${p.name} in ${p.sector}, ${p.city}. ${p.configuration.join(" / ")} from ${formatINR(p.startingPrice)}. RERA: ${p.rera}. Earn up to 1,00,000 PRAP Coins on site visit & booking.`,
    path: `/projects/${p.slug}`,
    image: p.cover,
    keywords: [
      `${p.name} ${p.city}`,
      `${p.builder} projects`,
      `${p.configuration[0]} ${p.city}`,
      `flat in ${p.sector}`,
    ],
  });
}

export default async function ProjectPage({ params }: Params) {
  const p = await getProjectBySlug(params.slug);
  if (!p) return notFound();

  const m = p.meta ?? {};
  const amenityList = amenitiesFromIds(p.amenityTags ?? []);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: p.name,
    description: p.description,
    image: [p.cover, ...p.gallery].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: p.sector,
      addressRegion: p.city,
      addressCountry: "IN",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: p.startingPrice,
      highPrice: p.maxPrice,
      offerCount: p.configuration.length,
      url: `${SITE.url}/projects/${p.slug}`,
    },
  };

  const filledSections = DETAIL_SECTIONS.map((section) => ({
    ...section,
    rows: section.fields
      .map((f) => ({ label: f.label, value: String(m[f.key] ?? "").trim() }))
      .filter((r) => r.value !== ""),
  })).filter((s) => s.rows.length > 0);

  const stats = [
    { icon: IndianRupee, label: "Starting price", value: formatINR(p.startingPrice), accent: true },
    { icon: Home, label: "Configurations", value: p.configuration.join(", ") || "—" },
    { icon: Ruler, label: "Super area", value: m.superArea || "—" },
    { icon: Calendar, label: "Possession", value: p.possession || "—" },
  ];

  return (
    <>
      <article>
        {/* ── Hero ── */}
        <header className="relative bg-ink-900">
          {p.cover ? (
            <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] max-h-[520px]">
              <Image src={p.cover} alt={`${p.name} cover`} fill priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-44 bg-gradient-to-br from-brand-700 to-brand-500" />
          )}

          <div className="absolute inset-x-0 bottom-0">
            <div className="container pb-5 sm:pb-7">
              <nav className="text-xs sm:text-sm mb-3 text-white/80">
                <Link href="/" className="hover:underline">Home</Link> /{" "}
                <Link href="/projects" className="hover:underline">Projects</Link> /{" "}
                <span className="text-white">{p.name}</span>
              </nav>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge !bg-white/90 !text-ink-900"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> RERA: {p.rera}</span>
                <span className="badge !bg-brand-600 !text-white">{p.status}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-[-0.02em] text-white">{p.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base text-white/90">
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.sector ? `${p.sector}, ` : ""}{p.city}</span>
                <span className="opacity-60">·</span>
                <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" /> {p.builder}</span>
              </p>
            </div>
          </div>
        </header>

        <div className="container py-6 sm:py-10">
          {/* ── Quick stats band ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`card p-4 ${s.accent ? "ring-1 ring-brand-200 bg-brand-50/40" : ""}`}>
                  <p className="text-xs uppercase tracking-wider text-ink-500 flex items-center gap-1">
                    <Icon className="h-3.5 w-3.5" /> {s.label}
                  </p>
                  <p className={`mt-1 text-base sm:text-xl font-bold leading-snug ${s.accent ? "text-brand-700" : "text-ink-900"}`}>
                    {s.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 mt-6 sm:mt-8">
            {/* ── Main column ── */}
            <div className="lg:col-span-8 space-y-6">
              {/* Gallery with full-screen lightbox */}
              {p.gallery && p.gallery.length > 0 && (
                <Gallery images={p.gallery} name={p.name} />
              )}

              {/* In-page section nav (jump links) */}
              <div className="card p-2 sticky top-24 z-20 overflow-x-auto">
                <div className="flex gap-1 min-w-max text-sm">
                  {p.unitTypes && p.unitTypes.length > 0 && <a href="#units" className="px-3 py-1.5 rounded-lg hover:bg-ink-50 text-ink-600 whitespace-nowrap">Pricing</a>}
                  {p.description && <a href="#about" className="px-3 py-1.5 rounded-lg hover:bg-ink-50 text-ink-600 whitespace-nowrap">About</a>}
                  {p.amenities?.length > 0 && <a href="#amenities" className="px-3 py-1.5 rounded-lg hover:bg-ink-50 text-ink-600 whitespace-nowrap">Amenities</a>}
                  {filledSections.map((s) => (
                    <a key={s.title} href={`#${slugifyAnchor(s.title)}`} className="px-3 py-1.5 rounded-lg hover:bg-ink-50 text-ink-600 whitespace-nowrap">{s.title}</a>
                  ))}
                </div>
              </div>

              {/* Unit types & pricing — one card per BHK type */}
              {p.unitTypes && p.unitTypes.length > 0 && (
                <section id="units" className="card p-5 sm:p-6 scroll-mt-32">
                  <h2 className="font-serif text-xl sm:text-2xl font-light flex items-center gap-2"><IndianRupee className="h-5 w-5 text-brand-600" /> Unit types, sizes &amp; pricing</h2>
                  <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    {p.unitTypes.map((u, i) => (
                      <div key={i} className="rounded-2xl border border-ink-200 p-4 hover:border-brand-300 hover:shadow-card transition">
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                            <Home className="h-4 w-4" /> {u.config}
                          </span>
                          <div className="text-right">
                            <p className="text-[11px] uppercase tracking-wider text-ink-400">Starting at</p>
                            <p className="font-extrabold text-brand-700">{u.price ? formatINR(Number(u.price)) : "On request"}</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-ink-50 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-ink-400 flex items-center gap-1"><Ruler className="h-3 w-3" /> Super area</p>
                            <p className="font-semibold text-ink-900">{u.superArea ? `${u.superArea} sq.ft.` : "—"}</p>
                          </div>
                          <div className="rounded-lg bg-ink-50 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-ink-400 flex items-center gap-1"><Ruler className="h-3 w-3" /> Carpet area</p>
                            <p className="font-semibold text-ink-900">{u.carpetArea ? `${u.carpetArea} sq.ft.` : "—"}</p>
                          </div>
                          {u.bathrooms && (
                            <div className="rounded-lg bg-ink-50 px-3 py-2">
                              <p className="text-[11px] uppercase tracking-wider text-ink-400">Bathrooms</p>
                              <p className="font-semibold text-ink-900">{u.bathrooms}</p>
                            </div>
                          )}
                          {u.balconyArea && (
                            <div className="rounded-lg bg-ink-50 px-3 py-2">
                              <p className="text-[11px] uppercase tracking-wider text-ink-400">Balcony</p>
                              <p className="font-semibold text-ink-900">{u.balconyArea} sq.ft.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* About */}
              {p.description && (
                <section id="about" className="card p-5 sm:p-6 scroll-mt-32">
                  <h2 className="font-serif text-xl sm:text-2xl font-light">About {p.name}</h2>
                  <p className="mt-3 text-ink-700 leading-relaxed whitespace-pre-line">{p.description}</p>
                </section>
              )}

              {/* Highlights */}
              {p.highlights && p.highlights.length > 0 && (
                <section className="card p-5 sm:p-6">
                  <h2 className="font-serif text-xl sm:text-2xl font-light flex items-center gap-2"><Sparkles className="h-5 w-5 text-brand-600" /> Highlights</h2>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-ink-700">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600 flex-none" /> {h}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Amenities — icon tags */}
              {(amenityList.length > 0 || (p.amenities && p.amenities.length > 0)) && (
                <section id="amenities" className="card p-5 sm:p-6 scroll-mt-32">
                  <h2 className="font-serif text-xl sm:text-2xl font-light">Amenities</h2>
                  {amenityList.length > 0 ? (
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {amenityList.map((a) => {
                        const Icon = a.icon;
                        return (
                          <div key={a.id} className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-ink-50/50 px-3 py-2.5">
                            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-brand-50 text-brand-700">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="text-sm text-ink-800 leading-tight">{a.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.amenities.map((a) => (
                        <span key={a} className="rounded-full bg-ink-100 px-3 py-1 text-sm text-ink-700">{a}</span>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* All extended detail sections */}
              {filledSections.map((section) => (
                <section key={section.title} id={slugifyAnchor(section.title)} className="card p-5 sm:p-6 scroll-mt-32">
                  <h2 className="font-serif text-xl sm:text-2xl font-light">{section.title}</h2>
                  <dl className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-0.5 text-sm">
                    {section.rows.map((r) => (
                      <div key={r.label} className="flex justify-between gap-4 border-b border-ink-50 py-2.5">
                        <dt className="text-ink-500">{r.label}</dt>
                        <dd className="font-medium text-ink-900 text-right">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}

              {m.brochureUrl && (
                <section className="card p-5 sm:p-6 flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-brand-50 to-transparent">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-light">Project brochure</h2>
                    <p className="mt-1 text-sm text-ink-500">Download the official PDF for full details.</p>
                  </div>
                  <a href={m.brochureUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    <Download className="h-4 w-4" /> Download brochure
                  </a>
                </section>
              )}
            </div>

            {/* ── Sticky sidebar (desktop) ── */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="card p-6 sticky top-20">
                <div className="flex items-center gap-3">
                  <span className="h-11 w-11 rounded-xl bg-brand-600 text-white grid place-items-center">
                    <Coins className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-500">You can earn up to</p>
                    <p className="text-2xl font-extrabold text-ink-900">1,30,000 Coins</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink-700">
                  Includes 25k onboarding · 20k visit bonuses · up to 75k investment bonus.
                </p>
                <div className="mt-4 rounded-xl bg-ink-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-ink-500">Price range</p>
                  <p className="mt-1 text-lg font-bold text-ink-900">
                    {formatINR(p.startingPrice)}{p.maxPrice > p.startingPrice ? ` – ${formatINR(p.maxPrice)}` : ""}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <Link href="/auth/signup" className="btn-primary w-full">Book a site visit</Link>
                  <Link href={`/contact?project=${p.slug}`} className="btn-outline w-full">
                    <Phone className="h-4 w-4" /> Talk to expert
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* ── Mobile sticky CTA bar ── */}
      <div className="lg:hidden sticky bottom-0 z-30 border-t border-ink-100 bg-white/95 backdrop-blur p-3 flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-ink-500">From</p>
          <p className="text-base font-bold text-brand-700 truncate">{formatINR(p.startingPrice)}</p>
        </div>
        <Link href="/auth/signup" className="btn-primary flex-1 justify-center">Book visit</Link>
        <Link href={`/contact?project=${p.slug}`} className="btn-outline justify-center !px-3" aria-label="Talk to expert">
          <Phone className="h-4 w-4" />
        </Link>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
    </>
  );
}

function slugifyAnchor(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
