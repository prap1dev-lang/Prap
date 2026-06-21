import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatINR } from "@/lib/projects";
import { getProjectBySlug, listProjectSlugs } from "@/lib/projects-db";
import { DETAIL_SECTIONS } from "@/lib/project-fields";
import Gallery from "./Gallery";
import Accordion from "@/components/ui/Accordion";
import EmiMini from "./EmiMini";
import BrochureButton from "./BrochureButton";
import { amenitiesFromIds } from "@/lib/amenities";
import { listPublishedReviews, averageRating } from "@/lib/reviews";
import { waLink, projectEnquiryMessage } from "@/lib/whatsapp";
import { buildMetadata, SITE } from "@/lib/seo";
import {
  BadgeCheck, MapPin, Coins, CheckCircle2, Calendar, Building2,
  IndianRupee, Ruler, Phone, Home, Sparkles, Star, FileText,
  MessageCircle, Info, Bath,
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
  const reviews = await listPublishedReviews(p.slug);
  const avgRating = averageRating(reviews);
  const waMsg = projectEnquiryMessage(p.name, p.slug, p.sector, p.city);

  // Render the free-text description as concise points (split on line breaks,
  // bullets or sentences) — point-wise reads cleaner and is more SEO-scannable.
  const descPoints = (p.description || "")
    .split(/\n+|•|·|(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim().replace(/^[-–•]\s*/, ""))
    .filter((s) => s.length > 1);

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
        {/* ── Hero ── (image stacks above title on mobile, overlays on sm+) */}
        <header className="relative bg-ink-900">
          {p.cover ? (
            <div className="relative w-full aspect-[4/3] sm:aspect-[21/9] sm:max-h-[520px]">
              <Image src={p.cover} alt={`${p.name} cover`} fill priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-36 sm:h-44 bg-gradient-to-br from-brand-700 to-brand-500" />
          )}

          {/* On mobile this sits below the image (dark bg); on sm+ it overlays the image */}
          <div className="bg-ink-900 sm:bg-transparent sm:absolute sm:inset-x-0 sm:bottom-0">
            <div className="container py-4 sm:py-0 sm:pb-7">
              <nav className="text-xs sm:text-sm mb-3 text-white/80">
                <Link href="/" className="hover:underline">Home</Link> /{" "}
                <Link href="/projects" className="hover:underline">Projects</Link> /{" "}
                <span className="text-white">{p.name}</span>
              </nav>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge !bg-white/90 !text-ink-900"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> RERA: {p.rera}</span>
                <span className="badge !bg-brand-600 !text-white">{p.status}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-5xl font-light tracking-[-0.02em] text-white">{p.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base text-white/90">
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.sector ? `${p.sector}, ` : ""}{p.city}</span>
                <span className="opacity-60">·</span>
                <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" /> {p.builder}</span>
              </p>
            </div>
          </div>
        </header>

        <div className="bg-grid-fade">
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

          {/* ── Neighbourhood & connectivity (auto-detected) ── */}
          {Array.isArray(m.localityInsights) && m.localityInsights.length > 0 && (
            <div className="card mt-4 p-4 sm:p-5">
              <p className="text-xs uppercase tracking-wider text-ink-500 flex items-center gap-1 mb-3">
                <MapPin className="h-3.5 w-3.5" /> Neighbourhood &amp; connectivity
              </p>
              <div className="flex flex-wrap gap-2">
                {m.localityInsights.map((i: any) => (
                  <span key={i.key} className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 border border-ink-200 px-3 py-1 text-xs sm:text-sm text-ink-700">
                    <span className="font-semibold text-ink-900">{i.label}</span>
                    <span className="text-ink-400">·</span>
                    {i.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 mt-6 sm:mt-8">
            {/* ── Main column ── */}
            <div className="lg:col-span-8 space-y-6">
              {/* Gallery with full-screen lightbox */}
              {p.gallery && p.gallery.length > 0 && (
                <Gallery images={p.gallery} name={p.name} />
              )}

              <Accordion sections={[
                {
                  id: "about", title: `About ${p.name}`, icon: <Info className="h-5 w-5" />, filled: descPoints.length > 0, content: (
                    <ul className="space-y-2 text-ink-700">
                      {descPoints.map((pt, i) => (
                        <li key={i} className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600 flex-none mt-0.5" /> <span>{pt}</span></li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "highlights", title: "Highlights", icon: <Sparkles className="h-5 w-5" />, filled: !!(p.highlights && p.highlights.length > 0), content: (
                    <ul className="grid sm:grid-cols-2 gap-2 text-ink-700">
                      {(p.highlights ?? []).map((h) => (
                        <li key={h} className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600 flex-none mt-0.5" /> <span>{h}</span></li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "pricing", title: "Pricing & Units", icon: <IndianRupee className="h-5 w-5" />, filled: !!(p.unitTypes && p.unitTypes.length > 0), content: (
                    <div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[...(p.unitTypes ?? [])].sort((a, b) => (Number(a.price) || Infinity) - (Number(b.price) || Infinity)).map((u, i) => (
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
                                  <p className="text-[11px] uppercase tracking-wider text-ink-400 flex items-center gap-1"><Bath className="h-3 w-3" /> Bathrooms</p>
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
                      <div className="mt-6">
                        <h3 className="font-serif text-lg font-light mb-3">EMI estimate</h3>
                        <EmiMini price={p.startingPrice} projectName={p.name} slug={p.slug} />
                      </div>
                    </div>
                  ),
                },
                {
                  id: "amenities", title: "Amenities", icon: <Star className="h-5 w-5" />, filled: amenityList.length > 0 || !!(p.amenities && p.amenities.length > 0), content: (
                    amenityList.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      <div className="flex flex-wrap gap-2">
                        {(p.amenities ?? []).map((a) => (
                          <span key={a} className="rounded-full bg-ink-100 px-3 py-1 text-sm text-ink-700">{a}</span>
                        ))}
                      </div>
                    )
                  ),
                },
                {
                  id: "details", title: "Specifications & Details", icon: <FileText className="h-5 w-5" />, filled: filledSections.length > 0, content: (
                    <div className="space-y-6">
                      {filledSections.map((section) => (
                        <div key={section.title}>
                          <h3 className="font-semibold text-ink-900 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {section.title}</h3>
                          <dl className="mt-2 grid sm:grid-cols-2 gap-x-8 gap-y-0.5 text-sm">
                            {section.rows.map((r) => (
                              <div key={r.label} className="flex justify-between gap-4 border-b border-ink-50 py-2.5">
                                <dt className="text-ink-500">{r.label}</dt>
                                <dd className="font-medium text-ink-900 text-right">{r.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  id: "reviews", title: `Customer Reviews${reviews.length ? ` (${reviews.length})` : ""}`, icon: <Star className="h-5 w-5" />, filled: reviews.length > 0, content: (
                    <div>
                      {reviews.length > 0 && (
                        <div className="inline-flex items-center gap-2 mb-4">
                          <span className="inline-flex">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star key={n} className={`h-4 w-4 ${n <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
                            ))}
                          </span>
                          <span className="text-sm font-semibold text-ink-900">{avgRating}</span>
                          <span className="text-sm text-ink-400">({reviews.length})</span>
                        </div>
                      )}
                      <div className="space-y-4">
                        {reviews.map((rv) => (
                          <div key={rv.id} className="rounded-xl border border-ink-100 p-4">
                            <div className="flex items-center gap-2">
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-700 text-sm font-bold">
                                {rv.author_name.slice(0, 1).toUpperCase()}
                              </span>
                              <span className="font-semibold text-ink-900">{rv.author_name}</span>
                              <span className="inline-flex ml-auto">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star key={n} className={`h-3.5 w-3.5 ${n <= rv.rating ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
                                ))}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-ink-700 leading-relaxed">{rv.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ]} />

              {m.brochureUrl && (
                <section className="card p-5 sm:p-6 flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-brand-50 to-transparent">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-light">Project brochure</h2>
                    <p className="mt-1 text-sm text-ink-500">Download the official PDF — we'll connect you to an expert too.</p>
                  </div>
                  <BrochureButton url={m.brochureUrl} slug={p.slug} />
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
                  <a
                    href={waLink(waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white font-semibold hover:brightness-105 transition"
                  >
                    <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
                  </a>
                  <Link href={`/contact?project=${p.slug}`} className="btn-outline w-full">
                    <Phone className="h-4 w-4" /> Talk to expert
                  </Link>
                </div>
              </div>
            </aside>
          </div>
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
        <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#25D366] text-white !px-3 py-3" aria-label="Chat on WhatsApp">
          <MessageCircle className="h-5 w-5" />
        </a>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
    </>
  );
}
