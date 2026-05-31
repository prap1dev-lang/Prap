import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { verifyReraAgent } from "@/lib/surepass";

const Body = z.object({
  userId: z.string().uuid(),
  state: z.string().min(2).max(3).optional().default("UP"),
});

export async function POST(req: Request) {
  await requireAdmin();
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: u } = await admin
    .from("users")
    .select("id, role, rera_number")
    .eq("id", parsed.data.userId)
    .single();

  if (!u || u.role !== "broker") {
    return NextResponse.json({ ok: false, error: "Not a broker" }, { status: 400 });
  }
  if (!u.rera_number) {
    return NextResponse.json({ ok: false, error: "User has no RERA number on file" }, { status: 400 });
  }

  try {
    const r = await verifyReraAgent(u.rera_number, parsed.data.state);

    await admin.from("kyc_verifications").insert({
      user_id: u.id,
      kind: "rera_agent",
      input: { rera_number: u.rera_number, state: parsed.data.state },
      ok: r.valid,
      response: r.raw,
    });

    if (r.valid) {
      await admin
        .from("users")
        .update({
          rera_verified: true,
          rera_verified_at: new Date().toISOString(),
          rera_agent_name: r.name,
        })
        .eq("id", u.id);
    }

    return NextResponse.json({ ok: true, valid: r.valid, name: r.name, status: r.status });
  } catch (e: any) {
    await admin.from("kyc_verifications").insert({
      user_id: u.id,
      kind: "rera_agent",
      input: { rera_number: u.rera_number, state: parsed.data.state },
      ok: false,
      error: e?.message,
    });
    return NextResponse.json({ ok: false, error: e?.message || "RERA check failed" }, { status: 502 });
  }
}
