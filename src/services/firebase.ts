import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyDIDvTm9IpVn-4muTa7hY4N7ilhxW3cBGs",
  authDomain: "caictg-bd.firebaseapp.com",
  projectId: "caictg-bd",
  storageBucket: "caictg-bd.firebasestorage.app",
  messagingSenderId: "249347636591",
  appId: "1:249347636591:web:b8174fd310e55f23577c9a",
  measurementId: "G-8K6J6WR6MH"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

export function initFirebase(config?: Partial<FirebaseConfig>): boolean {
  try {
    const activeConfig: FirebaseConfig = {
      apiKey: config?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
      authDomain: config?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
      projectId: config?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
      storageBucket: config?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
      messagingSenderId: config?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
      appId: config?.appId || import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
      measurementId: config?.measurementId || defaultFirebaseConfig.measurementId,
    };

    if (!activeConfig.apiKey || !activeConfig.projectId) {
      console.log('Firebase credentials not set; running in offline/local storage mode.');
      return false;
    }

    if (!getApps().length) {
      app = initializeApp(activeConfig);
    } else {
      app = getApps()[0];
    }

    db = getFirestore(app);
    auth = getAuth(app);

    if (typeof window !== 'undefined') {
      isAnalyticsSupported().then(supported => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }

    console.log('Connected to Firebase Firestore & Analytics:', activeConfig.projectId);
    return true;
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
    return false;
  }
}

// Auto-initialize with default project credentials
initFirebase();

export { app, db, auth, analytics };
