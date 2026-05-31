"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";

/**
 * Lands here after Supabase magic-link verify.
 *
 * Magic-link URLs come in TWO shapes:
 *   • Implicit (default for server-issued links):
 *       /auth/complete#access_token=…&refresh_token=…&type=magiclink
 *   • PKCE (when client used signInWithOtp + auto challenge):
 *       /auth/complete?code=…
 *
 * We handle both: extract tokens / exchange the code, then `setSession`
 * so the @supabase/ssr cookie-writer fires and sets sb-…-auth-token.* on
 * THIS domain. Only then is /api/auth/verify allowed to run.
 */
export default function CompletePage() {
  const router = useRouter();
  const [stage, setStage] = useState<"saving" | "done" | "error">("saving");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = supabaseBrowser();

        // ---- Step 1: turn the URL into a session ----
        let session = (await supabase.auth.getSession()).data.session;

        if (!session) {
          // Try the implicit-flow hash
          const hash = window.location.hash.startsWith("#")
            ? window.location.hash.slice(1)
            : "";
          if (hash) {
            const p = new URLSearchParams(hash);
            const access_token = p.get("access_token");
            const refresh_token = p.get("refresh_token");
            if (access_token && refresh_token) {
              const { error: setErr } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              if (setErr) throw setErr;
              // Clear the hash so refresh doesn't reuse it
              history.replaceState(null, "", window.location.pathname);
              session = (await supabase.auth.getSession()).data.session;
            }
          }
        }

        if (!session) {
          // Try the PKCE-flow code
          const url = new URL(window.location.href);
          const code = url.searchParams.get("code");
          if (code) {
            const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
            if (exchErr) throw exchErr;
            session = (await supabase.auth.getSession()).data.session;
          }
        }

        if (!session) {
          throw new Error(
            "Could not establish session from magic link. Open DevTools → Network → reload to see what /auth/v1/verify returned.",
          );
        }

        // ---- Step 2: finalize the public.users row (signup only) ----
        const raw = sessionStorage.getItem("prap-signup-profile");
        if (!raw) {
          // Returning user logging in — straight to dashboard.
          router.replace("/dashboard");
          return;
        }

        const payload = JSON.parse(raw);
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.ok) {
          if (res.status === 409) {
            // Row already exists — treat as login.
            sessionStorage.removeItem("prap-signup-profile");
            router.replace("/dashboard");
            return;
          }
          throw new Error(body.error?.message || body.error || "Could not save profile");
        }
        sessionStorage.removeItem("prap-signup-profile");
        setStage("done");
        setTimeout(() => router.replace(`/dashboard?role=${payload.role}&welcome=1`), 600);
      } catch (e: any) {
        console.error("auth/complete failed:", e);
        setError(e?.message || "Something went wrong");
        setStage("error");
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen grid place-items-center bg-offwhite p-6">
      <div className="card p-8 max-w-md w-full text-center">
        {stage === "saving" && (
          <>
            <Loader2 className="h-10 w-10 mx-auto text-brand-600 animate-spin" />
            <h1 className="mt-4 text-xl font-bold">Setting up your account…</h1>
            <p className="mt-2 text-sm text-ink-500">Crediting your 25,000 PRAP Coins.</p>
          </>
        )}
        {stage === "done" && (
          <>
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600" />
            <h1 className="mt-4 text-xl font-bold">All set!</h1>
            <p className="mt-2 text-sm text-ink-500">Redirecting to your dashboard…</p>
          </>
        )}
        {stage === "error" && (
          <>
            <AlertTriangle className="h-10 w-10 mx-auto text-rose-600" />
            <h1 className="mt-4 text-xl font-bold">We hit a snag</h1>
            <p className="mt-2 text-sm text-rose-700">{error}</p>
            <button onClick={() => router.replace("/auth/signup")} className="btn-outline mt-5">
              Back to signup
            </button>
          </>
        )}
      </div>
    </div>
  );
}
