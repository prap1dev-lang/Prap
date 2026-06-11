import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Create your PRAP account — get 25,000 coins",
  description:
    "Sign up on PRAP as a Broker, Corporate or Referrer. Phone OTP + Aadhaar/PAN KYC. 25,000 PRAP Coins credited on successful registration.",
  path: "/auth/signup",
  noIndex: true,
});

export default function Page({ searchParams }: { searchParams?: { role?: string; ref?: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Create your PRAP account</h1>
      <p className="mt-2 text-ink-700">
        Join the platform — 25,000 PRAP Coins (₹25,000) credited on signup.
      </p>
      <SignupForm
        initialRole={(searchParams?.role as any) || "referrer"}
        initialReferral={searchParams?.ref || ""}
      />
      <p className="mt-6 text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-brand-700 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
