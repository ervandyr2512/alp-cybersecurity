/**
 * KidneyHub.id — Seed Screenings untuk Donor yang Sudah Ada
 * Jalankan sekali: node seed-screenings.js
 */

const https = require('https');

const API_KEY      = 'AIzaSyCdP84cjZjQAEuyvhBEmD6hzuMTLe70qFI';
const DATABASE_URL = 'https://kidneyhub-id-default-rtdb.asia-southeast1.firebasedatabase.app';
const DB_HOST      = DATABASE_URL.replace('https://', '');

// ── REST helpers ─────────────────────────────────────────────
function httpsReq(method, hostname, path, body, idToken) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const authPath = idToken ? `${path}?auth=${idToken}` : path;
    const req = https.request(
      { hostname, path: authPath, method,
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function signIn(email, password) {
  const res = await httpsReq('POST', 'identitytoolkit.googleapis.com',
    `/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email, password, returnSecureToken: true }
  );
  if (res.error) throw new Error(res.error.message);
  return res.idToken;
}

async function getDb(path, idToken) {
  return httpsReq('GET', DB_HOST, `/${path}.json`, null, idToken);
}

async function postDb(path, body, idToken) {
  return httpsReq('POST', DB_HOST, `/${path}.json`, body, idToken);
}

async function patchDb(path, body, idToken) {
  return httpsReq('PATCH', DB_HOST, `/${path}.json`, body, idToken);
}

async function main() {
  console.log('KidneyHub.id — Seed Screenings untuk Donor Existing\n');

  // Login sebagai salah satu akun dokter untuk mendapat idToken yang valid
  const idToken = await signIn('dr.ahmad@kidneyhub.id', 'Doctor@123');
  console.log('Login berhasil, mendapat idToken.\n');

  // Ambil semua donor
  const donorsRaw = await getDb('donors', idToken);
  if (!donorsRaw || donorsRaw.error) {
    console.error('Gagal membaca donors:', donorsRaw);
    return;
  }

  const donors = Object.entries(donorsRaw).map(([id, val]) => ({ id, ...val }));
  console.log(`Ditemukan ${donors.length} donor.\n`);

  // Ambil screenings yang sudah ada
  const screeningsRaw = await getDb('screenings', idToken);
  const existingDonorIds = new Set();
  if (screeningsRaw && !screeningsRaw.error) {
    Object.values(screeningsRaw).forEach((s) => existingDonorIds.add(s.donorId));
  }

  const specializations = ['SpPD-KGH', 'Urologist', 'Forensic'];
  let created = 0;
  let skipped = 0;

  for (const donor of donors) {
    if (existingDonorIds.has(donor.id)) {
      console.log(`SKIP  ${donor.name} — screenings sudah ada`);
      skipped++;
      continue;
    }

    // Buat 3 screening (satu per spesialisasi)
    const now = new Date().toISOString();
    for (const sp of specializations) {
      await postDb('screenings', {
        donorId: donor.id,
        donorName: donor.name,
        doctorId: '',
        doctorName: `Menunggu dokter ${sp}`,
        doctorType: sp,
        status: 'pending',
        result: 'pending',
        notes: '',
        scheduledAt: '',
        createdAt: now,
      }, idToken);
    }

    // Update status donor ke 'screening' jika masih 'pending'
    if (donor.status === 'pending') {
      await patchDb(`donors/${donor.id}`, {
        status: 'screening',
        updatedAt: new Date().toISOString(),
      }, idToken);
    }

    console.log(`OK    ${donor.name} — 3 screenings dibuat, status → screening`);
    created++;
  }

  console.log(`\nSelesai. ${created} donor diproses, ${skipped} dilewati.`);
}

main().catch(console.error);
