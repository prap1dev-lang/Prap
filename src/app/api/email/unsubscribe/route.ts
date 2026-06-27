import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * One-click unsubscribe endpoint referenced by the List-Unsubscribe header.
 *
 * Gmail/Yahoo (2024 bulk-sender rules) require that this URL:
 *   - accepts an HTTP POST (List-Unsubscribe-Post: List-Unsubscribe=One-Click)
 *     and returns 2xx WITHOUT any further user interaction, and
 *   - ideally also serves a GET for humans who click the link.
 *
 * We record the opt-out best-effort (so a missing table never 500s the
 * provider's probe) and always return a friendly 200.
 */

async function recordOptOut(email: string) {
  if (!email) return;
  try {
    const sb = supabaseAdmin();
    // Upsert into a suppression list. Ignored silently if the table doesn't
    // exist yet (run docs/MIGRATION_EMAIL_OPTOUT.sql to enable persistence).
    await sb
      .from("email_optouts")
      .upsert({ email: email.toLowerCase() }, { onConflict: "email" });
  } catch {
    // best-effort — never block the unsubscribe acknowledgement
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  await recordOptOut(url.searchParams.get("e") || "");
  return NextResponse.json({ ok: true, unsubscribed: true });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("e") || "";
  await recordOptOut(email);
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
     <title>Unsubscribed · PRAP</title></head>
     <body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#FAFAF8;color:#1a1f18;display:grid;place-items:center;min-height:100vh;margin:0">
       <div style="background:#fff;border:1px solid #ecece4;border-radius:16px;padding:32px;max-width:420px;text-align:center">
         <h1 style="color:#1B4332;font-size:20px;margin:0 0 8px">You're unsubscribed</h1>
         <p style="font-size:14px;line-height:1.6;color:#4b4f47;margin:0">
           ${email ? `<strong>${email}</strong> ` : ""}won't receive further marketing emails from PRAP.
           You'll still get essential account &amp; payment notifications.
         </p>
       </div>
     </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
