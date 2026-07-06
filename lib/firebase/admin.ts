// Firebase Admin SDK init (server-side only — API routes, server components, scripts).
// Never import this from client components.
//
// Lazy init: the Admin SDK is only constructed on first use (not at module load), so
// `next build` succeeds even when `FIREBASE_SERVICE_ACCOUNT_JSON` isn't set (e.g. CI, local
// typecheck without secrets). Routes that touch Firestore/Auth will throw a clear error at
// request time if the env var is missing or malformed.
//
// Region note: Firestore's region (me-central1) is a property of the database itself, set once
// in the Firebase console when the database is created — the Admin SDK has no region parameter
// to configure here. `initializeApp()` below only wires credentials/project, not location.

import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

function parseServiceAccount(raw: string): ServiceAccount {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON. It must be the full " +
        "service account key, minified to a single line, exactly as downloaded from the " +
        "Firebase console (Project settings > Service accounts > Generate new private key)."
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("project_id" in parsed) ||
    !("client_email" in parsed) ||
    !("private_key" in parsed)
  ) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is missing required fields (project_id, client_email, " +
        "private_key). Re-download the service account key from the Firebase console."
    );
  }

  return parsed as ServiceAccount;
}

function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0]!;
    return adminApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not set. Server-side Firebase Admin calls require it — " +
        "add it to .env.local for local dev (see docs/environment.md) or to your deployment " +
        "environment's secrets. It must be the service account key JSON minified to one line."
    );
  }

  const serviceAccount = parseServiceAccount(raw);

  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });

  return adminApp;
}

let cachedAuth: Auth | undefined;
let cachedDb: Firestore | undefined;

/** Lazily-initialized Admin Auth instance. Throws descriptively if the service account is missing/invalid. */
export function adminAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getAdminApp());
  }
  return cachedAuth;
}

/** Lazily-initialized Admin Firestore instance (project's Firestore database lives in me-central1). */
export function adminDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getAdminApp());
  }
  return cachedDb;
}
