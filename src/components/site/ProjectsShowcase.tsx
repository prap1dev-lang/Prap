import Link from "next/link";
import { PROJECTS, formatINR } from "@/lib/projects";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";

export default function ProjectsShowcase() {
  const featured = PROJECTS.slice(0, 4);
  return (
    <section className="section bg-ink-50/50">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-2xl">
            <span className="eyebrow">Featured projects</span>
            <h2 className="h2 mt-4">Hand-picked, RERA-verified opportunities.</h2>
          </div>
          <Link href="/projects" className="btn-outline self-start md:self-auto">
            View all projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="card overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.cover} alt={`${p.name} — ${p.city}`} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-3 left-3 badge !bg-white/95 !text-ink-900">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> RERA
                </span>
                <span className="absolute top-3 right-3 badge">{p.status}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-ink-900 group-hover:text-brand-700 transition">{p.name}</h3>
                <p className="mt-0.5 text-sm text-ink-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {p.sector}, {p.city}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-ink-700">{p.configuration.join(" · ")}</span>
                  <span className="font-bold text-brand-700">{formatINR(p.startingPrice)}+</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
