import Link from "next/link";
import { revalidatePath } from "next/cache";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { deleteUserCompletely } from "@/lib/admin-users";
import DeleteUserButton from "@/components/admin/DeleteUserButton";

export const metadata = buildMetadata({ title: "Users · Admin", path: "/admin/users", noIndex: true });
export const dynamic = "force-dynamic";

type SP = { q?: string; role?: string; status?: string };

async function deleteUserAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const res = await deleteUserCompletely(id);
  if (!res.ok) return res;
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export default async function UsersPage({ searchParams }: { searchParams?: SP }) {
  await requireAdmin();
  const sb = supabaseAdmin();

  let query = sb
    .from("users")
    .select("id, name, role, phone, email, rera_number, kyc_status, created_at, photo_url")
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchParams?.role) query = query.eq("role", searchParams.role);
  if (searchParams?.status) query = query.eq("kyc_status", searchParams.status);
  if (searchParams?.q) {
    const q = searchParams.q;
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,rera_number.ilike.%${q}%`);
  }

  const { data: users } = await query;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Users</h1>
      <p className="mt-2 text-ink-500">Search, verify and manage every user on the platform.</p>

      <form className="card mt-8 overflow-hidden">
        <div className="p-5 border-b border-ink-100 flex flex-wrap gap-3 items-center">
          <input name="q" defaultValue={searchParams?.q || ""} className="input max-w-md" placeholder="Search by name, phone, email, RERA…" />
          <select name="role" defaultValue={searchParams?.role || ""} className="input max-w-xs">
            <option value="">All roles</option>
            <option value="broker">Broker</option>
            <option value="corporate">Corporate</option>
            <option value="referrer">Referrer</option>
            <option value="admin">Admin</option>
          </select>
          <select name="status" defaultValue={searchParams?.status || ""} className="input max-w-xs">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn-primary">Filter</button>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Phone</th>
              <th className="px-5 py-3 text-left">RERA</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-t border-ink-100">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full overflow-hidden bg-ink-100 grid place-items-center flex-none text-ink-400 text-xs font-bold">
                      {u.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.photo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (u.name || "?").slice(0, 1).toUpperCase()
                      )}
                    </span>
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-xs text-ink-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 capitalize">{u.role}</td>
                <td className="px-5 py-3 font-mono text-xs">{u.phone}</td>
                <td className="px-5 py-3 font-mono text-xs">{u.rera_number || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${u.kyc_status === "verified" ? "!bg-emerald-50 !text-emerald-700" : u.kyc_status === "rejected" ? "!bg-rose-50 !text-rose-700" : "!bg-amber-50 !text-amber-700"}`}>{u.kyc_status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/users/${u.id}`} className="btn-outline !py-1.5 !px-3 text-xs">View</Link>
                    {u.role !== "admin" && (
                      <DeleteUserButton userId={u.id} userName={u.name} action={deleteUserAction} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-500">No users match those filters.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </form>
    </div>
  );
}
