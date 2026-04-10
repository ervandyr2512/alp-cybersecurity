// ============================================================
// KidneyHub - Type Definitions
// Centralized type system for all entities in the platform
// ============================================================

export type UserRole = 'admin' | 'doctor' | 'hospital_staff' | 'donor';

export type DonorStatus =
  | 'pending'
  | 'screening'
  | 'eligible'
  | 'assigned'
  | 'rejected';

export type ScreeningStatus = 'pending' | 'scheduled' | 'completed';
export type ScreeningResult = 'eligible' | 'ineligible' | 'pending';
export type AssignmentStatus = 'pending' | 'active' | 'completed';

export type DoctorSpecialization =
  | 'SpPD-KGH'
  | 'Urologist'
  | 'Forensic';

// ---- User ----
export interface User {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  createdAt: string;
  isEmailVerified: boolean;
  linkedId?: string; // donorId / doctorId / hospitalId
}

// ---- Donor ----
export interface Donor {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  address: string;
  city: string;
  bloodType: 'A' | 'B' | 'AB' | 'O';
  rhesus: '+' | '-';
  medicalHistory: MedicalHistory;
  status: DonorStatus;
  assignedHospitalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasKidneyDisease: boolean;
  hasHeartDisease: boolean;
  hasCancer: boolean;
  hasHIV: boolean;
  hasHepatitis: boolean;
  currentMedications: string;
  allergies: string;
  previousSurgeries: string;
  familyMedicalHistory: string;
  notes: string;
}

// ---- Doctor ----
export interface Doctor {
  id: string;
  userId?: string;
  name: string;
  specialization: DoctorSpecialization;
  hospital: string;
  phone: string;
  email: string;
  licenseNumber: string;
  isActive: boolean;
  photoUrl?: string;
  bio?: string;
  createdAt: string;
}

// ---- Hospital ----
export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  capacity: number;
  currentLoad: number;
  isActive: boolean;
  facilities: string[];
  photoUrl?: string;
  createdAt: string;
}

// ---- Screening ----
export interface Screening {
  id: string;
  donorId: string;
  donorName: string;
  doctorId: string;
  doctorName: string;
  doctorType: DoctorSpecialization;
  status: ScreeningStatus;
  result: ScreeningResult;
  notes: string;
  scheduledAt: string;
  completedAt?: string;
  createdAt: string;
}

// ---- Medical Record ----
export interface MedicalRecord {
  id: string;
  donorId: string;
  donorName: string;
  hospitalId: string;
  hospitalName: string;
  physicalExam: PhysicalExam;
  labResults: LabResults;
  overallResult?: 'fit' | 'unfit' | 'pending';
  notes: string;
  conductedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalExam {
  height: number; // cm
  weight: number; // kg
  bmi?: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  generalCondition: string;
}

export interface LabResults {
  // CBC / DPL
  hemoglobin?: number;
  hematocrit?: number;
  leukocytes?: number;
  thrombocytes?: number;
  erythrocytes?: number;
  // Renal function
  urea?: number;
  creatinine?: number;
  gfr?: number;
  // Electrolytes
  sodium?: number;
  potassium?: number;
  chloride?: number;
  calcium?: number;
  // Immunology
  hlaTyping?: string;
  bloodGroup?: string;
  crossmatch?: 'positive' | 'negative' | 'pending';
  // Infectious disease
  hivStatus?: 'reactive' | 'non-reactive' | 'pending';
  hepatitisBStatus?: 'reactive' | 'non-reactive' | 'pending';
  hepatitisCStatus?: 'reactive' | 'non-reactive' | 'pending';
  // Genomic (optional)
  genomicTesting?: string;
  genomicNotes?: string;
}

// ---- Hospital Assignment ----
export interface Assignment {
  id: string;
  donorId: string;
  donorName: string;
  hospitalId: string;
  hospitalName: string;
  status: AssignmentStatus;
  assignedAt: string;
  completedAt?: string;
}

// ---- Form Types ----
export type DonorFormData = Omit<Donor, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>;
export type DoctorFormData = Omit<Doctor, 'id' | 'userId' | 'createdAt'>;
export type HospitalFormData = Omit<Hospital, 'id' | 'createdAt'>;
export type MedicalRecordFormData = Omit<MedicalRecord, 'id' | 'donorName' | 'hospitalName' | 'createdAt' | 'updatedAt'>;

// ---- Firebase DB paths ----
export const DB_PATHS = {
  USERS: 'users',
  DONORS: 'donors',
  DOCTORS: 'doctors',
  HOSPITALS: 'hospitals',
  SCREENINGS: 'screenings',
  MEDICAL_RECORDS: 'medicalRecords',
  ASSIGNMENTS: 'assignments',
} as const;
