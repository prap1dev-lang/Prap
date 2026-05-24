import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Users · Admin", path: "/admin/users", noIndex: true });

const users = [
  { id: "U-0001", name: "Rahul Mehta", role: "broker", phone: "+91-98XXXXXXX1", rera: "UPRERAAGT001234", status: "verified" },
  { id: "U-0002", name: "ACME Corp",    role: "corporate", phone: "+91-98XXXXXXX2", rera: "—", status: "pending" },
  { id: "U-0003", name: "Priya Singh", role: "referrer",  phone: "+91-98XXXXXXX3", rera: "—", status: "verified" },
];

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Users</h1>
      <p className="mt-2 text-ink-500">Search, verify and manage every user on the platform.</p>

      <div className="card mt-8 overflow-hidden">
        <div className="p-5 border-b border-ink-100 flex flex-wrap gap-3 items-center">
          <input className="input max-w-md" placeholder="Search by name, phone, RERA…" />
          <select className="input max-w-xs">
            <option>All roles</option>
            <option>Broker</option>
            <option>Corporate</option>
            <option>Referrer</option>
          </select>
          <select className="input max-w-xs">
            <option>All statuses</option>
            <option>Pending</option>
            <option>Verified</option>
            <option>Rejected</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">ID</th>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Phone</th>
              <th className="px-5 py-3 text-left">RERA</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-mono">{u.id}</td>
                <td className="px-5 py-3">{u.name}</td>
                <td className="px-5 py-3 capitalize">{u.role}</td>
                <td className="px-5 py-3">{u.phone}</td>
                <td className="px-5 py-3">{u.rera}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${u.status === "verified" ? "!bg-emerald-50 !text-emerald-700" : "!bg-amber-50 !text-amber-700"}`}>{u.status}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="btn-outline !py-1.5 !px-3 text-xs">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
