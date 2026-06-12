import Link from "next/link";
import Image from "next/image";
import { listProjects } from "@/lib/projects-db";
import { formatINR } from "@/lib/projects";
import { ArrowRight, BadgeCheck, MapPin, Building2 } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  "New Launch": "bg-amber-50 text-amber-800",
  "Under Construction": "bg-blue-50 text-blue-800",
  "Ready to Move": "bg-emerald-50 text-emerald-800",
};

export default async function ProjectsShowcase() {
  const featured = await listProjects({ limit: 3 });

  return (
    <section className="section bg-white">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow">Featured projects</span>
            <h2 className="h2 mt-3">RERA-verified properties.</h2>
            <p className="mt-2 text-ink-600 max-w-lg">
              Every listing is RERA-registered, builder-direct, zero brokerage.
            </p>
          </div>
          <Link href="/projects" className="btn-outline self-start sm:self-auto shrink-0">
            All projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((p, i) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="card group overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              {/* Cover */}
              <div className="relative aspect-[16/9] bg-ink-100 overflow-hidden">
                {p.cover ? (
                  <Image
                    src={p.cover}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={i === 0}
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-brand-50">
                    <Building2 className="h-10 w-10 text-brand-200" />
                  </div>
                )}
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-ink-900 shadow-sm">
                  <BadgeCheck className="h-3 w-3 text-emerald-500" /> RERA
                </span>
                <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[p.status] ?? "bg-ink-100 text-ink-700"}`}>
                  {p.status}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-bold text-ink-900 group-hover:text-brand-700 transition leading-snug">{p.name}</h3>
                <p className="mt-1 text-xs text-ink-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {p.sector ? `${p.sector}, ` : ""}{p.city}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink-600">{p.configuration.slice(0, 2).join(" · ")}</span>
                  <span className="font-bold text-brand-700 text-sm">{formatINR(p.startingPrice)}+</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-8 rounded-2xl bg-brand-50 border border-brand-100 px-6 py-4 flex flex-wrap items-center gap-6 text-sm text-brand-900">
          <span className="font-semibold">Why buy through PRAP?</span>
          {["100% RERA verified", "Zero brokerage", "Direct from builder", "Earn up to ₹1,20,000 in rewards"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-brand-600 shrink-0" /> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
