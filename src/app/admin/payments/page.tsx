import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Payments · Admin", path: "/admin/payments", noIndex: true });

const rows = [
  { id: "P-2001", booking: "B-9001", user: "U-0003", amount: 5500000, milestone: "50%", status: "captured", at: "2026-05-15" },
  { id: "P-2002", booking: "B-9001", user: "U-0003", amount: 2750000, milestone: "25%", status: "pending",   at: "—" },
];

export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Payments</h1>
      <p className="mt-2 text-ink-500">Milestone payment ledger across all bookings.</p>
      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Ref</th>
              <th className="px-5 py-3 text-left">Booking</th>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-left">Milestone</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Captured</th>
              <th className="px-5 py-3 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-mono">{r.id}</td>
                <td className="px-5 py-3 font-mono">{r.booking}</td>
                <td className="px-5 py-3 font-mono">{r.user}</td>
                <td className="px-5 py-3 text-right">₹{r.amount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3">{r.milestone}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${r.status === "captured" ? "!bg-emerald-50 !text-emerald-700" : "!bg-amber-50 !text-amber-700"}`}>{r.status}</span>
                </td>
                <td className="px-5 py-3 text-ink-500">{r.at}</td>
                <td className="px-5 py-3 text-right">
                  <button className="btn-outline !py-1.5 !px-3 text-xs">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
