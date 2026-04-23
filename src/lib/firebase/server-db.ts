// ============================================================
// Server-side database helpers (Admin SDK).
// Mirror the shape of database.ts but use firebase-admin so
// RTDB security rules are bypassed. Import ONLY from API routes.
// ============================================================

import 'server-only';
import { getAdminDb } from './admin';
import { DB_PATHS } from '@/types';
import type {
  Donor, Doctor, Hospital, Screening, MedicalRecord, Assignment,
} from '@/types';

type AnyObj = Record<string, unknown>;

async function sGetAll<T>(path: string): Promise<T[]> {
  const snap = await getAdminDb().ref(path).get();
  if (!snap.exists()) return [];
  return Object.entries(snap.val() as AnyObj).map(
    ([id, val]) => ({ id, ...(val as object) } as T),
  );
}

async function sGet<T>(path: string, id: string): Promise<T | null> {
  const snap = await getAdminDb().ref(`${path}/${id}`).get();
  if (!snap.exists()) return null;
  return { id, ...snap.val() } as T;
}

async function sCreate(path: string, data: AnyObj): Promise<string> {
  const ref = getAdminDb().ref(path).push();
  const record = { ...data, createdAt: new Date().toISOString() };
  await ref.set(record);
  return ref.key as string;
}

async function sUpdate(path: string, id: string, data: AnyObj): Promise<void> {
  await getAdminDb().ref(`${path}/${id}`).update(data);
}

async function sDelete(path: string, id: string): Promise<void> {
  await getAdminDb().ref(`${path}/${id}`).remove();
}

export const donorDbS = {
  getAll: () => sGetAll<Donor>(DB_PATHS.DONORS),
  get: (id: string) => sGet<Donor>(DB_PATHS.DONORS, id),
  create: (d: Omit<Donor, 'id' | 'createdAt' | 'updatedAt'>) =>
    sCreate(DB_PATHS.DONORS, { ...d, updatedAt: new Date().toISOString() }),
  update: (id: string, d: Partial<Donor>) => sUpdate(DB_PATHS.DONORS, id, d as AnyObj),
  delete: (id: string) => sDelete(DB_PATHS.DONORS, id),
};

export const doctorDbS = {
  getAll: () => sGetAll<Doctor>(DB_PATHS.DOCTORS),
  get: (id: string) => sGet<Doctor>(DB_PATHS.DOCTORS, id),
  create: (d: Omit<Doctor, 'id' | 'createdAt'>) => sCreate(DB_PATHS.DOCTORS, d as unknown as AnyObj),
};

export const hospitalDbS = {
  getAll: () => sGetAll<Hospital>(DB_PATHS.HOSPITALS),
  get: (id: string) => sGet<Hospital>(DB_PATHS.HOSPITALS, id),
  create: (d: Omit<Hospital, 'id' | 'createdAt'>) => sCreate(DB_PATHS.HOSPITALS, d as unknown as AnyObj),
};

export const screeningDbS = {
  getAll: () => sGetAll<Screening>(DB_PATHS.SCREENINGS),
  get: (id: string) => sGet<Screening>(DB_PATHS.SCREENINGS, id),
};

export const medicalRecordDbS = {
  getAll: () => sGetAll<MedicalRecord>(DB_PATHS.MEDICAL_RECORDS),
  get: (id: string) => sGet<MedicalRecord>(DB_PATHS.MEDICAL_RECORDS, id),
  getByDonor: async (donorId: string) => {
    const all = await sGetAll<MedicalRecord>(DB_PATHS.MEDICAL_RECORDS);
    return all.filter((r) => r.donorId === donorId);
  },
  create: (d: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) =>
    sCreate(DB_PATHS.MEDICAL_RECORDS, { ...d, updatedAt: new Date().toISOString() } as unknown as AnyObj),
};

export const assignmentDbS = {
  getAll: () => sGetAll<Assignment>(DB_PATHS.ASSIGNMENTS),
};
