import { buildMetadata } from "@/lib/seo";
import { Users, Building2, BookKey, FileCheck } from "lucide-react";

export const metadata = buildMetadata({ title: "Admin", path: "/admin", noIndex: true });

const stats = [
  { icon: Users, label: "Users", value: "12,432", delta: "+412 this week" },
  { icon: Building2, label: "Active projects", value: "186", delta: "+3 new" },
  { icon: BookKey, label: "Bookings (30d)", value: "1,205", delta: "+12% MoM" },
  { icon: FileCheck, label: "Coins in float", value: "₹4.2 Cr", delta: "Reconciled" },
];

const queue = [
  { who: "Vivek Sharma", what: "Broker RERA verification", id: "BR-0042", at: "5 min ago" },
  { who: "ACME Pvt Ltd", what: "Corporate KYC", id: "CO-0011", at: "1 hr ago" },
  { who: "Priya Singh", what: "Redemption ₹95,000", id: "RD-0019", at: "3 hr ago" },
];

export default function AdminHome() {
  return (
    <div className="space-y-8 max-w-6xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Admin overview</h1>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-500">{s.label}</p>
              <s.icon className="h-5 w-5 text-brand-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-ink-500">{s.delta}</p>
          </div>
        ))}
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-ink-100">
          <h2 className="font-bold">Pending approvals</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Ref</th>
              <th className="px-5 py-3 text-left">Who</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Created</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((q) => (
              <tr key={q.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-mono">{q.id}</td>
                <td className="px-5 py-3">{q.who}</td>
                <td className="px-5 py-3">{q.what}</td>
                <td className="px-5 py-3 text-ink-500">{q.at}</td>
                <td className="px-5 py-3 text-right">
                  <button className="btn-outline !py-1.5 !px-3 mr-2 text-xs">Reject</button>
                  <button className="btn-primary !py-1.5 !px-3 text-xs">Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
