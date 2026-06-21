import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * POST /api/property-submissions — PUBLIC.
 * Captures owner-submitted "List your property" leads for admin review.
 * No auth (it's a lead form); validated + lightly rate-limited per phone.
 */

const Body = z.object({
  propertyType: z.enum(["Residential", "Commercial"]),
  subType: z.string().optional().default(""),
  ownerName: z.string().min(2, "Enter your name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile"),
  email: z.string().email().or(z.literal("")).optional().default(""),
  city: z.string().optional().default(""),
  locality: z.string().optional().default(""),
  config: z.string().optional().default(""),
  area: z.string().optional().default(""),
  price: z.string().optional().default(""),
  details: z.record(z.any()).optional().default({}),
});

// In-process best-effort rate limit (per phone).
const RECENT = new Map<string, number>();
const RATE_WINDOW_MS = 15_000;

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const now = Date.now();
  const last = RECENT.get(d.phone) ?? 0;
  if (now - last < RATE_WINDOW_MS) {
    return NextResponse.json(
      { ok: false, error: "You just submitted — please wait a moment before trying again." },
      { status: 429 },
    );
  }
  RECENT.set(d.phone, now);

  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from("property_submissions").insert({
      property_type: d.propertyType,
      sub_type: d.subType || null,
      owner_name: d.ownerName,
      phone: d.phone,
      email: d.email || null,
      city: d.city || null,
      locality: d.locality || null,
      config: d.config || null,
      area: d.area || null,
      price: d.price || null,
      details: d.details,
    });
    if (error) throw error;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Could not save submission" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
