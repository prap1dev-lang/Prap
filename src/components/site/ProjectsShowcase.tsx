import Link from "next/link";
import Image from "next/image";
import { listProjects } from "@/lib/projects-db";
import { formatINR } from "@/lib/projects";
import { ArrowUpRight, MapPin, Building2 } from "lucide-react";
import Reveal from "./Reveal";

const STATUS_COLOR: Record<string, string> = {
  "New Launch": "bg-amber-50 text-amber-800",
  "Under Construction": "bg-brand-50 text-brand-800",
  "Ready to Move": "bg-emerald-50 text-emerald-800",
};

export default async function ProjectsShowcase() {
  const featured = await listProjects({ limit: 3 });

  return (
    <section className="section bg-white">
      <div className="container">
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div>
            <span className="eyebrow">Featured residences</span>
            <h2 className="h2 mt-4">Verified properties,<br />chosen with care.</h2>
          </div>
          <Link href="/projects" className="btn-link text-ink-700 shrink-0">
            View all projects <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid gap-10 md:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 100}>
              <Link href={`/projects/${p.slug}`} className="group block">
                {/* Cover — soft rounded, organic, subtle scale */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-paper">
                  {p.cover ? (
                    <Image
                      src={p.cover}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={i === 0}
                      className="object-cover hover-scale"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center bg-brand-50">
                      <Building2 className="h-10 w-10 text-brand-200" strokeWidth={1.2} />
                    </div>
                  )}
                  <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-[0.7rem] font-medium backdrop-blur-md ${STATUS_COLOR[p.status] ?? "bg-white/80 text-ink-700"}`}>
                    {p.status}
                  </span>
                </div>

                {/* Body — clean, whitespace-led */}
                <div className="pt-5 px-1">
                  <h3 className="font-serif text-xl text-ink-900 group-hover:text-brand-700 transition-colors">{p.name}</h3>
                  <p className="mt-1.5 text-sm text-ink-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                    {p.sector ? `${p.sector}, ` : ""}{p.city}
                  </p>
                  <p className="mt-4 text-sm text-ink-700">
                    From <span className="font-medium text-brand-700">{formatINR(p.startingPrice)}</span>
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
