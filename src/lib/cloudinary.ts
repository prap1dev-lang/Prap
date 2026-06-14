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
