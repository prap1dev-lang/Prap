import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  return <AdminShell email={me.email}>{children}</AdminShell>;
}
