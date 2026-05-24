import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Bookings · Admin", path: "/admin/bookings", noIndex: true });

const rows = [
  { id: "B-9001", project: "VVIP Namah",    broker: "U-0001", client: "U-0003", aadhaar4: "1234", visits: 1, status: "active" },
  { id: "B-9002", project: "Irish Platinum", broker: "U-0001", client: "U-0010", aadhaar4: "5678", visits: 2, status: "active" },
];

export default function BookingsAdmin() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Bookings</h1>
      <p className="mt-2 text-ink-500">Every site visit with Aadhaar-lock attribution.</p>
      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Ref</th>
              <th className="px-5 py-3 text-left">Project</th>
              <th className="px-5 py-3 text-left">Broker</th>
              <th className="px-5 py-3 text-left">Client</th>
              <th className="px-5 py-3 text-left">Aadhaar (last 4)</th>
              <th className="px-5 py-3 text-left">Visits</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-mono">{r.id}</td>
                <td className="px-5 py-3">{r.project}</td>
                <td className="px-5 py-3 font-mono">{r.broker}</td>
                <td className="px-5 py-3 font-mono">{r.client}</td>
                <td className="px-5 py-3 font-mono">XXXX-XXXX-{r.aadhaar4}</td>
                <td className="px-5 py-3">{r.visits}</td>
                <td className="px-5 py-3"><span className="badge">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
