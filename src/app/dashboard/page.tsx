import Link from "next/link";
import { Coins, ArrowUpRight, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import AadhaarOtpCard from "@/components/kyc/AadhaarOtpCard";
import ReferralCodeCard from "@/components/dashboard/ReferralCodeCard";

export const metadata = buildMetadata({ title: "Dashboard", path: "/dashboard", noIndex: true });
export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams?: { role?: string; welcome?: string } }) {
  const me = await getSessionUser();
  const admin = supabaseAdmin();

  const { data: row } = me
    ? await admin
        .from("users")
        .select("name, pan_verified, aadhaar_verified, rera_verified")
        .eq("id", me.authId)
        .maybeSingle()
    : { data: null as any };

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

  return (
    <div className="space-y-8 max-w-6xl">
      {welcome && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-emerald-600 flex-none mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900">Welcome to PRAP!</p>
            <p className="text-sm text-emerald-800">25,000 PRAP Coins (₹25,000) have been credited to your wallet.</p>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500 capitalize">{role} dashboard</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Hello, {row?.name?.split(" ")[0] || me?.name?.split(" ")[0] || "Investor"} 👋</h1>
        </div>
        <Link href="/dashboard/bookings" className="btn-primary">Book a site visit</Link>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">PRAP Coin balance</p>
            <Coins className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold">{balance.toLocaleString("en-IN")}</p>
          <p className="text-xs text-ink-500">≈ ₹{balance.toLocaleString("en-IN")} · Redeemable after 50% milestone</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Site visits</p>
            <Calendar className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold">0 / 2</p>
          <p className="text-xs text-ink-500">10,000 coins per visit (max 2 visits)</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Lifetime earnings</p>
            <TrendingUp className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold">₹{lifetimeRedeemed.toLocaleString("en-IN")}</p>
          <p className="text-xs text-ink-500">Across all redemptions to bank</p>
        </div>
      </section>

      <ReferralCodeCard initialCode={refCode} role={role} />

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

      {row && !row.aadhaar_verified && (
        <AadhaarOtpCard initiallyVerified={false} />
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
              <span className="font-semibold text-emerald-700">+25,000</span>
            </li>
            <li className="py-3 text-ink-500">No site visits yet.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
