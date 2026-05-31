import { notFound } from "next/navigation";
import Link from "next/link";
import { CITY_INFO, CITY_SLUGS, type CitySlug, formatINR } from "@/lib/projects";
import { listProjects } from "@/lib/projects-db";
import { buildMetadata } from "@/lib/seo";
import { BadgeCheck, MapPin } from "lucide-react";

type Params = { params: { city: string } };

export const revalidate = 60;

export async function generateStaticParams() {
  return CITY_SLUGS.map((c) => ({ city: c }));
}

export async function generateMetadata({ params }: Params) {
  const slug = params.city as CitySlug;
  const info = CITY_INFO[slug];
  if (!info) return buildMetadata({ noIndex: true });
  return buildMetadata({
    title: `Property in ${info.name} — RERA-verified projects with rewards`,
    description: info.description,
    path: `/city/${slug}`,
    keywords: info.keywords,
  });
}

export default async function CityPage({ params }: Params) {
  const slug = params.city as CitySlug;
  const info = CITY_INFO[slug];
  if (!info) return notFound();
  const list = await listProjects({ city: info.name });

  return (
    <>
      <section className="bg-grid-fade bg-gradient-to-b from-white to-brand-50/40">
        <div className="container py-16">
          <nav className="text-sm text-ink-500 mb-3">
            <Link href="/" className="hover:text-brand-700">Home</Link> /{" "}
            <Link href="/projects" className="hover:text-brand-700">Projects</Link> /{" "}
            <span className="text-ink-700">{info.name}</span>
          </nav>
          <h1 className="h1">Property in {info.name}</h1>
          <p className="mt-4 max-w-2xl text-ink-700 text-lg">{info.tagline}.</p>
          <p className="mt-3 max-w-3xl text-ink-700">{info.description}</p>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="h2">RERA-verified projects in {info.name}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="card overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition">
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
                {p.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover} alt={`${p.name} in ${info.name}`} className="h-full w-full object-cover group-hover:scale-105 transition" loading="lazy" />
                )}
                <span className="absolute top-3 left-3 badge !bg-white/95 !text-ink-900">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> RERA
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg group-hover:text-brand-700 transition">{p.name}</h3>
                <p className="text-sm text-ink-500 flex items-center gap-1 mt-1"><MapPin className="h-3.5 w-3.5" /> {p.sector}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-ink-700">{p.configuration.join(" · ")}</span>
                  <span className="font-bold text-brand-700">{formatINR(p.startingPrice)}+</span>
                </div>
              </div>
            </Link>
          ))}
          {list.length === 0 && (
            <p className="text-ink-500">No projects in {info.name} yet — check back soon.</p>
          )}
        </div>

        <section className="mt-16 grid lg:grid-cols-2 gap-8">
          <article className="card p-7">
            <h3 className="text-xl font-bold">Why invest in {info.name}?</h3>
            <p className="mt-3 text-ink-700 leading-relaxed">
              {info.name} has emerged as one of India's most active real-estate corridors,
              driven by world-class infrastructure, the upcoming Jewar International Airport,
              dedicated freight corridors, and a thriving IT/ITES ecosystem. PRAP curates
              only RERA-compliant projects from credible builders so your investment is safe.
            </p>
          </article>
          <article className="card p-7">
            <h3 className="text-xl font-bold">PRAP rewards in {info.name}</h3>
            <p className="mt-3 text-ink-700 leading-relaxed">
              Every site visit in {info.name} earns you up to <strong>10,000 PRAP Coins</strong> per visit.
              Book your home and earn an additional <strong>up to 75,000 coins</strong> on
              investment tiers. 1 Coin = ₹1. Redeem to bank or use as direct discount.
            </p>
            <Link href="/auth/signup" className="btn-primary mt-5">Start earning</Link>
          </article>
        </section>
      </section>
    </>
  );
}
