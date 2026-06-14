import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Building2, Home, IndianRupee } from "lucide-react";
import { formatINR, type Project } from "@/lib/projects";
import { amenitiesFromIds } from "@/lib/amenities";

// Shared project card — used on /projects, /city/[city] and showcases so every
// project surface looks identical (editorial serif title, soft hover, amenity
// icons). Pass `showAmenities` to render the amenity icon strip.
export default function ProjectCard({ p, showAmenities = true }: { p: Project; showAmenities?: boolean }) {
  const tags = showAmenities ? amenitiesFromIds(p.amenityTags ?? []) : [];
  return (
    <Link
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
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-700">
            <Home className="h-3.5 w-3.5 text-ink-400 shrink-0" strokeWidth={1.6} />
            {p.configuration.join(" · ") || "—"}
          </span>
          <span className="inline-flex items-center font-bold text-brand-700">
            <IndianRupee className="h-3.5 w-3.5" strokeWidth={2} />{formatINR(p.startingPrice).replace("₹", "")}+
          </span>
        </div>
        {tags.length > 0 && (
          <div className="mt-3 flex items-center gap-3 text-ink-400 border-t border-ink-100 pt-3">
            {tags.slice(0, 4).map((a) => {
              const Icon = a.icon;
              return <Icon key={a.id} className="h-4 w-4" aria-label={a.label} />;
            })}
            {tags.length > 4 && <span className="text-xs">+{tags.length - 4}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
