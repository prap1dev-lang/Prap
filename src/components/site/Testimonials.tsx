import { Star } from "lucide-react";

const items = [
  {
    name: "Rahul S.",
    role: "Investor — Noida Sector 150",
    quote:
      "I booked a 3 BHK in VVIP Namah and earned 75,000 PRAP Coins on top. Got ₹50,000 credited back to my bank after 50% payment. Real and seamless.",
  },
  {
    name: "Anjali K.",
    role: "Channel Partner — Greater Noida",
    quote:
      "Aadhaar lock-in is the cleanest commission protection I've seen on any portal. No more leakage to other brokers.",
  },
  {
    name: "Tech Mahindra Employees",
    role: "Corporate Referrer Program",
    quote:
      "We rolled out PRAP to 800 employees via a corporate code. The visit-bonus structure made adoption effortless.",
  },
];

export default function Testimonials() {
  return (
    <section className="section bg-ink-50/50">
      <div className="container">
        <div className="max-w-2xl">
          <span className="eyebrow">Loved by buyers & brokers</span>
          <h2 className="h2 mt-4">Real users. Real rewards. Real records.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="card p-6">
              <div className="flex gap-1 text-gold-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-ink-800 leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-5 text-sm">
                <p className="font-semibold text-ink-900">{t.name}</p>
                <p className="text-ink-500">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
