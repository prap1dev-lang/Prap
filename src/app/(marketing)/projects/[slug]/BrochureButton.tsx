"use client";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

// Opens the brochure PDF in a new tab, then routes the user to the
// talk-to-expert page pre-filled with this property's query.
export default function BrochureButton({ url, slug }: { url: string; slug: string }) {
  const router = useRouter();

  function onClick() {
    window.open(url, "_blank", "noopener,noreferrer");
    router.push(`/contact?project=${encodeURIComponent(slug)}&intent=brochure`);
  }

  return (
    <button type="button" onClick={onClick} className="btn-primary">
      <Download className="h-4 w-4" /> Download brochure
    </button>
  );
}
