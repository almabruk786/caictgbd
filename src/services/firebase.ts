import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function initFirebase(config?: Partial<FirebaseConfig>): boolean {
  try {
    const activeConfig: FirebaseConfig = {
      apiKey: config?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: config?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: config?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: config?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: config?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: config?.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
    };

    if (!activeConfig.apiKey || !activeConfig.projectId) {
      console.log('Firebase credentials not set; running in local storage / offline mode.');
      return false;
    }

    if (!getApps().length) {
      app = initializeApp(activeConfig);
    } else {
      app = getApps()[0];
    }

    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Connected to Firebase Firestore:', activeConfig.projectId);
    return true;
  } catch (err) {
    console.warn('Firebase initialization skipped/failed:', err);
    return false;
  }
}

export { app, db, auth };
