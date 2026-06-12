"use client";
import { useFormStatus } from "react-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

/**
 * Approve / Reject submit buttons that show a spinner while the server action
 * runs. Must be rendered inside a <form action={...}>.
 */
export default function KycDecisionButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="flex gap-2">
      <button name="decision" value="approve" className="btn-primary" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve
      </button>
      <button name="decision" value="reject" className="btn-outline" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
      </button>
    </div>
  );
}
