import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOtp, Msg91Error } from "@/lib/msg91";

const Body = z.object({
  phone: z.string().min(8, "Phone is required"),
});

const lastSent = new Map<string, number>();
const COOLDOWN_MS = 30_000;

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid phone" }, { status: 400 });
  }

  const phone = parsed.data.phone;
  const now = Date.now();
  const last = lastSent.get(phone) || 0;
  if (now - last < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
    return NextResponse.json(
      { ok: false, error: `Please wait ${wait}s before requesting another OTP.` },
      { status: 429 },
    );
  }

  try {
    const r = await sendOtp(phone);
    lastSent.set(phone, now);
    return NextResponse.json({ ok: true, mobile: r.mobile, requestId: r.requestId });
  } catch (e: any) {
    const isMsg91 = e instanceof Msg91Error;
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || "Failed to send OTP",
        // Surface the full provider response so the UI / DevTools can show what MSG91 said.
        provider: isMsg91 ? { name: "msg91", status: e.status, detail: e.detail } : undefined,
      },
      { status: isMsg91 ? 502 : 500 },
    );
  }
}
