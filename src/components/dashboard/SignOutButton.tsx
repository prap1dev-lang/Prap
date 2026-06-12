"use client";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";

export default function SignOutButton({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    try {
      await supabaseBrowser().auth.signOut();
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  }

  return (
    <button onClick={signOut} disabled={loading} className={className}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {!compact && (loading ? "Signing out…" : "Sign out")}
    </button>
  );
}
