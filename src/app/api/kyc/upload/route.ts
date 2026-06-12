import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/**
 * Upload a KYC / profile document (Aadhaar, PAN, photo, RERA certificate) for
 * the signed-in user. Stores the file in Cloudinary and records the delivery
 * URL in kyc_docs. No external verification — documents are kept on file for
 * manual admin review.
 *
 * multipart/form-data:
 *   file — the image or PDF
 *   kind — "aadhaar" | "pan" | "photo" | "rera_cert"
 */

const ALLOWED = new Set(["aadhaar", "pan", "photo", "rera_cert"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  const me = await requireUser();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const kind = String(formData.get("kind") || "");

  if (!ALLOWED.has(kind)) {
    return NextResponse.json({ ok: false, error: "Invalid document type" }, { status: 400 });
  }
  if (!file || file.size === 0) {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "File too large (max 8 MB)" }, { status: 413 });
  }

  const admin = supabaseAdmin();
  try {
    const result = await uploadToCloudinary(file, {
      folder: `prap/kyc/${me.authId}`,
      resourceType: "auto", // handles images and PDFs
    });

    // One current doc per (user, kind): replace any previous record.
    await admin.from("kyc_docs").delete().eq("user_id", me.authId).eq("kind", kind);

    const { error } = await admin.from("kyc_docs").insert({
      user_id: me.authId,
      kind,
      storage_key: result.url,
      verified: false,
    });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // A profile photo also becomes the user's avatar.
    if (kind === "photo") {
      await admin.from("users").update({ photo_url: result.url }).eq("id", me.authId);
    }

    return NextResponse.json({ ok: true, url: result.url, kind });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Upload failed" }, { status: 500 });
  }
}

/** Return the user's uploaded documents (kind → url). */
export async function GET() {
  const me = await requireUser();
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("kyc_docs")
    .select("kind, storage_key, verified, created_at")
    .eq("user_id", me.authId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const docs: Record<string, { url: string; verified: boolean }> = {};
  for (const d of data ?? []) {
    docs[d.kind] = { url: d.storage_key, verified: d.verified };
  }
  return NextResponse.json({ ok: true, docs });
}
