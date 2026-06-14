import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatINR } from "@/lib/projects";
import { getProjectBySlug, listProjectSlugs } from "@/lib/projects-db";
import { buildMetadata, SITE } from "@/lib/seo";
import { BadgeCheck, MapPin, Coins, CheckCircle2, Calendar } from "lucide-react";

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

  return (
    <>
      <article>
        <div className="container py-10">
          <nav className="text-sm text-ink-500 mb-3">
            <Link href="/" className="hover:text-brand-700">Home</Link> /{" "}
            <Link href="/projects" className="hover:text-brand-700">Projects</Link> /{" "}
            <Link href={`/city/${p.city.toLowerCase().replace(" ", "-")}`} className="hover:text-brand-700">{p.city}</Link> / <span className="text-ink-700">{p.name}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {p.cover && (
                <div className="card overflow-hidden">
                  <div className="relative w-full aspect-[16/9]">
                    <Image
                      src={p.cover}
                      alt={`${p.name} cover`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {p.gallery && p.gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {p.gallery.slice(0, 6).map((g, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-ink-100">
                      <Image
                        src={g}
                        alt={`${p.name} gallery ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 33vw, 220px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge"><BadgeCheck className="h-3.5 w-3.5" /> RERA: {p.rera}</span>
                  <span className="badge">{p.status}</span>
                  <span className="badge">{p.configuration.join(" · ")}</span>
                </div>
                <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-ink-900">{p.name}</h1>
                <p className="mt-1 text-ink-500 flex items-center gap-2"><MapPin className="h-4 w-4" /> {p.sector}, {p.city}</p>
                <p className="mt-2 text-sm text-ink-500">By <span className="font-semibold text-ink-900">{p.builder}</span></p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="card p-4">
                  <p className="text-xs uppercase tracking-wider text-ink-500">Starting</p>
                  <p className="mt-1 text-xl font-bold text-brand-700">{formatINR(p.startingPrice)}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs uppercase tracking-wider text-ink-500">Up to</p>
                  <p className="mt-1 text-xl font-bold text-ink-900">{formatINR(p.maxPrice)}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs uppercase tracking-wider text-ink-500 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Possession</p>
                  <p className="mt-1 text-xl font-bold text-ink-900">{p.possession || "—"}</p>
                </div>
              </div>

              {p.unitTypes && p.unitTypes.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-xl font-bold">Unit types &amp; pricing</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-ink-500 border-b border-ink-100">
                          <th className="py-2 pr-4 font-semibold">Configuration</th>
                          <th className="py-2 pr-4 font-semibold">Super Area</th>
                          <th className="py-2 pr-4 font-semibold">Carpet Area</th>
                          <th className="py-2 pr-4 font-semibold">Bath</th>
                          <th className="py-2 pr-4 font-semibold whitespace-nowrap">Starting Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.unitTypes.map((u, i) => (
                          <tr key={i} className="border-b border-ink-50 last:border-0">
                            <td className="py-2.5 pr-4 font-semibold text-ink-900 whitespace-nowrap">{u.config}</td>
                            <td className="py-2.5 pr-4 text-ink-700">{u.superArea ? `${u.superArea} sq.ft.` : "—"}</td>
                            <td className="py-2.5 pr-4 text-ink-700">{u.carpetArea ? `${u.carpetArea} sq.ft.` : "—"}</td>
                            <td className="py-2.5 pr-4 text-ink-700">{u.bathrooms || "—"}</td>
                            <td className="py-2.5 pr-4 font-semibold text-brand-700 whitespace-nowrap">
                              {u.price ? formatINR(Number(u.price)) : "On request"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {p.description && (
                <div className="card p-6">
                  <h2 className="text-xl font-bold">About {p.name}</h2>
                  <p className="mt-3 text-ink-700 leading-relaxed whitespace-pre-line">{p.description}</p>
                </div>
              )}

              {p.highlights && p.highlights.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-xl font-bold">Highlights</h2>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-ink-700">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600 flex-none" /> {h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {p.amenities && p.amenities.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-xl font-bold">Amenities</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.amenities.map((a) => (
                      <span key={a} className="rounded-full bg-ink-100 px-3 py-1 text-sm text-ink-700">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
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
                <div className="mt-5 space-y-2">
                  <Link href="/auth/signup" className="btn-primary w-full">Book a site visit</Link>
                  <Link href={`/contact?project=${p.slug}`} className="btn-outline w-full">Talk to expert</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
    </>
  );
}
