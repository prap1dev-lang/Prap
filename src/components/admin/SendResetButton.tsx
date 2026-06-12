"use client";
import { useState, useTransition } from "react";
import { Mail, Loader2, Check, AlertTriangle } from "lucide-react";

export default function SendResetButton({
  email,
  action,
}: {
  email: string | null;
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string } | void>;
}) {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const noEmail = !email || email.endsWith("@users.prap.in");

  function send() {
    setMsg(null);
    const fd = new FormData();
    fd.set("email", email || "");
    start(async () => {
      const res = await action(fd);
      if (res && !res.ok) {
        setStatus("error");
        setMsg(res.error || "Failed to send");
      } else {
        setStatus("sent");
      }
    });
  }

  if (noEmail) {
    return <p className="text-sm text-ink-500">No email on file — cannot send a reset link.</p>;
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button type="button" onClick={send} disabled={pending || status === "sent"} className="btn-outline">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        {status === "sent" ? "Reset link sent" : "Send password-reset email"}
      </button>
      {status === "sent" && (
        <span className="inline-flex items-center gap-1 text-sm text-emerald-700"><Check className="h-4 w-4" /> Sent to {email}</span>
      )}
      {status === "error" && (
        <span className="inline-flex items-center gap-1 text-sm text-rose-700"><AlertTriangle className="h-4 w-4" /> {msg}</span>
      )}
    </div>
  );
}
