import Link from "next/link";
import { Coins, Mail, Phone, MapPin } from "lucide-react";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/projects", label: "All Projects" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/for-brokers", label: "For Brokers" },
      { href: "/for-corporates", label: "For Corporates" },
      { href: "/for-referrers", label: "For Referrers" },
      { href: "/faq", label: "FAQs" },
    ],
  },
  {
    title: "Top Cities",
    links: [
      { href: "/city/noida", label: "Property in Noida" },
      { href: "/city/greater-noida", label: "Property in Greater Noida" },
      { href: "/city/yamuna-expressway", label: "Yamuna Expressway" },
      { href: "/projects?city=Noida", label: "Noida 3 BHK" },
      { href: "/projects?city=Greater%20Noida", label: "Greater Noida 2 BHK" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About PRAP" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms of Use" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/rera", label: "RERA Disclosure" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-950 text-ink-100">
      <div className="container py-14 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Coins className="h-5 w-5" />
            </span>
            <span className="text-lg tracking-tight">
              PRAP<span className="text-brand-400">.</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-ink-200 leading-relaxed max-w-sm">
            India's first reward-driven real-estate referral platform. Visit verified RERA
            properties in Noida, Greater Noida & across India, earn PRAP Coins
            (₹1 each) and redeem to your bank.
          </p>
          <div className="mt-5 space-y-2 text-sm text-ink-200">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91-000-000-0000</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@prap.in</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Sector 18, Noida, UP — India</div>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <h4 className="font-semibold text-white">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-ink-200">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link className="hover:text-white" href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-2">
          <h4 className="font-semibold text-white">Get the App</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-200">
            <li><Link href="#" className="hover:text-white">iOS — coming soon</Link></li>
            <li><Link href="#" className="hover:text-white">Android — coming soon</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-900">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ink-200">
          <p>© {new Date().getFullYear()} PRAP Technologies Pvt. Ltd. All rights reserved.</p>
          <p>RERA Reg.: <span className="text-ink-100">UPRERAAGT00XXXX</span> · CIN: <span className="text-ink-100">UXXXXXUP2025PTCXXXXXX</span></p>
        </div>
      </div>
    </footer>
  );
}
