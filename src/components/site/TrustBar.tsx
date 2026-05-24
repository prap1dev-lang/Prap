const items = [
  { k: "5,000+", v: "Verified RERA Projects" },
  { k: "₹1,200 Cr+", v: "Transacted on platform" },
  { k: "12,000+", v: "Brokers & Corporates" },
  { k: "98%", v: "On-time milestone closure" },
];

export default function TrustBar() {
  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {items.map((i) => (
          <div key={i.v}>
            <p className="text-2xl md:text-3xl font-extrabold text-ink-900">{i.k}</p>
            <p className="text-sm text-ink-500">{i.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
