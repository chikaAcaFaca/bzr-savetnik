import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  type Auth,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
};

let app: FirebaseApp;
let auth: Auth;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export async function loginWithEmail(email: string, password: string) {
  const firebaseAuth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string) {
  const firebaseAuth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await sendEmailVerification(result.user);
  return result.user;
}

export async function loginWithGoogle() {
  const firebaseAuth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(firebaseAuth, provider);
  return result.user;
}

export async function logout() {
  const firebaseAuth = getFirebaseAuth();
  await signOut(firebaseAuth);
}

export async function resetPassword(email: string) {
  const firebaseAuth = getFirebaseAuth();
  await sendPasswordResetEmail(firebaseAuth, email);
}

export async function getIdToken(): Promise<string | null> {
  const firebaseAuth = getFirebaseAuth();
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function onAuthChange(callback: (user: User | null) => void) {
  const firebaseAuth = getFirebaseAuth();
  return onAuthStateChanged(firebaseAuth, callback);
}

export type { User as FirebaseUser };
