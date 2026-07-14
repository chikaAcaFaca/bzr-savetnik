import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const fns = getFunctions(app, 'europe-west1');
export const googleProvider = new GoogleAuthProvider();

export const callStartTest = httpsCallable(fns, 'startTest');
export const callGradeTest = httpsCallable(fns, 'gradeTest');
export const callTutorToken = httpsCallable(fns, 'tutorToken');
export const callAdminGrant = httpsCallable(fns, 'adminGrant');
