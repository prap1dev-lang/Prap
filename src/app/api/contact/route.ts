import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { sendQueryAck } from "@/lib/resend";

/**
 * POST /api/contact — PUBLIC.
 * Stores a "Request a callback" / enquiry and emails the sender a thank-you
 * acknowledgement (best-effort). Lightly rate-limited per phone/email.
 */

const Body = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().min(6, "Enter a valid phone"),
  email: z.string().email().or(z.literal("")).optional().default(""),
  intent: z.string().optional().default(""),
  message: z.string().optional().default(""),
  project: z.string().optional().default(""),
});

const RECENT = new Map<string, number>();
const RATE_WINDOW_MS = 15_000;

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const key = (d.email || d.phone).toLowerCase();
  const now = Date.now();
  if (now - (RECENT.get(key) ?? 0) < RATE_WINDOW_MS) {
    return NextResponse.json(
      { ok: false, error: "You just submitted — please wait a moment before trying again." },
      { status: 429 },
    );
  }
  RECENT.set(key, now);

  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from("queries").insert({
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      intent: d.intent || null,
      message: d.message || null,
      project_slug: d.project || null,
    });
    if (error) throw error;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Could not submit your query" }, { status: 500 });
  }

  // Best-effort thank-you email to the address the user entered (never fails
  // the request — the query is already saved). We surface whether it sent so
  // the UI can be honest and mis-configuration is visible, not silent.
  let emailSent = false;
  let emailError: string | null = null;
  if (d.email) {
    try {
      const r = await sendQueryAck({ to: d.email, name: d.name, intent: d.intent });
      emailSent = r.id !== "noop";
      if (!emailSent) emailError = "Email provider not configured (RESEND_API_KEY missing).";
    } catch (e: any) {
      emailError = e?.message || "Email send failed";
      console.error("[contact] ack email to", d.email, "failed:", emailError);
    }
  }

  return NextResponse.json({ ok: true, emailSent, emailError });
}
