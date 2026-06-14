// Browser-side Firebase Storage uploads. Use for large files (e.g. PDF
// brochures) that would otherwise exceed serverless request-body limits when
// routed through an API endpoint.
"use client";
import { firebaseStorage, firebaseAuth } from "@/lib/firebase-client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { signInWithCustomToken, getIdTokenResult } from "firebase/auth";

export interface FirebaseUploadResult {
  url: string;
  path: string;
  name: string;
}

/**
 * Ensure the browser is signed into Firebase Auth with an `admin` claim, by
 * exchanging the current Supabase admin session for a Firebase custom token.
 * No-op if already signed in as admin. Required so Storage rules that check
 * request.auth.token.admin will accept the upload.
 */
async function ensureFirebaseAdminAuth(): Promise<void> {
  const current = firebaseAuth.currentUser;
  if (current) {
    const res = await getIdTokenResult(current);
    if (res.claims.admin) return; // already an admin Firebase session
  }

  const r = await fetch("/api/admin/firebase-token", { method: "POST" });
  const body = await r.json().catch(() => ({}));
  if (!r.ok || !body.ok || !body.token) {
    throw new Error(body.error || "Could not authenticate upload session.");
  }
  await signInWithCustomToken(firebaseAuth, body.token);
}

/**
 * Upload a file directly to Firebase Storage from the browser.
 * @param onProgress called with 0–100 as the upload progresses.
 */
export async function uploadToFirebase(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<FirebaseUploadResult> {
  await ensureFirebaseAdminAuth();

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${folder.replace(/\/+$/, "")}/${Date.now()}_${safeName}`;
  const storageRef = ref(firebaseStorage, path);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type || "application/octet-stream",
  });

  return new Promise<FirebaseUploadResult>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) {
          const pct = snap.totalBytes
            ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
            : 0;
          onProgress(pct);
        }
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path, name: file.name });
        } catch (e) {
          reject(e);
        }
      },
    );
  });
}
