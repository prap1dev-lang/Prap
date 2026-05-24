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
