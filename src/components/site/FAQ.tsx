"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How is PRAP different from 99acres, MagicBricks or Housing.com?",
    a: "Legacy portals are pure listing aggregators. PRAP is a reward-driven transaction platform: every site visit, milestone payment and referral earns real money (PRAP Coins worth ₹1 each) that you can redeem to your bank or use as a direct discount on your property.",
  },
  {
    q: "What is 1 PRAP Coin worth?",
    a: "1 PRAP Coin = ₹1. You can use coins as a direct discount on property milestone payments, or redeem to your bank/UPI subject to the 50% balance rule and ₹1,00,000 hard cap per cycle.",
  },
  {
    q: "When can I withdraw coins to my bank account?",
    a: "Redemption unlocks once your first 50% property milestone payment is completed. You can withdraw up to 50% of your balance, capped at ₹1,00,000 per request.",
  },
  {
    q: "How does Aadhaar lock-in protect a broker's commission?",
    a: "When a broker books a client visit, they submit the last 4 digits of Aadhaar for at least 2 family members. This locks the client to that specific broker for that project — no other broker can claim the same client for the same project.",
  },
  {
    q: "Are projects RERA verified?",
    a: "Yes. Every project on PRAP carries a valid UP-RERA / state RERA registration number, manually checked against the official RERA portal before going live.",
  },
  {
    q: "Is PRAP available outside Noida & Greater Noida?",
    a: "We launched in Noida & Greater Noida, with active expansion to Yamuna Expressway, Delhi-NCR, Bangalore, Pune and Mumbai. Brokers and corporates can pre-register for new cities today.",
  },
];

export default function FAQ() {
  return (
    <section className="section bg-white" id="faq">
      <div className="container max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">FAQs</span>
          <h2 className="h2 mt-4">Everything you wanted to ask.</h2>
        </div>
        <ul className="mt-10 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
          {faqs.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </ul>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        className="w-full flex items-center justify-between gap-3 px-5 py-5 text-left"
        onClick={() => setOpen((s) => !s)}
      >
        <span className="font-semibold text-ink-900">{q}</span>
        <ChevronDown className={`h-5 w-5 text-ink-500 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-5 pb-5 text-ink-700 leading-relaxed">{a}</p>}
    </li>
  );
}
