"use client";
import { useEffect } from "react";

/**
 * Safety net for auth redirects that land on the wrong path.
 *
 * Supabase falls back to the project Site URL (`/`) when the requested
 * `redirectTo` isn't in the allowed Redirect URLs list, stranding a freshly
 * authenticated user on the home page with tokens in the URL hash:
 *   http://localhost:3000/#access_token=…&refresh_token=…&type=magiclink
 *
 * When we detect that, forward to /auth/complete (preserving the hash) so the
 * normal session-establish + profile-finalize flow runs.
 */
export default function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    if (!hash) return;
    const p = new URLSearchParams(hash);
    if (p.get("access_token") && p.get("refresh_token")) {
      window.location.replace(`/auth/complete${window.location.hash}`);
    }
  }, []);
  return null;
}
