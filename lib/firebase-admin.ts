import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _app: App | null = null;
let _db: Firestore | null = null;

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return _app;
}

/** Lazy-initialized Firebase Admin app — only created on first use at runtime */
export const adminApp = new Proxy({} as App, {
  get(_target, prop, receiver) {
    return Reflect.get(getAdminApp(), prop, receiver);
  },
});

/** Lazy-initialized Firestore — only created on first use at runtime */
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    if (!_db) _db = getFirestore(getAdminApp());
    return Reflect.get(_db, prop, receiver);
  },
});
