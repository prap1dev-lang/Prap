// Cloudinary upload helper — server only.
import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export interface CloudinaryResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

/** Upload a File/Blob to Cloudinary. Returns the optimised delivery URL. */
export async function uploadToCloudinary(
  file: File | Blob,
  options: {
    folder?: string;
    resourceType?: "image" | "raw" | "auto";
    filename?: string;
  } = {},
): Promise<CloudinaryResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const resourceType = options.resourceType ?? "auto";
  // quality/fetch_format are image-only transforms — applying them to raw
  // assets (e.g. PDF brochures) corrupts or fails the upload.
  const isImage = resourceType === "image" || resourceType === "auto";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? "prap/projects",
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
        ...(isImage ? { quality: "auto", fetch_format: "auto" } : {}),
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Cloudinary upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      },
    );
    stream.end(buffer);
  });
}

/** Upload multiple files in parallel. */
export async function uploadManyToCloudinary(
  files: File[],
  folder: string,
): Promise<CloudinaryResult[]> {
  return Promise.all(files.map((f) => uploadToCloudinary(f, { folder })));
}

/**
 * Parse a Cloudinary delivery URL into its public_id + resource_type so the
 * asset can be deleted. Returns null for non-Cloudinary URLs.
 *
 * e.g. https://res.cloudinary.com/demo/image/upload/v1699/prap/kyc/u1/ab.jpg
 *        -> { publicId: "prap/kyc/u1/ab", resourceType: "image" }
 */
export function parseCloudinaryUrl(
  url: string,
): { publicId: string; resourceType: "image" | "video" | "raw" } | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)cloudinary\.com$/.test(u.hostname)) return null;
    // /<cloud>/<resourceType>/<deliveryType>/<...transforms?>/v123/<public_id>.<ext>
    const parts = u.pathname.split("/").filter(Boolean);
    const rtIndex = parts.findIndex((p) => p === "image" || p === "video" || p === "raw");
    if (rtIndex === -1) return null;
    const resourceType = parts[rtIndex] as "image" | "video" | "raw";

    // Everything after the version segment (vNNN) is the public_id path.
    let rest = parts.slice(rtIndex + 2); // skip resourceType + deliveryType ("upload")
    const vIdx = rest.findIndex((p) => /^v\d+$/.test(p));
    if (vIdx !== -1) rest = rest.slice(vIdx + 1);

    if (rest.length === 0) return null;
    const last = rest[rest.length - 1].replace(/\.[^.]+$/, ""); // strip extension
    rest[rest.length - 1] = last;
    const publicId = rest.join("/");
    return { publicId, resourceType };
  } catch {
    return null;
  }
}

/**
 * Delete a Cloudinary asset given its delivery URL. Best-effort: returns
 * { ok:false } with a reason rather than throwing, so callers can proceed with
 * removing the DB record regardless.
 */
export async function destroyCloudinaryUrl(
  url: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return { ok: false, error: "Not a Cloudinary URL" };
  try {
    const res = await cloudinary.uploader.destroy(parsed.publicId, {
      resource_type: parsed.resourceType,
      invalidate: true,
    });
    if (res.result === "ok" || res.result === "not found") return { ok: true };
    return { ok: false, error: `Cloudinary: ${res.result}` };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Cloudinary delete failed" };
  }
}
