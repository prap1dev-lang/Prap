import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Calendar, MapPin } from "lucide-react";

export const metadata = buildMetadata({ title: "Bookings", path: "/dashboard/bookings", noIndex: true });

export default function BookingsPage() {
  const bookings: any[] = [];
  return (
    <div className="space-y-8 max-w-5xl">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bookings</h1>
          <p className="mt-1 text-ink-500">All scheduled and completed site visits.</p>
        </div>
        <Link href="/projects" className="btn-primary">
          <Calendar className="h-4 w-4" /> Schedule new visit
        </Link>
      </header>

      {bookings.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink-700">You haven't booked any site visits yet.</p>
          <Link href="/projects" className="btn-primary mt-5 inline-flex">Browse projects</Link>
        </div>
      ) : (
        <ul className="grid gap-4">
          {bookings.map((b) => (
            <li key={b.id} className="card p-5 flex items-center justify-between">
              <div>
                <p className="font-bold">{b.project}</p>
                <p className="text-sm text-ink-500 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.location}</p>
              </div>
              <span className="badge">Visit #{b.visitNo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
