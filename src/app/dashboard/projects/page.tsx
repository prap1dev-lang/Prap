import Link from "next/link";
import Image from "next/image";
import { PROJECTS, formatINR } from "@/lib/projects";
import { buildMetadata } from "@/lib/seo";
import { MapPin, BadgeCheck } from "lucide-react";

export const metadata = buildMetadata({ title: "Projects", path: "/dashboard/projects", noIndex: true });

export default function Page() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Browse projects</h1>
      <p className="mt-2 text-ink-500">RERA-verified opportunities, all in one place.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p) => (
          <Link key={p.slug} href={`/projects/${p.slug}`} className="card overflow-hidden group hover:shadow-lg transition">
            <div className="relative aspect-[4/3] bg-ink-100 overflow-hidden">
              <Image
                src={p.cover}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition"
              />
              <span className="absolute top-3 left-3 badge !bg-white/95 !text-ink-900"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> RERA</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold group-hover:text-brand-700 transition">{p.name}</h3>
              <p className="text-xs text-ink-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {p.sector}, {p.city}</p>
              <p className="mt-3 font-bold text-brand-700">{formatINR(p.startingPrice)}+</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
