import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// Accepts multipart/form-data with:
//   file   — File blob
//   folder — optional subfolder e.g. "prap/projects/covers"
//   type   — "image" | "pdf" (default: auto)

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }

  const folder = String(formData.get("folder") || "prap/projects");
  const type = String(formData.get("type") || "auto") as "image" | "raw" | "auto";

  try {
    const result = await uploadToCloudinary(file, { folder, resourceType: type });
    return NextResponse.json({ ok: true, url: result.url, publicId: result.publicId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Upload failed" }, { status: 500 });
  }
}
