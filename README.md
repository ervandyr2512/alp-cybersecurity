# ALP Sistem Otorisasi — alp-cybersecurity

Aplikasi web demonstrasi penerapan **JWT**, **OAuth 2.0 (Google)**, **RBAC**,
**ABAC**, dan **gabungan RBAC+ABAC** di atas kasus nyata registri donor ginjal
(KidneyHub). Dikembangkan untuk tugas ALP Sistem Otorisasi, Universitas
Ciputra Online Learning.

- **Nama:** Ervandy Rangganata
- **NIM:** 0706012414015
- **Live:** https://alp-cybersecurity.vercel.app
- **Demo otorisasi interaktif:** https://alp-cybersecurity.vercel.app/demo/authz
- **Laporan:** [Laporan-ALP-SistemOtorisasi-Ervandy-0706012414015.docx](Laporan-ALP-SistemOtorisasi-Ervandy-0706012414015.docx)

## Ringkasan kontrol akses

| Mekanisme | Implementasi |
|---|---|
| **Access token** | Firebase ID token (JWT RS256) — sama untuk email/password dan Google OAuth |
| **JWT verification** | `firebase-admin` SDK di [src/lib/auth/api-guard.ts](src/lib/auth/api-guard.ts) |
| **Policy engine** | Pure functions di [src/lib/auth/policies.ts](src/lib/auth/policies.ts) — setiap policy return `{allow, reason, matched}` |
| **4 Role (RBAC)** | `admin`, `doctor`, `hospital_staff`, `donor` |
| **Atribut (ABAC)** | `user.uid`, `user.linkedId`, `donor.userId`, `donor.assignedHospitalId`, `screening.doctorId`, `record.hospitalId` |
| **Enforcement** | Setiap `/api/*` route melewati `authenticate()` + policy sebelum akses data |

## Akun demo

Semua akun sudah di-seed di Firebase project `alp-cybersecurity-b38b3`
(script: [seed-authz-demo.js](seed-authz-demo.js)).

| Email | Password | Role | linkedId |
|---|---|---|---|
| `admin@demo.test` | `Admin@123` | admin | — |
| `doctor1@demo.test` | `Doctor@123` | doctor | doctor-1 |
| `doctor2@demo.test` | `Doctor@123` | doctor | doctor-2 |
| `staffA@demo.test` | `Staff@123` | hospital_staff | hospital-A |
| `staffB@demo.test` | `Staff@123` | hospital_staff | hospital-B |
| `donor1@demo.test` | `Donor@123` | donor | donor-1 |

Login dengan Google juga didukung — user baru otomatis dibuat sebagai `donor`
dan di-provisioning (Donor entity + 3 pending screenings + `linkedId`)
sehingga tidak perlu isi ulang form registrasi.

## Access policy (ringkas)

| Endpoint | Aksi | Check | Aturan |
|---|---|---|---|
| `/api/auth/me` | GET | JWT | Token valid (siapa pun terautentikasi). |
| `/api/hospitals` | GET | RBAC | Semua user login. |
| `/api/hospitals` | POST | RBAC | Admin saja. |
| `/api/doctors` | GET | RBAC | admin + hospital_staff. |
| `/api/doctors` | POST | RBAC | Admin saja. |
| `/api/donors` | GET | RBAC+ABAC | admin/doctor semua. hospital_staff: donor dengan `assignedHospitalId == linkedId`. donor: hanya `userId == uid`. |
| `/api/donors` | POST | RBAC+ABAC | admin/hospital_staff/donor. Donor dipaksa `userId = uid`. |
| `/api/donors/{id}` | GET | RBAC+ABAC | admin · doctor · hospital_staff jika rumah sakit sama · donor jika `userId` sama. |
| `/api/donors/{id}` | PATCH | RBAC+ABAC | admin · donor dirinya sendiri · hospital_staff rumah sakitnya. |
| `/api/donors/{id}` | DELETE | RBAC | Admin saja. |
| `/api/medical-records` | GET | RBAC+ABAC | admin/doctor semua. hospital_staff: `record.hospitalId == linkedId`. donor: `record.donorId == linkedId`. |
| `/api/medical-records` | POST | RBAC+ABAC | admin/doctor/hospital_staff. hospital_staff dipaksa `hospitalId = linkedId`. |

Detail lengkap di [Laporan-ALP-SistemOtorisasi-Ervandy-0706012414015.docx](Laporan-ALP-SistemOtorisasi-Ervandy-0706012414015.docx).

## Arsitektur

```
Browser ──► /login ──► Firebase Auth (Email/Password or Google OAuth)
                           │
                           ▼
                     ID Token (JWT RS256)
                           │
Next.js Client ◄──── stored ──────┐
    │                              │
    │  Authorization: Bearer <jwt> │
    ▼                              │
Next.js API Route                  │
    │                              │
    ▼                              │
api-guard.authenticate()           │
    │                              │
    ├─► firebase-admin.verifyIdToken  (signature + expiration)
    │
    ├─► fetch user from Realtime DB   (role, linkedId)
    │
    ▼
policies.ts (RBAC + ABAC pure functions)
    │
    ├─► allow → route proceeds, fetch via firebase-admin (server-db.ts)
    │
    └─► deny  → 401/403 with reason and matched=RBAC/ABAC/RBAC+ABAC/DENY
```

## Struktur proyek

```
src/
├── app/
│   ├── (auth)/login/           # Login page (email/password + Google OAuth button)
│   ├── (auth)/register/         # Donor self-registration
│   ├── api/
│   │   ├── auth/me/             # JWT decode endpoint
│   │   ├── donors/              # Protected donor CRUD
│   │   ├── doctors/             # Protected doctor CRUD
│   │   ├── hospitals/           # Protected hospital CRUD
│   │   └── medical-records/     # Protected records CRUD
│   ├── demo/authz/              # Interactive authorization playground
│   └── dashboard/
│       ├── admin/ doctor/ hospital/ donor/
├── lib/
│   ├── auth/
│   │   ├── policies.ts          # Pure-function policy engine (RBAC+ABAC)
│   │   └── api-guard.ts         # authenticate + authorize helpers
│   ├── firebase/
│   │   ├── auth.ts              # signIn / signInWithGoogle / auto-provision
│   │   ├── config.ts            # Client SDK init
│   │   ├── admin.ts             # Admin SDK init (verifyIdToken, writes)
│   │   ├── database.ts          # Client-side DB helpers (dashboards)
│   │   └── server-db.ts         # Server-side DB helpers (API routes)
│   └── api-client.ts            # Client fetch wrapper (auto-attaches Bearer)
├── contexts/
│   └── AuthContext.tsx          # Firebase auth + user profile
└── types/
    └── index.ts                 # Shared TypeScript types
```

## Menjalankan lokal

```bash
# 1. Clone
git clone https://github.com/ervandyr2512/alp-cybersecurity.git
cd alp-cybersecurity

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.local.example .env.local
# edit .env.local — nilai sudah dicontohkan untuk project Firebase alp-cybersecurity-b38b3

# 4. Ambil service account key dari Firebase Console
#    (Project settings → Service accounts → Generate new private key)
#    Simpan sebagai ./serviceAccountKey.json (sudah di-gitignore)

# 5. Seed akun demo (opsional — akun sudah aktif di Firebase)
node seed-authz-demo.js

# 6. Jalankan dev server
npm run dev
# buka http://localhost:3000
```

## Uji coba cepat

1. Buka `/login`, coba login dengan kredensial demo (admin/staffA/donor1/dll).
2. Navigasi ke `/demo/authz` — setiap tombol "Panggil" memicu request API
   yang menunjukkan hasil RBAC/ABAC/gabungan dengan warna hijau (allowed) atau
   merah (denied) lengkap dengan alasan dari policy engine.
3. Buka DevTools Network tab → lihat header `Authorization: Bearer <jwt>` yang
   dilampirkan oleh `api-client.ts`. Tanpa token → 401.

Verifikasi via curl (perlu ID token dulu):

```bash
API_KEY="AIzaSyDisRVSjpN0nO7bf_ss8_yEW3kgsmMUF88"
TOKEN=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.test","password":"Admin@123","returnSecureToken":true}' \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).idToken))')

curl -H "Authorization: Bearer $TOKEN" https://alp-cybersecurity.vercel.app/api/auth/me
```

## Stack

- Next.js 16 (App Router) + TypeScript
- Firebase Auth (email/password + Google OAuth)
- Firebase Realtime Database
- firebase-admin (server-side JWT verification)
- Tailwind CSS
- Vercel (hosting, region: Singapore)
