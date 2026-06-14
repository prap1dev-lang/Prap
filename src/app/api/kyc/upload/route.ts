import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { uploadToCloudinary, destroyCloudinaryUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/**
 * Upload / remove a KYC / profile document for the signed-in user. Files are
 * stored in Cloudinary and recorded in kyc_docs. No external verification —
 * documents are kept on file for manual admin review.
 *
 * POST   multipart/form-data { file, kind }
 * DELETE ?kind=<kind>
 *
 * kinds: aadhaar_front | aadhaar_back | pan_front | pan_back | photo | rera_cert
 *        (legacy "aadhaar" | "pan" still accepted)
 */

const ALLOWED = new Set([
  "aadhaar",
  "aadhaar_front",
  "aadhaar_back",
  "pan",
  "pan_front",
  "pan_back",
  "photo",
  "rera_cert",
]);
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

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
    return NextResponse.json({ ok: false, error: "File too large (max 2 MB)" }, { status: 413 });
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

/** Remove an uploaded document by kind. */
export async function DELETE(req: Request) {
  const me = await requireUser();
  const kind = new URL(req.url).searchParams.get("kind") || "";
  if (!ALLOWED.has(kind)) {
    return NextResponse.json({ ok: false, error: "Invalid document type" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // Purge the actual Cloudinary file(s) for this kind before removing records.
  const { data: existing } = await admin
    .from("kyc_docs")
    .select("storage_key")
    .eq("user_id", me.authId)
    .eq("kind", kind);
  for (const d of existing ?? []) {
    if (d.storage_key) await destroyCloudinaryUrl(d.storage_key);
  }

  const { error } = await admin
    .from("kyc_docs")
    .delete()
    .eq("user_id", me.authId)
    .eq("kind", kind);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // Clear the avatar pointer if the profile photo was removed.
  if (kind === "photo") {
    await admin.from("users").update({ photo_url: null }).eq("id", me.authId);
  }
  return NextResponse.json({ ok: true });
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
