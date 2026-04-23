/**
 * alp-cybersecurity — Demo data for /demo/authz
 * Menggunakan firebase-admin SDK (butuh serviceAccountKey.json).
 *
 *   node seed-authz-demo.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://alp-cybersecurity-b38b3-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const db = admin.database();
const auth = admin.auth();

async function ensureUser(email, password) {
  try {
    const rec = await auth.getUserByEmail(email);
    return rec.uid;
  } catch {
    const rec = await auth.createUser({ email, password, emailVerified: true });
    return rec.uid;
  }
}

(async () => {
  const now = new Date().toISOString();

  const hospitalA = {
    id: 'hospital-A', name: 'RS Demo Utama', address: 'Jl. Demo 1', city: 'Jakarta',
    phone: '021-1000001', email: 'info@rs-a.test', capacity: 10, currentLoad: 2,
    isActive: true, facilities: ['dialysis', 'transplant-unit'], createdAt: now,
  };
  const hospitalB = {
    id: 'hospital-B', name: 'RS Demo Kedua', address: 'Jl. Demo 2', city: 'Surabaya',
    phone: '031-2000002', email: 'info@rs-b.test', capacity: 8, currentLoad: 1,
    isActive: true, facilities: ['dialysis'], createdAt: now,
  };

  console.log('🏥 Seeding hospitals...');
  await db.ref(`hospitals/${hospitalA.id}`).set(hospitalA);
  await db.ref(`hospitals/${hospitalB.id}`).set(hospitalB);

  const doctor1 = {
    id: 'doctor-1', name: 'dr. Demo Satu, SpPD-KGH', specialization: 'SpPD-KGH',
    hospital: hospitalA.name, phone: '08111000001', email: 'doctor1@demo.test',
    licenseNumber: 'DEMO-DR-001', isActive: true, createdAt: now,
  };
  const doctor2 = {
    id: 'doctor-2', name: 'dr. Demo Dua, SpPD-KGH', specialization: 'SpPD-KGH',
    hospital: hospitalB.name, phone: '08111000002', email: 'doctor2@demo.test',
    licenseNumber: 'DEMO-DR-002', isActive: true, createdAt: now,
  };

  console.log('👨‍⚕️ Seeding doctors...');
  await db.ref(`doctors/${doctor1.id}`).set(doctor1);
  await db.ref(`doctors/${doctor2.id}`).set(doctor2);

  console.log('🔑 Creating auth users + profiles...');
  const adminUid = await ensureUser('admin@demo.test', 'Admin@123');
  await db.ref(`users/${adminUid}`).set({
    email: 'admin@demo.test', name: 'Demo Admin', role: 'admin', phone: '',
    isEmailVerified: true, createdAt: now,
  });

  const d1Uid = await ensureUser('doctor1@demo.test', 'Doctor@123');
  await db.ref(`users/${d1Uid}`).set({
    email: 'doctor1@demo.test', name: doctor1.name, role: 'doctor',
    phone: doctor1.phone, isEmailVerified: true, linkedId: doctor1.id, createdAt: now,
  });
  await db.ref(`doctors/${doctor1.id}/userId`).set(d1Uid);

  const d2Uid = await ensureUser('doctor2@demo.test', 'Doctor@123');
  await db.ref(`users/${d2Uid}`).set({
    email: 'doctor2@demo.test', name: doctor2.name, role: 'doctor',
    phone: doctor2.phone, isEmailVerified: true, linkedId: doctor2.id, createdAt: now,
  });
  await db.ref(`doctors/${doctor2.id}/userId`).set(d2Uid);

  const sAUid = await ensureUser('staffA@demo.test', 'Staff@123');
  await db.ref(`users/${sAUid}`).set({
    email: 'staffA@demo.test', name: 'Staff RS Utama', role: 'hospital_staff', phone: '',
    isEmailVerified: true, linkedId: hospitalA.id, createdAt: now,
  });
  const sBUid = await ensureUser('staffB@demo.test', 'Staff@123');
  await db.ref(`users/${sBUid}`).set({
    email: 'staffB@demo.test', name: 'Staff RS Kedua', role: 'hospital_staff', phone: '',
    isEmailVerified: true, linkedId: hospitalB.id, createdAt: now,
  });

  const donor1Uid = await ensureUser('donor1@demo.test', 'Donor@123');
  const donor1 = {
    id: 'donor-1', userId: donor1Uid, name: 'Budi Donor', age: 32, gender: 'male',
    phone: '085100000001', email: 'donor1@demo.test', address: 'Jl. Donor 1',
    city: 'Jakarta', bloodType: 'O', rhesus: '+',
    medicalHistory: { hasDiabetes: false, hasHypertension: false, hasKidneyDisease: false, hasHeartDisease: false, hasCancer: false, hasHIV: false, hasHepatitis: false, currentMedications: '', allergies: '', previousSurgeries: '', familyMedicalHistory: '', notes: '' },
    status: 'screening', assignedHospitalId: hospitalA.id, createdAt: now, updatedAt: now,
  };
  await db.ref(`donors/${donor1.id}`).set(donor1);
  await db.ref(`users/${donor1Uid}`).set({
    email: 'donor1@demo.test', name: donor1.name, role: 'donor', phone: donor1.phone,
    isEmailVerified: true, linkedId: donor1.id, createdAt: now,
  });

  const donor2 = {
    id: 'donor-2', userId: 'orphan-donor', name: 'Siti Donor', age: 29, gender: 'female',
    phone: '085100000002', email: 'donor2@demo.test', address: 'Jl. Donor 2',
    city: 'Surabaya', bloodType: 'A', rhesus: '+',
    medicalHistory: { hasDiabetes: false, hasHypertension: false, hasKidneyDisease: false, hasHeartDisease: false, hasCancer: false, hasHIV: false, hasHepatitis: false, currentMedications: '', allergies: '', previousSurgeries: '', familyMedicalHistory: '', notes: '' },
    status: 'eligible', assignedHospitalId: hospitalB.id, createdAt: now, updatedAt: now,
  };
  await db.ref(`donors/${donor2.id}`).set(donor2);

  console.log('🩺 Seeding screenings...');
  await db.ref(`screenings/screening-1`).set({
    id: 'screening-1', donorId: donor1.id, donorName: donor1.name,
    doctorId: doctor1.id, doctorName: doctor1.name, doctorType: doctor1.specialization,
    status: 'scheduled', result: 'pending', notes: '', scheduledAt: now, createdAt: now,
  });
  await db.ref(`screenings/screening-2`).set({
    id: 'screening-2', donorId: donor2.id, donorName: donor2.name,
    doctorId: doctor2.id, doctorName: doctor2.name, doctorType: doctor2.specialization,
    status: 'completed', result: 'eligible', notes: 'Semua parameter normal',
    scheduledAt: now, completedAt: now, createdAt: now,
  });

  console.log('📋 Seeding medical records...');
  await db.ref(`medicalRecords/mr-1`).set({
    id: 'mr-1', donorId: donor1.id, donorName: donor1.name,
    hospitalId: hospitalA.id, hospitalName: hospitalA.name,
    physicalExam: { height: 170, weight: 68, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, heartRate: 72, temperature: 36.5, oxygenSaturation: 98, generalCondition: 'Baik' },
    labResults: { hemoglobin: 14, creatinine: 0.9 },
    overallResult: 'fit', notes: '', conductedBy: 'Staff A', createdAt: now, updatedAt: now,
  });
  await db.ref(`medicalRecords/mr-2`).set({
    id: 'mr-2', donorId: donor2.id, donorName: donor2.name,
    hospitalId: hospitalB.id, hospitalName: hospitalB.name,
    physicalExam: { height: 160, weight: 55, bloodPressureSystolic: 115, bloodPressureDiastolic: 75, heartRate: 70, temperature: 36.6, oxygenSaturation: 99, generalCondition: 'Baik' },
    labResults: { hemoglobin: 13, creatinine: 0.8 },
    overallResult: 'fit', notes: '', conductedBy: 'Staff B', createdAt: now, updatedAt: now,
  });

  console.log('\n✅ Seed selesai. Akun demo:');
  console.log('  admin@demo.test    / Admin@123   — role=admin');
  console.log(`  doctor1@demo.test  / Doctor@123  — role=doctor, linkedId=${doctor1.id}`);
  console.log(`  doctor2@demo.test  / Doctor@123  — role=doctor, linkedId=${doctor2.id}`);
  console.log(`  staffA@demo.test   / Staff@123   — role=hospital_staff, linkedId=${hospitalA.id}`);
  console.log(`  staffB@demo.test   / Staff@123   — role=hospital_staff, linkedId=${hospitalB.id}`);
  console.log(`  donor1@demo.test   / Donor@123   — role=donor, linkedId=${donor1.id}`);
  process.exit(0);
})().catch((err) => {
  console.error('❌ Seed gagal:', err);
  process.exit(1);
});
