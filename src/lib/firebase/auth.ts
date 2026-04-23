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
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth as _auth, db as _db } from './config';

// These are only null at build time when env vars are missing.
// At runtime they are always initialized.
const auth = _auth!;
const db = _db!;
import type { User, UserRole } from '@/types';
import { DB_PATHS } from '@/types';
import { donorDb, screeningDb } from './database';

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
 * Provision a donor record + 3 pending screenings for a Google-signed-in user,
 * then link it on the user profile. Idempotent: no-op if linkedId already set.
 */
async function ensureDonorLinked(fbUser: FirebaseUser, name: string, email: string) {
  const userSnap = await get(ref(db, `${DB_PATHS.USERS}/${fbUser.uid}`));
  const user = userSnap.val() as Omit<User, 'uid'> | null;
  if (user?.linkedId) return;
  if (user?.role && user.role !== 'donor') return;

  const donorId = await donorDb.create({
    userId: fbUser.uid,
    name,
    age: 0,
    gender: 'male',
    phone: '',
    email,
    address: '',
    city: '',
    bloodType: 'O',
    rhesus: '+',
    status: 'pending',
    medicalHistory: {
      hasDiabetes: false,
      hasHypertension: false,
      hasKidneyDisease: false,
      hasHeartDisease: false,
      hasCancer: false,
      hasHIV: false,
      hasHepatitis: false,
      currentMedications: '',
      allergies: '',
      previousSurgeries: '',
      familyMedicalHistory: '',
      notes: '',
    },
  });

  const specializations = [
    { type: 'SpPD-KGH' as const, label: 'Spesialis Penyakit Dalam - Konsultan Ginjal Hipertensi' },
    { type: 'Urologist' as const, label: 'Urolog' },
    { type: 'Forensic' as const, label: 'Dokter Forensik' },
  ];
  await Promise.all(
    specializations.map((sp) =>
      screeningDb.create({
        donorId,
        donorName: name,
        doctorId: '',
        doctorName: `Menunggu dokter ${sp.label}`,
        doctorType: sp.type,
        status: 'pending',
        result: 'pending',
        notes: '',
        scheduledAt: '',
      }),
    ),
  );
  await donorDb.update(donorId, { status: 'screening' });
  await update(ref(db, `${DB_PATHS.USERS}/${fbUser.uid}`), { linkedId: donorId });
}

/**
 * Sign in (or register) via Google OAuth 2.0 popup.
 * First-time Google users get a default 'donor' profile + donor record auto-created.
 * Existing Google users without linkedId also get auto-provisioned.
 */
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; isNew: boolean }> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  const fbUser = credential.user;

  const name = fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'Google User';
  const email = fbUser.email ?? '';

  const existing = await get(ref(db, `${DB_PATHS.USERS}/${fbUser.uid}`));
  let isNew = false;
  if (!existing.exists()) {
    const userRecord: Omit<User, 'uid'> = {
      email,
      name,
      role: 'donor',
      phone: fbUser.phoneNumber ?? '',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    };
    await set(ref(db, `${DB_PATHS.USERS}/${fbUser.uid}`), userRecord);
    isNew = true;
  }
  // Provision donor entity + link (idempotent — skips if already linked).
  await ensureDonorLinked(fbUser, name, email);
  return { user: fbUser, isNew };
}

/**
 * Return the current user's Firebase ID token (the JWT used by API guards).
 */
export async function getIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}

/**
 * Idempotent: provision a donor record for the currently signed-in user
 * if they don't already have one linked. Returns the linked donor id.
 * Used by the donor dashboard to fix up legacy Google users created
 * before the auto-provision flow was added.
 */
export async function provisionDonorForCurrentUser(): Promise<string | null> {
  const fbUser = auth.currentUser;
  if (!fbUser) return null;
  const snap = await get(ref(db, `${DB_PATHS.USERS}/${fbUser.uid}`));
  if (!snap.exists()) return null;
  const u = snap.val() as Omit<User, 'uid'>;
  if (u.linkedId) return u.linkedId;
  await ensureDonorLinked(fbUser, u.name ?? fbUser.displayName ?? 'User', u.email ?? fbUser.email ?? '');
  const after = await get(ref(db, `${DB_PATHS.USERS}/${fbUser.uid}/linkedId`));
  return after.exists() ? (after.val() as string) : null;
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
