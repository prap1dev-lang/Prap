"use client";
import { useMemo, useState } from "react";
import {
  CheckCircle2, Circle, Loader2, ShieldCheck, XCircle, ExternalLink, AlertTriangle,
} from "lucide-react";

type Result = { ok: true } | { ok: false; error: string };

export interface KycDoc {
  id: string;
  kind: string;
  storage_key: string;
  verified: boolean;
}

// One verification step the admin must clear. A step can be satisfied by any of
// several doc kinds (e.g. legacy single "aadhaar" or the newer front/back pair).
interface StepDef {
  key: string;
  label: string;
  hint: string;
  // doc kinds that count towards this step
  kinds: string[];
  // when true the step must be cleared before overall KYC can be approved
  required: boolean;
}

function stepsForRole(role: string): StepDef[] {
  const steps: StepDef[] = [
    {
      key: "pan",
      label: "PAN card",
      hint: "Name on PAN matches the profile; number is legible.",
      kinds: ["pan", "pan_front", "pan_back"],
      required: true,
    },
    {
      key: "aadhaar",
      label: "Aadhaar (front & back)",
      hint: "Last 4 digits match the profile; photo & address are clear.",
      kinds: ["aadhaar", "aadhaar_front", "aadhaar_back"],
      required: true,
    },
    {
      key: "photo",
      label: "Profile photo",
      hint: "A clear face photo of the account holder.",
      kinds: ["photo"],
      required: false,
    },
  ];
  if (role === "broker") {
    steps.push({
      key: "rera_cert",
      label: "RERA certificate",
      hint: "Certificate is valid and the RERA number matches the profile.",
      kinds: ["rera_cert"],
      required: true,
    });
  }
  return steps;
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || /\/image\/upload\//.test(url);
}

export default function KycVerificationSteps({
  userId,
  role,
  kycStatus,
  docs,
  setDocStatus,
  setStatus,
}: {
  userId: string;
  role: string;
  kycStatus: string;
  docs: KycDoc[];
  setDocStatus: (formData: FormData) => Promise<Result>;
  setStatus: (formData: FormData) => Promise<void>;
}) {
  const steps = useMemo(() => stepsForRole(role), [role]);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [finalising, setFinalising] = useState<null | "approve" | "reject">(null);

  // Group uploaded docs under the step they belong to.
  const docsForStep = (s: StepDef) => docs.filter((d) => s.kinds.includes(d.kind));

  // A step is "done" when it has at least one doc and every doc under it is verified.
  const stepDone = (s: StepDef) => {
    const list = docsForStep(s);
    return list.length > 0 && list.every((d) => d.verified);
  };
  const stepUploaded = (s: StepDef) => docsForStep(s).length > 0;

  const requiredSteps = steps.filter((s) => s.required);
  const doneCount = steps.filter(stepDone).length;
  const allRequiredDone = requiredSteps.every(stepDone);

  async function toggleDoc(docId: string, nextVerified: boolean) {
    setBusyDoc(docId);
    setError(null);
    const fd = new FormData();
    fd.set("docId", docId);
    fd.set("verified", String(nextVerified));
    if (!nextVerified && notes) fd.set("notes", notes);
    const res = await setDocStatus(fd);
    if (!res.ok) setError(res.error);
    setBusyDoc(null);
  }

  async function finalise(decision: "approve" | "reject") {
    setFinalising(decision);
    setError(null);
    const fd = new FormData();
    fd.set("id", userId);
    fd.set("decision", decision);
    if (notes) fd.set("notes", notes);
    await setStatus(fd);
    // Page revalidates; status badge & section update on the server render.
    setFinalising(null);
  }

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand-600" /> Document verification
        </h2>
        <span className="text-xs font-medium text-ink-500">
          {doneCount} of {steps.length} steps cleared
        </span>
      </div>

      {/* progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ol className="mt-6 space-y-4">
        {steps.map((s, i) => {
          const list = docsForStep(s);
          const done = stepDone(s);
          const uploaded = stepUploaded(s);
          return (
            <li key={s.key} className="rounded-xl border border-ink-200 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex-none">
                  {done ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-ink-300 text-xs font-bold text-ink-500">
                      {i + 1}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink-900">{s.label}</p>
                    {s.required ? (
                      <span className="badge !bg-ink-100 !text-ink-600 text-[10px]">Required</span>
                    ) : (
                      <span className="badge !bg-ink-50 !text-ink-400 text-[10px]">Optional</span>
                    )}
                    {done && <span className="badge !bg-emerald-50 !text-emerald-700 text-[10px]">Verified</span>}
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">{s.hint}</p>

                  {!uploaded ? (
                    <p className="mt-3 text-sm text-amber-700 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Not uploaded by the user yet.
                    </p>
                  ) : (
                    <ul className="mt-3 flex flex-wrap gap-3">
                      {list.map((d) => (
                        <li key={d.id} className="w-32">
                          <a
                            href={d.storage_key}
                            target="_blank"
                            rel="noreferrer"
                            className="block relative aspect-[4/3] rounded-lg border border-ink-200 overflow-hidden bg-ink-50 group"
                            title="Open full document"
                          >
                            {isImageUrl(d.storage_key) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={d.storage_key} alt={d.kind} className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                              <span className="absolute inset-0 grid place-items-center text-brand-700">
                                <ExternalLink className="h-5 w-5" />
                              </span>
                            )}
                            <span className="absolute inset-x-0 bottom-0 bg-ink-900/70 text-white text-[10px] px-1.5 py-0.5 truncate">
                              {d.kind}
                            </span>
                          </a>
                          <button
                            type="button"
                            onClick={() => toggleDoc(d.id, !d.verified)}
                            disabled={busyDoc === d.id}
                            className={`mt-1.5 w-full inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                              d.verified
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-brand-600 text-white hover:bg-brand-700"
                            }`}
                          >
                            {busyDoc === d.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : d.verified ? (
                              <><CheckCircle2 className="h-3.5 w-3.5" /> Verified</>
                            ) : (
                              <><Circle className="h-3.5 w-3.5" /> Mark verified</>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Final decision — gated on all required steps being cleared. */}
      <div className="mt-6 border-t border-ink-100 pt-5">
        <label className="label">Internal notes (optional)</label>
        <textarea
          className="input"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for rejection, or any verification remarks…"
        />

        {kycStatus === "verified" ? (
          <p className="mt-4 text-sm font-medium text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> KYC already approved.
          </p>
        ) : (
          <>
            {!allRequiredDone && (
              <p className="mt-4 text-xs text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Clear every required step above before approving.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => finalise("approve")}
                disabled={!allRequiredDone || finalising !== null}
                className="btn-primary disabled:opacity-50"
              >
                {finalising === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Approve KYC
              </button>
              <button
                type="button"
                onClick={() => finalise("reject")}
                disabled={finalising !== null}
                className="btn-outline disabled:opacity-50"
              >
                {finalising === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Reject KYC
              </button>
            </div>
          </>
        )}

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </div>
    </section>
  );
}
