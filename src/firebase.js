// Minimal Firebase initialization for Vite (ESM) with emulator wiring in dev.
// Provide config via Vite env vars (see .env.example).

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Optionally initialize services as needed by your app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in dev mode
if (import.meta.env.DEV) {
  try {
    // Use 127.0.0.1 for auth emulator (required for cookies)
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  } catch {}
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } catch {}
  try {
    connectStorageEmulator(storage, '127.0.0.1', 9199);
  } catch {}
}

export default app;
