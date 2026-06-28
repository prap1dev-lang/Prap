import Link from "next/link";
import { Coins, ArrowUpRight, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import ReferralCodeCard from "@/components/dashboard/ReferralCodeCard";
import ReferralNodes from "@/components/dashboard/ReferralNodes";

export const metadata = buildMetadata({ title: "Dashboard", path: "/dashboard", noIndex: true });
export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams?: { role?: string; welcome?: string } }) {
  const me = await getSessionUser();
  const admin = supabaseAdmin();

  const { data: row } = me
    ? await admin
        .from("users")
        .select("name, email, phone, pan, company, photo_url, kyc_status, pan_verified, aadhaar_verified, rera_verified")
        .eq("id", me.authId)
        .maybeSingle()
    : { data: null as any };

  // ── Referred profiles (people who signed up with this user's code) ──
  // Nodes unlock in batches of 5: the next batch opens only once EVERY user in
  // the current batch has completed a site visit. We fetch all referred users
  // plus whether each has a completed visit/booking.
  const { data: referredRows } = me
    ? await admin
        .from("users")
        .select("id, name, role, photo_url, created_at")
        .eq("referred_by", me.authId)
        .order("created_at", { ascending: true })
    : { data: null as any };
  const referredAll: { id: string; name: string; role: string; photo_url: string | null; created_at: string }[] =
    referredRows ?? [];

  // Which referred users have completed at least one site visit?
  const visitedSet = new Set<string>();
  if (me && referredAll.length) {
    const ids = referredAll.map((u) => u.id);
    const { data: visitRows } = await admin
      .from("bookings")
      .select("client_id, status, visits_completed")
      .in("client_id", ids);
    for (const b of visitRows ?? []) {
      const done = b.status === "visited" || b.status === "booked" || Number(b.visits_completed ?? 0) >= 1;
      if (done && b.client_id) visitedSet.add(b.client_id as string);
    }
  }

  // Aadhaar is verified by document upload (no UIDAI OTP). Check if one's on file.
  const { data: aadhaarDoc } = me
    ? await admin
        .from("kyc_docs")
        .select("id")
        .eq("user_id", me.authId)
        .eq("kind", "aadhaar")
        .maybeSingle()
    : { data: null as any };
  const hasAadhaarDoc = !!aadhaarDoc;

  const role = (me?.role ?? (searchParams?.role as any) ?? "referrer") as "broker" | "corporate" | "referrer";
  const welcome = searchParams?.welcome === "1";

  // Real wallet + corporate referral code.
  const { data: wallet } = me
    ? await admin
        .from("wallets")
        .select("balance, lifetime_earned, lifetime_redeemed")
        .eq("user_id", me.authId)
        .maybeSingle()
    : { data: null as any };

  let refCode: string | null = null;
  if (me) {
    const { data: rc } = await admin
      .from("referral_codes")
      .select("code")
      .eq("corporate_id", me.authId)
      .eq("active", true)
      .maybeSingle();
    refCode = rc?.code ?? null;
  }

  const balance = Number(wallet?.balance ?? 0);
  const lifetimeRedeemed = Number(wallet?.lifetime_redeemed ?? 0);

  // ── Profile completion (% of key fields + KYC filled) ──
  const REFERRAL_LIMIT = 5;
  const completionChecks = [
    !!row?.name,
    !!row?.email,
    !!row?.phone,
    !!row?.photo_url,
    !!row?.pan,
    row?.kyc_status === "verified",
  ];
  const completion = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100,
  );

  // ── Referral nodes (batches of 5 — unlock logic lives in <ReferralNodes/>) ──
  const BATCH = 5;
  const referredNodes = referredAll.map((u) => ({
    id: u.id,
    name: u.name || "PRAP member",
    role: u.role,
    photoUrl: u.photo_url,
    visited: visitedSet.has(u.id),
  }));

  return (
    <div className="space-y-8 max-w-6xl">
      {welcome && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-emerald-600 flex-none mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900">Welcome to PRAP!</p>
            <p className="text-sm text-emerald-800">20,000 PRAP Coins (₹20,000) have been credited to your wallet.</p>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500 capitalize">{role} dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Hello, {row?.name?.split(" ")[0] || me?.name?.split(" ")[0] || "Investor"} 👋</h1>
        </div>
        <Link href="/dashboard/bookings" className="btn-primary">Book a site visit</Link>
      </header>

      {/* ── Profile completion ── */}
      <section className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Profile completion</h2>
          <span className={`text-sm font-bold ${completion === 100 ? "text-emerald-700" : "text-brand-700"}`}>
            {completion}%
          </span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-ink-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completion === 100 ? "bg-emerald-500" : "bg-brand-600"}`}
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion < 100 ? (
          <p className="mt-3 text-sm text-ink-600">
            Add your photo, email, PAN and complete KYC to reach 100%.{" "}
            <Link href="/dashboard/settings" className="font-semibold text-brand-700 hover:underline">Complete now →</Link>
          </p>
        ) : (
          <p className="mt-3 text-sm text-emerald-700 font-medium">Your profile is fully complete. 🎉</p>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">PRAP Coin balance</p>
            <Coins className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold">{balance.toLocaleString("en-IN")}</p>
          <p className="text-xs text-ink-500">≈ ₹{balance.toLocaleString("en-IN")} · Redeemable after 50% milestone</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Site visits</p>
            <Calendar className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold">0 / 2</p>
          <p className="text-xs text-ink-500">10,000 coins per visit (max 2 visits)</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Lifetime earnings</p>
            <TrendingUp className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold">₹{lifetimeRedeemed.toLocaleString("en-IN")}</p>
          <p className="text-xs text-ink-500">Across all redemptions to bank</p>
        </div>
      </section>

      <div id="referral-code">
        <ReferralCodeCard initialCode={refCode} role={role} />
      </div>

      {/* ── Referral network (nodes unlock in batches of 5) ── */}
      <ReferralNodes nodes={referredNodes} batchSize={BATCH} />

      {role === "broker" && (
        <section className="card p-6">
          <p className="text-sm text-ink-500">Channel partner status</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">Active</p>
          <p className="mt-2 text-sm text-ink-700">
            {row?.rera_verified
              ? "Your UP-RERA registration is verified. You can book client visits and earn referral rewards."
              : "Your account is active. Add your UP-RERA registration in Settings to display the verified badge on your profile."}
          </p>
        </section>
      )}

      {me && !hasAadhaarDoc && (
        <section className="card p-6 border-amber-200 bg-amber-50/40">
          <p className="text-sm font-semibold text-amber-800">Aadhaar pending</p>
          <p className="mt-1 text-sm text-ink-700">
            Upload a clear photo or PDF of your Aadhaar card to complete your KYC.
          </p>
          <Link href="/dashboard/settings" className="btn-primary mt-4">
            Upload Aadhaar <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold">Next steps</h2>
          <ol className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3"><span className="badge !bg-brand-600 !text-white">1</span> Complete profile & upload KYC docs.</li>
            <li className="flex items-start gap-3"><span className="badge">2</span> Book a site visit from any RERA-verified project.</li>
            <li className="flex items-start gap-3"><span className="badge">3</span> Earn 10,000 coins per visit (max 2).</li>
            <li className="flex items-start gap-3"><span className="badge">4</span> Book your property — pay 50% to unlock redemption.</li>
          </ol>
          <Link href="/dashboard/settings" className="btn-outline mt-5">
            Complete profile <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold">Recent activity</h2>
          <ul className="mt-4 divide-y divide-ink-100 text-sm">
            <li className="py-3 flex items-center justify-between">
              <span>Onboarding bonus credited</span>
              <span className="font-semibold text-emerald-700">+20,000</span>
            </li>
            <li className="py-3 text-ink-500">No site visits yet.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
