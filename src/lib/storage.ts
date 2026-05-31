// Supabase Storage helpers. Server-only.
//
// Buckets used:
//   project-images   — PUBLIC (read by anyone; only admins write)
//   kyc-docs         — PRIVATE (signed URLs only)
//
// Run this once in Supabase SQL editor to create the public bucket:
//   insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true)
//     on conflict (id) do nothing;
//
// And to allow public read while restricting write to authenticated admins:
//   create policy "public read project-images" on storage.objects
//     for select using (bucket_id = 'project-images');
//   create policy "admins write project-images" on storage.objects
//     for insert with check (
//       bucket_id = 'project-images'
//       and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
//     );

import "server-only";
import { supabaseAdmin } from "@/lib/supabase-server";

const BUCKET = "project-images";

function safeName(originalName: string) {
  const ext = (originalName.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${id}.${ext}`;
}

/**
 * Upload an in-memory File/Blob to the public project-images bucket.
 * Returns the public URL string.
 */
export async function uploadProjectImage(
  file: File | Blob,
  options: { folder?: string; filename?: string } = {},
): Promise<string> {
  const sb = supabaseAdmin();
  const folder = (options.folder || "covers").replace(/[^a-z0-9-/]/gi, "");
  const fname = options.filename
    ? safeName(options.filename)
    : safeName((file as any).name || "image.jpg");
  const key = `${folder}/${fname}`;

  const buffer =
    file instanceof Blob
      ? new Uint8Array(await file.arrayBuffer())
      : (file as unknown as Uint8Array);

  const { error } = await sb.storage.from(BUCKET).upload(key, buffer, {
    contentType: (file as any).type || "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/** Multiple uploads in parallel — returns URLs in the same order as the input. */
export async function uploadProjectImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map((f) => uploadProjectImage(f, { folder: "gallery", filename: f.name })));
}
