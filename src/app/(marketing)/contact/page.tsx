import { buildMetadata } from "@/lib/seo";
import { Mail, MapPin, Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { waLink, projectEnquiryMessage, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { getProjectBySlug } from "@/lib/projects-db";
import { SITE } from "@/lib/seo";
import ContactForm from "@/components/site/ContactForm";

export const metadata = buildMetadata({
  title: "Talk to a real-estate expert — PRAP",
  description:
    "Get instant help on site visits, pricing, brochures and bookings. Chat on WhatsApp or request a callback.",
  path: "/contact",
});

export const dynamic = "force-dynamic";

type SP = { project?: string; intent?: string };

export default async function Page({ searchParams }: { searchParams?: SP }) {
  const project = searchParams?.project ? await getProjectBySlug(searchParams.project) : null;
  const intent = searchParams?.intent;

  const waMessage = project
    ? projectEnquiryMessage(project.name, project.slug, project.sector, project.city)
    : "Hi PRAP, I'd like to talk to a real-estate expert.";
  const heading = project ? `Talk to an expert about ${project.name}` : "Talk to an expert";

  return (
    <section className="container py-14 grid lg:grid-cols-2 gap-10">
      <div>
        <span className="eyebrow">We're here to help</span>
        <h1 className="h1 mt-4">{heading}</h1>
        {intent === "brochure" && project && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-2">
            <CheckCircle2 className="h-4 w-4" /> Your brochure download has started.
          </p>
        )}
        <p className="mt-4 text-ink-700 text-lg max-w-md">
          Get instant answers on pricing, availability, site visits and bookings
          {project ? ` for ${project.name}` : ""}. Chat on WhatsApp for the fastest response.
        </p>

        {/* Primary CTA — WhatsApp */}
        <a
          href={waLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-3.5 text-white font-semibold shadow-soft hover:brightness-105 transition"
        >
          <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
        </a>
        {!WHATSAPP_NUMBER && (
          <p className="mt-2 text-xs text-amber-600">WhatsApp number not configured yet — set NEXT_PUBLIC_WHATSAPP_NUMBER.</p>
        )}

        <div className="mt-8 space-y-3 text-ink-700">
          <a href={`tel:${SITE.phoneTel}`} className="flex items-center gap-3 hover:text-brand-700"><Phone className="h-5 w-5 text-brand-700" /> {SITE.phoneDisplay}</a>
          <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 hover:text-brand-700"><Mail className="h-5 w-5 text-brand-700" /> {SITE.email}</a>
          <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand-700" /> Sector 18, Noida, UP — India</div>
        </div>
      </div>

      <ContactForm
        projectSlug={project?.slug ?? ""}
        hasProject={!!project}
        intentDefault={project ? "Enquire about this project" : "Book a site visit"}
        messageDefault={project ? `I'm interested in ${project.name} (${[project.sector, project.city].filter(Boolean).join(", ")}).` : ""}
      />
    </section>
  );
}
