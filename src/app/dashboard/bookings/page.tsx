import { buildMetadata } from "@/lib/seo";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { MapPin, Calendar } from "lucide-react";
import BookVisitForm from "@/components/dashboard/BookVisitForm";

export const metadata = buildMetadata({ title: "Bookings", path: "/dashboard/bookings", noIndex: true });
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  scheduled: "!bg-amber-50 !text-amber-700",
  visited: "!bg-emerald-50 !text-emerald-700",
  booked: "!bg-emerald-50 !text-emerald-700",
  cancelled: "!bg-rose-50 !text-rose-700",
  no_show: "!bg-ink-100 !text-ink-700",
};

export default async function BookingsPage() {
  const me = await getSessionUser();
  const admin = supabaseAdmin();

  // Bookable projects = real DB-listed projects (bookings need a real project id).
  const { data: projectRows } = await admin
    .from("projects")
    .select("slug, name, city")
    .eq("is_listed", true)
    .order("created_at", { ascending: false });
  const projects = (projectRows ?? []).map((p) => ({ slug: p.slug, name: p.name, city: p.city }));

  const { data: bookings } = me
    ? await admin
        .from("bookings")
        .select("id, status, scheduled_at, visits_completed, project:projects ( name, city )")
        .or(`client_id.eq.${me.authId},broker_id.eq.${me.authId},created_by.eq.${me.authId}`)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] as any[] };

  return (
    <div className="space-y-8 max-w-5xl">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Bookings</h1>
          <p className="mt-1 text-ink-500">All scheduled and completed site visits.</p>
        </div>
        <BookVisitForm projects={projects} />
      </header>

      {!bookings || bookings.length === 0 ? (
        <div className="card p-10 text-center">
          <Calendar className="h-8 w-8 mx-auto text-ink-300" />
          <p className="mt-3 text-ink-700">You haven't booked any site visits yet.</p>
          <p className="text-sm text-ink-500">Use “Book a site visit” above to schedule one.</p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {bookings.map((b: any) => (
            <li key={b.id} className="card p-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-bold">{b.project?.name ?? "Project"}</p>
                <p className="text-sm text-ink-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {b.project?.city}
                  {b.scheduled_at && <> · {new Date(b.scheduled_at).toLocaleString("en-IN")}</>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink-500">Visits: {b.visits_completed ?? 0}</span>
                <span className={`badge ${STATUS_TONE[b.status] ?? ""}`}>{b.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
