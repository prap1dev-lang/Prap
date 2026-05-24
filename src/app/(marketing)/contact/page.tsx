import { buildMetadata } from "@/lib/seo";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = buildMetadata({
  title: "Contact PRAP — talk to a real-estate expert",
  description:
    "Get in touch with the PRAP team for site visits, broker onboarding, corporate referrals or partnership opportunities.",
  path: "/contact",
});

export default function Page() {
  return (
    <section className="container py-14 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="h1">Talk to us</h1>
        <p className="mt-4 text-ink-700 text-lg max-w-md">
          Want a personalized site visit? Looking to onboard your brokerage or corporate
          team? We're a message away.
        </p>
        <div className="mt-8 space-y-3 text-ink-700">
          <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-brand-700" /> +91-000-000-0000</div>
          <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-brand-700" /> support@prap.in</div>
          <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand-700" /> Sector 18, Noida, UP — India</div>
        </div>
      </div>
      <form className="card p-7 space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" placeholder="Your name" required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+91…" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="label">I want to…</label>
          <select className="input">
            <option>Book a site visit</option>
            <option>Become a Broker / Channel Partner</option>
            <option>Onboard my company (Corporate Referrer)</option>
            <option>General enquiry</option>
          </select>
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input" rows={5} placeholder="Tell us how we can help…" />
        </div>
        <button className="btn-primary">Send message</button>
      </form>
    </section>
  );
}
