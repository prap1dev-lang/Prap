const items = [
  { k: "5,000+", v: "Verified RERA Projects" },
  { k: "₹1,200 Cr+", v: "Transacted on platform" },
  { k: "12,000+", v: "Brokers & Corporates" },
  { k: "98%", v: "On-time milestone closure" },
];

export default function TrustBar() {
  return (
    <section className="bg-white">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {items.map((i) => (
          <div key={i.v}>
            <p className="font-serif text-3xl md:text-4xl font-light text-ink-900">{i.k}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-500">{i.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
