import clsx, { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function maskAadhaar(last4: string) {
  return `XXXX-XXXX-${last4}`;
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function genReferralCode(prefix = "PRAP") {
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${r}`;
}

/** ₹12,34,567 — Indian grouping, no decimals. */
export function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** Compact INR: 1.50 Cr / 45.00 L / ₹90,000. */
export function formatINRCompact(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  return formatINR(n);
}
