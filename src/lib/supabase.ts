// Client-safe Supabase factory. Importable from "use client" components.
// For server-side clients, import from "@/lib/supabase-server" instead.
import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function supabaseBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      // Server-side generateLink() uses implicit-flow magic links
      // (#access_token=…). Tell the client to match.
      flowType: "implicit",
      detectSessionInUrl: true,
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}
