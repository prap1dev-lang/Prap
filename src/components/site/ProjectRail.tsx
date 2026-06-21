import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Project } from "@/lib/projects";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import { BlueprintCompass } from "./Blueprint";

/**
 * Horizontal-scroll rail of project cards. Used for the homepage
 * "Projects in High Demand" and "Newly Launched" sections. Renders nothing
 * when there are no matching projects so empty rails never show.
 */
export default function ProjectRail({
  eyebrow,
  title,
  projects,
  viewAllHref = "/projects",
}: {
  eyebrow: string;
  title: string;
  projects: Project[];
  viewAllHref?: string;
}) {
  if (!projects.length) return null;

  return (
    <section className="section relative overflow-hidden bg-white">
      <BlueprintCompass className="pointer-events-none absolute right-6 top-6 hidden h-16 w-16 text-brand-900/10 md:block" />
      <div className="container relative">
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="h2 mt-4">{title}</h2>
          </div>
          <Link href={viewAllHref} className="btn-link text-ink-700 shrink-0">
            View all projects <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>

        {/* Horizontal scroller — snap, hidden scrollbar, edge padding */}
        <div className="-mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {projects.map((p) => (
              <div key={p.slug} className="snap-start shrink-0 w-[80%] sm:w-[340px]">
                <ProjectCard p={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
