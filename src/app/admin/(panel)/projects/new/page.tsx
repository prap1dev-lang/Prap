import { buildMetadata } from "@/lib/seo";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import ProjectWizard from "./ProjectWizard";

export const metadata = buildMetadata({ title: "Add project · Admin", path: "/admin/projects/new", noIndex: true });
export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <div className="max-w-5xl">
      <nav className="text-sm text-ink-500 mb-4">
        <Link href="/admin/projects" className="hover:text-brand-700">← Back to projects</Link>
      </nav>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Add new property</h1>
      <p className="mt-1 text-ink-500">Complete all steps. Listed projects appear on the home page and /projects.</p>
      <div className="mt-8">
        <ProjectWizard />
      </div>
    </div>
  );
}
