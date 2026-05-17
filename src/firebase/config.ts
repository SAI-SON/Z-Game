import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

function hasValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export const isFirebaseConfigured =
  hasValue(firebaseConfig.apiKey) &&
  hasValue(firebaseConfig.authDomain) &&
  hasValue(firebaseConfig.projectId) &&
  hasValue(firebaseConfig.appId) &&
  hasValue(firebaseConfig.databaseURL);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;
let firestore: Firestore | null = null;
let functions: Functions | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app);
  firestore = getFirestore(app);
  functions = getFunctions(app, 'us-central1');
} else {
  console.warn(
    '[Z Game] Firebase is not configured. Copy .env.local.example to .env.local and add your project keys.',
  );
}

export { app, auth, db, firestore, functions };
export default app;
