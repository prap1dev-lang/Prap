// WhatsApp deep-link helpers. The business number is configured via
// NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, with country code, e.g. 919876543210).
// Falls back to the public contact number (with 91 country code) when the
// dedicated WhatsApp env var isn't configured.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917688999955").replace(/\D/g, "");

/** Build a wa.me link with a pre-filled message. */
export function waLink(message: string, number: string = WHATSAPP_NUMBER): string {
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Standard enquiry message for a specific project. */
export function projectEnquiryMessage(name: string, slug: string, sector?: string, city?: string): string {
  const where = [sector, city].filter(Boolean).join(", ");
  return `Hi PRAP, I'm interested in *${name}*${where ? ` (${where})` : ""}. Please share more details & schedule a visit.\n\nRef: /projects/${slug}`;
}
