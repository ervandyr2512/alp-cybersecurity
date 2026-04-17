/**
 * KidneyHub.id — Seed Hospital Data ke Firebase Realtime DB
 * Jalankan: node seed-hospitals.js
 */

const https = require('https');

const API_KEY      = 'AIzaSyCdP84cjZjQAEuyvhBEmD6hzuMTLe70qFI';
const DATABASE_URL = 'https://kidneyhub-id-default-rtdb.asia-southeast1.firebasedatabase.app';
const DB_HOST      = DATABASE_URL.replace('https://', '');

const HOSPITALS = [
  {
    name: 'RSUPN Dr. Cipto Mangunkusumo (RSCM)',
    address: 'Jl. Diponegoro No.71, Kenari, Senen',
    city: 'Jakarta Pusat',
    phone: '02114001937',
    email: 'info@rscm.co.id',
    website: 'https://www.rscm.co.id',
    capacity: 50,
    currentLoad: 12,
    isActive: true,
    facilities: ['Transplantasi Ginjal', 'Hemodialisis', 'HLA Typing', 'ICU', 'Laboratorium Imunologi'],
  },
  {
    name: 'RSUP Fatmawati',
    address: 'Jl. RS Fatmawati Raya No.4, Cilandak',
    city: 'Jakarta Selatan',
    phone: '02175012345',
    email: 'info@fatmawati.com',
    website: 'https://www.fatmawati.com',
    capacity: 30,
    currentLoad: 8,
    isActive: true,
    facilities: ['Transplantasi Ginjal', 'Hemodialisis', 'Laboratorium', 'ICU'],
  },
  {
    name: 'RS Bunda Jakarta',
    address: 'Jl. Teuku Cik Ditiro No.28, Menteng',
    city: 'Jakarta Pusat',
    phone: '02131907777',
    email: 'info@bundajakarta.com',
    website: 'https://www.bundajakarta.com',
    capacity: 20,
    currentLoad: 5,
    isActive: true,
    facilities: ['Transplantasi Ginjal', 'Hemodialisis', 'Laboratorium'],
  },
  {
    name: 'Siloam Hospitals ASRI',
    address: 'Jl. H. R. Rasuna Said Kav. 62-63, Kuningan',
    city: 'Jakarta Selatan',
    phone: '02152009999',
    email: 'info@siloam-asri.com',
    website: 'https://www.siloamhospitals.com',
    capacity: 25,
    currentLoad: 7,
    isActive: true,
    facilities: ['Transplantasi Ginjal', 'Hemodialisis', 'HLA Typing', 'Genomik', 'ICU'],
  },
  {
    name: 'Mandaya Royal Hospital Puri',
    address: 'Jl. Metland Boulevard Kav. 1, Puri',
    city: 'Jakarta Barat',
    phone: '02129779999',
    email: 'info@mandayaroyalhospital.com',
    website: 'https://www.mandayaroyalhospital.com',
    capacity: 20,
    currentLoad: 3,
    isActive: true,
    facilities: ['Transplantasi Ginjal', 'Hemodialisis', 'Laboratorium Canggih'],
  },
];

function httpsPost(hostname, path, body, idToken) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const authPath = idToken ? `${path}?auth=${idToken}` : path;
    const req = https.request(
      { hostname, path: authPath, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => { let raw = ''; res.on('data', c => raw += c); res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } }); }
    );
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function signIn(email, password) {
  const res = await httpsPost('identitytoolkit.googleapis.com',
    `/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email, password, returnSecureToken: true }
  );
  if (res.error) throw new Error(res.error.message);
  return res.idToken;
}

async function main() {
  console.log('KidneyHub.id — Seed Hospital Data\n');
  const idToken = await signIn('rscm@kidneyhub.id', 'Hospital@123');

  const now = new Date().toISOString();
  for (const h of HOSPITALS) {
    const res = await httpsPost(DB_HOST, '/hospitals.json',
      { ...h, createdAt: now }, idToken
    );
    if (res.name) {
      console.log(`OK  ${h.name} (id: ${res.name})`);
    } else {
      console.log(`ERR ${h.name}:`, JSON.stringify(res));
    }
  }
  console.log('\nSelesai. Refresh dashboard untuk melihat data.');
}

main().catch(console.error);
