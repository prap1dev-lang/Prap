"use client";
import { useState, useRef } from "react";
import { Loader2, Check, UploadCloud, AlertTriangle, FileText } from "lucide-react";

type Kind = "aadhaar" | "pan" | "photo" | "rera_cert";

export default function DocUpload({
  kind,
  label,
  initialUrl,
}: {
  kind: Kind;
  label: string;
  initialUrl?: string | null;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setStatus("uploading");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("kind", kind);
      const res = await fetch("/api/kyc/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || "Upload failed");
      setUrl(body.url);
      setStatus("idle");
    } catch (e: any) {
      setError(e?.message || "Upload failed");
      setStatus("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isImage = url && /\.(png|jpe?g|webp|gif)$/i.test(url);

  return (
    <div className="block">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="relative w-full aspect-[4/3] rounded-xl border-2 border-dashed border-ink-200 grid place-items-center text-center p-3 overflow-hidden hover:border-brand-300 transition"
      >
        {url && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="absolute inset-0 h-full w-full object-cover" />
        ) : url ? (
          <span className="flex flex-col items-center text-brand-700">
            <FileText className="h-7 w-7" />
            <span className="text-xs font-semibold mt-1">Document on file</span>
          </span>
        ) : (
          <span className="flex flex-col items-center text-ink-500">
            {status === "uploading" ? (
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
            <span className="text-sm font-semibold mt-1 text-ink-900">{label}</span>
            <span className="text-xs mt-0.5">PNG, JPG or PDF · max 8MB</span>
          </span>
        )}

        {url && status !== "uploading" && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-[11px] font-semibold px-2 py-0.5">
            <Check className="h-3 w-3" /> Uploaded
          </span>
        )}
        {status === "uploading" && url && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf"
        onChange={onFile}
      />

      {url && status !== "uploading" && (
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 text-xs font-medium text-brand-700 hover:underline">
          Replace
        </button>
      )}
      {error && (
        <p className="mt-2 flex items-start gap-1 text-xs text-rose-700">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-none" /> {error}
        </p>
      )}
    </div>
  );
}
