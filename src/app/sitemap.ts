import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { PROJECTS, CITY_SLUGS } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/about",
    "/how-it-works",
    "/projects",
    "/contact",
    "/faq",
    "/auth/login",
    "/auth/signup",
    "/for-brokers",
    "/for-corporates",
    "/for-referrers",
    "/terms",
    "/privacy",
  ].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const projectRoutes = PROJECTS.map((p) => ({
    url: `${SITE.url}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const cityRoutes = CITY_SLUGS.map((c) => ({
    url: `${SITE.url}/city/${c}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...cityRoutes];
}
