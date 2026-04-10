// ============================================================
// KidneyHub - Firebase Auth Helpers
// Wraps Firebase Auth methods for cleaner usage across the app
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth as _auth, db as _db } from './config';

// These are only null at build time when env vars are missing.
// At runtime they are always initialized.
const auth = _auth!;
const db = _db!;
import type { User, UserRole } from '@/types';
import { DB_PATHS } from '@/types';

/**
 * Register a new user with email & password.
 * Creates a Realtime DB user record after successful signup.
 * Sends email verification immediately.
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'donor'
): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const userRecord: Omit<User, 'uid'> = {
    email,
    name,
    role,
    phone: '',
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
  };

  // Persist user profile in Realtime DB
  await set(ref(db, `${DB_PATHS.USERS}/${user.uid}`), userRecord);

  // Send email verification (acts as OTP flow via link)
  await sendEmailVerification(user);

  return user;
}

/**
 * Sign in existing user. Returns Firebase user or throws.
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Sign out current user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Fetch user profile from Realtime DB by UID.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  const snapshot = await get(ref(db, `${DB_PATHS.USERS}/${uid}`));
  if (!snapshot.exists()) return null;
  return { uid, ...snapshot.val() } as User;
}

/**
 * Resend email verification to current signed-in user.
 */
export async function resendVerificationEmail(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

/**
 * Subscribe to auth state changes.
 * Returns unsubscribe function.
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
