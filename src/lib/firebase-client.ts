// Firebase client SDK — browser only. Do NOT import in server components or API routes.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  // Storage bucket — falls back to the conventional <projectId>.appspot.com
  // if not explicitly provided.
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? `${projectId}.appspot.com`,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const firebaseStorage = getStorage(app);
