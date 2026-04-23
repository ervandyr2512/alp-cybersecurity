// ============================================================
// alp-cybersecurity — Authorization Policy Engine
// Centralized RBAC + ABAC rules. Pure functions, zero I/O.
// ============================================================

import type { UserRole, Donor, Screening, MedicalRecord, Assignment } from '@/types';

export interface AuthContext {
  uid: string;
  email: string;
  role: UserRole;
  linkedId?: string;
}

export interface PolicyResult {
  allow: boolean;
  reason: string;
  matched: 'RBAC' | 'ABAC' | 'RBAC+ABAC' | 'DENY';
}

const allow = (reason: string, matched: PolicyResult['matched']): PolicyResult => ({
  allow: true,
  reason,
  matched,
});

const deny = (reason: string): PolicyResult => ({
  allow: false,
  reason,
  matched: 'DENY',
});

// ─── Donor policies ──────────────────────────────────────────

export function canListAllDonors(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat melihat seluruh daftar donor', 'RBAC');
  if (ctx.role === 'doctor') return allow('doctor dapat melihat daftar donor untuk skrining', 'RBAC');
  if (ctx.role === 'hospital_staff') return allow('hospital_staff dapat melihat daftar donor', 'RBAC');
  return deny('role donor tidak boleh melihat daftar seluruh donor');
}

export function canViewDonor(ctx: AuthContext, donor: Donor): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat melihat semua donor', 'RBAC');
  if (ctx.role === 'doctor') return allow('doctor dapat melihat data donor untuk skrining', 'RBAC');
  if (ctx.role === 'hospital_staff') {
    if (donor.assignedHospitalId && donor.assignedHospitalId === ctx.linkedId) {
      return allow(
        `hospital_staff.linkedId=${ctx.linkedId} cocok dengan donor.assignedHospitalId — akses diizinkan`,
        'RBAC+ABAC',
      );
    }
    return deny(
      `hospital_staff hanya dapat melihat donor yang ditugaskan ke rumah sakitnya (linkedId=${ctx.linkedId}, donor.assignedHospitalId=${donor.assignedHospitalId ?? '—'})`,
    );
  }
  // donor
  if (donor.userId === ctx.uid) {
    return allow('donor dapat melihat data dirinya sendiri', 'ABAC');
  }
  return deny('donor hanya dapat melihat data dirinya sendiri');
}

export function canCreateDonor(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin' || ctx.role === 'hospital_staff' || ctx.role === 'donor') {
    return allow(`${ctx.role} dapat membuat profil donor`, 'RBAC');
  }
  return deny('doctor tidak boleh membuat data donor');
}

export function canUpdateDonor(ctx: AuthContext, donor: Donor): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat mengubah data donor', 'RBAC');
  if (ctx.role === 'donor' && donor.userId === ctx.uid) {
    return allow('donor dapat mengubah data miliknya', 'ABAC');
  }
  if (ctx.role === 'hospital_staff' && donor.assignedHospitalId === ctx.linkedId) {
    return allow('hospital_staff dapat mengubah status donor yang ditugaskan ke rumah sakitnya', 'RBAC+ABAC');
  }
  return deny('tidak berhak mengubah data donor ini');
}

export function canDeleteDonor(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat menghapus data donor', 'RBAC');
  return deny('hanya admin yang dapat menghapus data donor');
}

// ─── Screening policies ──────────────────────────────────────

export function canListScreenings(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin' || ctx.role === 'doctor' || ctx.role === 'hospital_staff') {
    return allow(`${ctx.role} dapat melihat daftar skrining`, 'RBAC');
  }
  return deny('donor tidak dapat melihat seluruh skrining');
}

export function canViewScreening(ctx: AuthContext, s: Screening): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat melihat semua skrining', 'RBAC');
  if (ctx.role === 'doctor' && s.doctorId === ctx.linkedId) {
    return allow(`doctor.linkedId=${ctx.linkedId} == screening.doctorId — akses diizinkan`, 'RBAC+ABAC');
  }
  if (ctx.role === 'hospital_staff') return allow('hospital_staff dapat melihat skrining untuk koordinasi', 'RBAC');
  if (ctx.role === 'donor' && s.donorId === ctx.linkedId) {
    return allow('donor dapat melihat skrining miliknya sendiri', 'ABAC');
  }
  return deny('tidak berhak melihat skrining ini');
}

export function canEditScreening(ctx: AuthContext, s: Screening): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat mengubah skrining apa pun', 'RBAC');
  if (ctx.role === 'doctor' && s.doctorId === ctx.linkedId) {
    return allow(
      `role=doctor AND doctorId=${s.doctorId} cocok dengan linkedId=${ctx.linkedId}`,
      'RBAC+ABAC',
    );
  }
  return deny(
    `hanya admin atau doctor yang ditugaskan (screening.doctorId) yang dapat mengubah skrining. role=${ctx.role}, linkedId=${ctx.linkedId}, screening.doctorId=${s.doctorId}`,
  );
}

export function canCreateScreening(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin' || ctx.role === 'doctor') {
    return allow(`${ctx.role} dapat membuat jadwal skrining`, 'RBAC');
  }
  return deny('hanya admin atau doctor yang dapat membuat skrining');
}

// ─── Medical record policies ─────────────────────────────────

export function canListMedicalRecords(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin' || ctx.role === 'doctor' || ctx.role === 'hospital_staff') {
    return allow(`${ctx.role} dapat melihat daftar rekam medis`, 'RBAC');
  }
  return deny('donor hanya dapat melihat rekam medis miliknya (lihat endpoint per-id)');
}

export function canViewMedicalRecord(ctx: AuthContext, r: MedicalRecord): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat melihat semua rekam medis', 'RBAC');
  if (ctx.role === 'doctor') return allow('doctor dapat melihat rekam medis untuk kebutuhan evaluasi', 'RBAC');
  if (ctx.role === 'hospital_staff' && r.hospitalId === ctx.linkedId) {
    return allow(
      `hospital_staff.linkedId=${ctx.linkedId} == record.hospitalId — akses diizinkan`,
      'RBAC+ABAC',
    );
  }
  if (ctx.role === 'donor' && r.donorId === ctx.linkedId) {
    return allow('donor dapat melihat rekam medis miliknya sendiri', 'ABAC');
  }
  return deny('tidak berhak melihat rekam medis ini');
}

export function canCreateMedicalRecord(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin' || ctx.role === 'hospital_staff' || ctx.role === 'doctor') {
    return allow(`${ctx.role} dapat membuat rekam medis`, 'RBAC');
  }
  return deny('donor tidak dapat membuat rekam medis');
}

export function canDeleteMedicalRecord(ctx: AuthContext, r: MedicalRecord): PolicyResult {
  // Contoh policy gabungan RBAC + ABAC utk kasus penghapusan data sensitif:
  // Hanya admin ATAU hospital_staff dari rumah sakit yang sama yang dapat menghapus.
  if (ctx.role === 'admin') return allow('admin dapat menghapus rekam medis apa pun', 'RBAC');
  if (ctx.role === 'hospital_staff' && r.hospitalId === ctx.linkedId) {
    return allow(
      `hospital_staff dapat menghapus rekam medis rumah sakitnya sendiri (linkedId=${ctx.linkedId})`,
      'RBAC+ABAC',
    );
  }
  return deny('hanya admin atau hospital_staff pemilik rumah sakit yang dapat menghapus rekam medis');
}

// ─── Hospital policies ───────────────────────────────────────

export function canListHospitals(): PolicyResult {
  // Semua user terautentikasi dapat melihat daftar rumah sakit (data publik)
  return allow('semua user terautentikasi dapat melihat daftar rumah sakit', 'RBAC');
}

export function canManageHospitals(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat mengelola data rumah sakit', 'RBAC');
  return deny('hanya admin yang dapat mengelola rumah sakit');
}

// ─── Doctor policies ─────────────────────────────────────────

export function canListDoctors(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin' || ctx.role === 'hospital_staff') {
    return allow(`${ctx.role} dapat melihat daftar dokter`, 'RBAC');
  }
  return deny('hanya admin & hospital_staff yang dapat melihat daftar dokter');
}

export function canManageDoctors(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat mengelola data dokter', 'RBAC');
  return deny('hanya admin yang dapat mengelola dokter');
}

// ─── Assignment policies ─────────────────────────────────────

export function canCreateAssignment(ctx: AuthContext): PolicyResult {
  if (ctx.role === 'admin' || ctx.role === 'hospital_staff') {
    return allow(`${ctx.role} dapat membuat penugasan donor ke rumah sakit`, 'RBAC');
  }
  return deny('hanya admin atau hospital_staff yang dapat membuat penugasan');
}

export function canViewAssignment(ctx: AuthContext, a: Assignment): PolicyResult {
  if (ctx.role === 'admin') return allow('admin dapat melihat semua penugasan', 'RBAC');
  if (ctx.role === 'hospital_staff' && a.hospitalId === ctx.linkedId) {
    return allow('hospital_staff dapat melihat penugasan rumah sakitnya', 'RBAC+ABAC');
  }
  if (ctx.role === 'donor' && a.donorId === ctx.linkedId) {
    return allow('donor dapat melihat penugasan miliknya', 'ABAC');
  }
  if (ctx.role === 'doctor') return allow('doctor dapat melihat penugasan untuk koordinasi', 'RBAC');
  return deny('tidak berhak melihat penugasan ini');
}
