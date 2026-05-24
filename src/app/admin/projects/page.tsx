import Link from "next/link";
import { PROJECTS, formatINR } from "@/lib/projects";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Projects · Admin", path: "/admin/projects", noIndex: true });

export default function AdminProjects() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Projects</h1>
        <button className="btn-primary">+ Add project</button>
      </div>
      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Builder</th>
              <th className="px-5 py-3 text-left">City</th>
              <th className="px-5 py-3 text-left">RERA</th>
              <th className="px-5 py-3 text-left">Starting</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((p) => (
              <tr key={p.slug} className="border-t border-ink-100">
                <td className="px-5 py-3 font-semibold">{p.name}</td>
                <td className="px-5 py-3">{p.builder}</td>
                <td className="px-5 py-3">{p.city}</td>
                <td className="px-5 py-3 font-mono text-xs">{p.rera}</td>
                <td className="px-5 py-3">{formatINR(p.startingPrice)}</td>
                <td className="px-5 py-3"><span className="badge">{p.status}</span></td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/projects/${p.slug}`} className="btn-outline !py-1.5 !px-3 text-xs">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
