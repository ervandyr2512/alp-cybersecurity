# Skrip Video Demo — ALP Sistem Otorisasi (15 menit)

> **Penting:** Rubrik kriteria #10 eksplisit menyebut "berjalan maksimal 15 menit".
> Video >15 menit berisiko kehilangan 10% di kriteria tersebut. Skrip ini dirancang
> untuk 14:30 dengan buffer 30 detik, mencakup **semua 10 kriteria rubrik**.
>
> **Identitas:** Ervandy Rangganata · NIM 0706012414015
> **Live:** https://alp-cybersecurity.vercel.app · Repo: https://github.com/ervandyr2512/alp-cybersecurity

## Persiapan sebelum rekam

- [ ] Window browser: Chrome incognito (tampilan bersih), resolusi 1920×1080
- [ ] Buka 3 tab (belum login): login page, /demo/authz, GitHub repo
- [ ] Buka VS Code / editor dengan folder `alp-cybersecurity`
- [ ] Buka DOCX laporan (halaman Access Policy table + diagram arsitektur)
- [ ] Buka Terminal untuk demo curl (opsional — siapkan saja kalau perlu)
- [ ] Pastikan **logout** dari semua akun sebelum mulai
- [ ] Aktifkan mikrofon, tes audio singkat
- [ ] Siapkan kredensial demo di catatan: admin/doctor1/staffA/staffB/donor1

---

## Segmen 1 — Intro & Overview (00:00 → 00:45)

**Tampilkan:** Wajah/narrator + halaman cover laporan DOCX

**Narasi:**

> Halo, perkenalkan saya Ervandy Rangganata, NIM 0706012414015. Di video ini saya
> akan mendemonstrasikan proyek ALP Sistem Otorisasi saya — sebuah aplikasi web
> berbasis Next.js dan Firebase yang menerapkan **JWT, OAuth 2.0 Google Login,
> RBAC, ABAC, dan gabungan RBAC+ABAC** di atas kasus nyata registri donor ginjal.
>
> Aplikasi sudah deploy ke production di `alp-cybersecurity.vercel.app`. Dalam
> 15 menit ke depan saya akan melewati sepuluh kriteria rubrik satu per satu
> dengan bukti nyata — baik di browser, kode, maupun respons API.

---

## Segmen 2 — Access Policy List + Diagram Arsitektur (00:45 → 02:45)

**Tampilkan:** DOCX laporan — scroll ke bagian "Daftar access policy" (tabel)

**Narasi:**

> Kriteria rubrik #7 (Access Policy List) dan #8 (Diagram Arsitektur) saya
> dokumentasikan di laporan. Di sini ada tabel lengkap dua belas aturan akses:
> kolom Endpoint, Aksi, Jenis pengecekan (RBAC / ABAC / kombinasi), dan Aturan.
> Misalnya `GET /api/donors/{id}` memakai gabungan RBAC+ABAC: admin boleh semua,
> doctor boleh semua, tapi hospital_staff hanya boleh kalau `donor.assignedHospitalId`
> sama dengan `user.linkedId`, dan donor hanya boleh data dirinya sendiri.

**Tampilkan:** Diagram arsitektur di laporan

**Narasi:**

> Ini diagram alur otentikasi dan otorisasi. User login lewat Firebase Auth —
> email/password atau Google OAuth — dapat **Firebase ID Token** yang secara
> teknis adalah **JWT RS256**. Token dilampirkan pada setiap request API sebagai
> header `Authorization: Bearer`. Di sisi server, `api-guard` melakukan empat hal:
> (1) verifikasi tanda tangan JWT lewat firebase-admin SDK,
> (2) ambil role dan linkedId user dari Realtime Database,
> (3) panggil policy engine yang terpusat di `policies.ts`, dan
> (4) allow → 200 dengan data yang sudah difilter, atau deny → 403 lengkap
> dengan alasan dan kategori `matched`: RBAC, ABAC, atau RBAC+ABAC.

---

## Segmen 3 — GitHub Repository & Kode (02:45 → 05:00)

**Tampilkan:** Tab GitHub → repo `ervandyr2512/alp-cybersecurity`

**Narasi:**

> Ini kriteria #9 — repository GitHub. Repo sudah ada README lengkap: identitas
> saya, akun demo siap pakai, tabel access policy singkat, diagram arsitektur
> ASCII, struktur proyek, dan langkah menjalankan lokal — lengkap dari clone
> sampai seed demo data.

**Tampilkan:** Buka file `src/lib/auth/policies.ts` di GitHub / VS Code

**Narasi:**

> Inti otorisasi ada di `src/lib/auth/policies.ts` — **policy engine terpusat**.
> Setiap fungsi murni: terima AuthContext dan data, kembalikan objek
> `{allow, reason, matched}`. Contoh `canViewDonor`: kalau role admin langsung
> allow dengan matched RBAC. Untuk hospital_staff ada kondisi tambahan —
> `donor.assignedHospitalId` harus sama dengan `user.linkedId` — inilah
> gabungan RBAC+ABAC. Kalau donor, cek `donor.userId` sama dengan `uid` — ini
> ABAC murni.

**Tampilkan:** Buka `src/lib/auth/api-guard.ts`

**Narasi:**

> `api-guard.ts` adalah guard yang dipakai semua route. Fungsi `authenticate`
> baca header Authorization, panggil `firebase-admin.verifyIdToken` untuk
> validasi signature dan expiration, lalu query user profile untuk dapat role
> dan linkedId. Hasilnya AuthContext yang di-pass ke policy.

**Tampilkan:** Buka `src/app/api/donors/[id]/route.ts`

**Narasi:**

> Contoh pemakaian: di GET `/api/donors/{id}`, route pertama panggil
> `authenticate`, lalu `canViewDonor(ctx, donor)`, lalu `authorize` untuk
> convert policy result ke HTTP response. Tiga baris — sederhana dan konsisten
> di semua endpoint.

---

## Segmen 4 — Kriteria #1: JWT Authentication (05:00 → 06:45)

**Tampilkan:** Browser → `alp-cybersecurity.vercel.app/login`

**Narasi:**

> Kriteria #1 — autentikasi JWT. Saya login dengan username-password:
> `admin@demo.test` / `Admin@123`.

**Aksi:** Isi form, klik Masuk → dashboard admin terbuka.

**Narasi:**

> Masuk ke dashboard admin. Sekarang saya buka DevTools, tab Network.

**Aksi:** F12 → Network tab → reload dashboard

**Narasi:**

> Lihat request ke `/api/auth/me`: ada header `Authorization: Bearer` dengan
> token JWT panjang. Saya pergi ke halaman demo untuk lihat isinya.

**Aksi:** Navigasi ke `/demo/authz`

**Narasi:**

> Di halaman Authorization Demo ini, di panel atas terlihat UID, email, role
> admin, dan linkedId sebagai atribut ABAC. Saya klik tombol pertama:
> **"Decode JWT access token"**.

**Aksi:** Klik "Panggil" pada scenario JWT

**Narasi:**

> Response 200, dan isi token terurai lengkap: header `alg: RS256`, `typ: JWT`,
> `kid` adalah key ID. Payload-nya punya `iss` dari
> `securetoken.google.com/alp-cybersecurity-b38b3`, `aud` project ID kita,
> `iat` issued-at, dan **`exp` expiration** — token berlaku terbatas, satu jam.
> Field `sign_in_provider: password` menandakan user login via email-password.
> Signature tervalidasi oleh firebase-admin dengan RS256.

**Aksi:** Scroll ke bawah → klik "Call /api/donors with NO token"

**Narasi:**

> Sekarang demonstrasi kebalikan — request tanpa Bearer token. Hasilnya **401
> Unauthorized** dengan alasan "Missing Authorization Bearer token". Ini
> membuktikan JWT wajib di setiap endpoint.

---

## Segmen 5 — Kriteria #2: OAuth 2.0 Google Login (06:45 → 08:00)

**Tampilkan:** Logout dari admin, kembali ke `/login`

**Narasi:**

> Kriteria #2 — Google OAuth 2.0. Saya klik **"Masuk dengan Google"**.

**Aksi:** Klik tombol Google → popup Google → pilih akun → consent

**Narasi:**

> Popup Google terbuka, saya pilih akun saya. Setelah consent, Firebase
> menukar kredensial Google jadi Firebase ID token — JWT yang sama formatnya
> dengan jalur email-password, tapi field `sign_in_provider` nanti jadi
> `google.com`.

**Aksi:** Redirect ke dashboard donor (atau refresh kalau perlu)

**Narasi:**

> Langsung masuk dashboard donor. Perhatikan: saya **tidak diminta isi form
> registrasi ulang** — tidak ada nama, email, password. Ini karena
> `signInWithGoogle` otomatis buat record donor, tiga pending screening, dan
> set linkedId. User baru langsung siap pakai.

**Aksi:** Navigasi ke `/demo/authz`, klik "Decode JWT access token"

**Narasi:**

> Buka demo lagi, klik Decode JWT. Lihat payload: `sign_in_provider: google.com`
> — beda dengan tadi yang `password`. Dan `email_verified: true` karena Google
> otomatis memverifikasi.

**Aksi:** Klik "List hospitals" untuk tunjukkan token bisa akses resource

**Narasi:**

> Token yang sama bisa dipakai akses API — misalnya List hospitals → 200 OK.
> Token Google OAuth **fungsional sama** dengan token email-password.

---

## Segmen 6 — Kriteria #3: RBAC (08:00 → 10:00)

**Tampilkan:** Logout → login sebagai `doctor1@demo.test` / `Doctor@123`

**Narasi:**

> Kriteria #3 — RBAC. Aplikasi ini punya **empat role**: admin, doctor,
> hospital_staff, donor. Saya login sebagai **doctor** dulu.

**Aksi:** Setelah login → `/demo/authz`, fokus ke panel atas

**Narasi:**

> Panel atas: role=doctor, linkedId=doctor-1. Sekarang saya klik **List all
> doctors** — endpoint yang sesuai RBAC **hanya admin dan hospital_staff**
> yang boleh.

**Aksi:** Klik "Panggil"

**Narasi:**

> **403 Forbidden** — alasannya "hanya admin dan hospital_staff yang dapat
> melihat daftar dokter". Doctor diblok oleh RBAC.

**Aksi:** Logout → login sebagai `donor1@demo.test` → buka /demo/authz → klik "List all doctors"

**Narasi:**

> Login sebagai donor, coba lagi — sama 403.

**Aksi:** Logout → login sebagai `admin@demo.test` → klik "List all doctors"

**Narasi:**

> Login admin — **200 OK**, dapat list dokter lengkap. Ini bukti RBAC:
> aturan jelas per role, ditegakkan di server.

**Aksi:** Pindah kursor ke tombol "Create hospital" masih sebagai admin

**Narasi:**

> Sekalian demo: Create hospital sebagai admin → 200 created.

**Aksi:** Logout → login sebagai staffA → buka /demo/authz → klik "Create hospital"

**Narasi:**

> Login hospital_staff, coba create hospital → **403**. Hanya admin yang
> boleh. RBAC bertingkat berfungsi dengan baik.

---

## Segmen 7 — Kriteria #4: ABAC (10:00 → 11:30)

**Tampilkan:** Masih login sebagai `staffA@demo.test` — panel `/demo/authz`

**Narasi:**

> Kriteria #4 — ABAC. staffA punya linkedId=hospital-A. Saya klik
> **"List donors I can see"**.

**Aksi:** Klik "Panggil"

**Narasi:**

> 200 OK, tapi data yang kembali **difilter**: hanya donor-1 yang muncul —
> karena `donor-1.assignedHospitalId` adalah hospital-A, cocok dengan linkedId.
> Field `matched: RBAC+ABAC` menandakan kedua cek lulus. Donor-2 yang
> assignedHospitalId-nya hospital-B **tidak kembali**.

**Aksi:** Logout → login sebagai `staffB@demo.test` → /demo/authz → klik "List donors I can see"

**Narasi:**

> Login staffB (linkedId=hospital-B), panggil endpoint yang sama. Sekarang
> **hanya donor-2** yang muncul. Atribut membalik hasil — **ini inti ABAC**:
> keputusan tidak cuma berdasarkan role, tapi juga atribut runtime.

**Aksi:** Logout → login sebagai `donor1@demo.test` → /demo/authz → klik "List donors I can see"

**Narasi:**

> Login donor, panggil endpoint yang sama. Hasilnya **hanya satu record —
> miliknya sendiri** karena `donor.userId` harus sama dengan `uid`-nya. Policy
> `matched: ABAC` karena cek murni atribut.

---

## Segmen 8 — Kriteria #5: Gabungan RBAC+ABAC (11:30 → 13:00)

**Tampilkan:** Logout → login sebagai `staffA@demo.test`

**Narasi:**

> Kriteria #5 — gabungan RBAC dan ABAC. Skenario: staffA (rumah sakit A) coba
> akses record donor-1 yang memang assigned ke hospital-A.

**Aksi:** Di /demo/authz, tambah test ad-hoc lewat URL: buka browser baru ke
`/api/donors/donor-1` sambil login, ATAU: saya scroll ke tombol terkait.
Kalau tidak ada tombol spesifik, saya buka DevTools Console:

```javascript
fetch('/api/donors/donor-1', {
  headers: { Authorization: 'Bearer ' + await firebase.auth().currentUser.getIdToken() }
}).then(r => r.json()).then(console.log)
```

Atau cara lebih simpel: buka direct URL `/api/donors/donor-1` di tab baru
(pakai Chrome extension untuk set header, atau pakai curl dari terminal —
pilih yang paling lancar).

**Alternatif paling rapi:** Saya buka **terminal**, jalankan curl:

```bash
TOKEN=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDisRVSjpN0nO7bf_ss8_yEW3kgsmMUF88" \
  -H "Content-Type: application/json" \
  -d '{"email":"staffA@demo.test","password":"Staff@123","returnSecureToken":true}' \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).idToken))')

curl -H "Authorization: Bearer $TOKEN" \
  https://alp-cybersecurity.vercel.app/api/donors/donor-1 | jq
```

**Narasi:**

> Saya minta token staffA, lalu GET `/api/donors/donor-1`. Response **200 OK**
> dengan `matched: RBAC+ABAC` — role cocok (hospital_staff), dan atribut
> `donor.assignedHospitalId == linkedId == hospital-A`. Kedua cek lulus.

**Aksi:** Ganti akun di curl ke staffB

```bash
TOKEN=$(curl -s -X POST ...staffB@demo.test...Staff@123... | ...)
curl -H "Authorization: Bearer $TOKEN" \
  https://alp-cybersecurity.vercel.app/api/donors/donor-1 | jq
```

**Narasi:**

> Sekarang staffB (hospital-B) coba akses donor-1 (yang ada di hospital-A) —
> **403 Forbidden**, dengan alasan lengkap: `hospital_staff hanya dapat
> melihat donor yang ditugaskan ke rumah sakitnya (linkedId=hospital-B,
> donor.assignedHospitalId=hospital-A)`. Role saja tidak cukup — atribut juga
> harus cocok. **Inilah penerapan gabungan RBAC+ABAC**: akses hanya diberikan
> ketika role=hospital_staff **DAN** rumah sakit sama.

**Aksi:** Tampilkan kembali policies.ts — scroll ke `canViewDonor`

**Narasi:**

> Logikanya di sini di `policies.ts`: untuk hospital_staff ada pengecekan
> ganda — pertama `ctx.role === 'hospital_staff'`, kedua
> `donor.assignedHospitalId === ctx.linkedId`. Kalau keduanya benar,
> allow dengan `matched: 'RBAC+ABAC'`. Kalau tidak, deny dengan alasan jelas.

---

## Segmen 9 — Kriteria #6: REST API + Web Sederhana (13:00 → 14:00)

**Tampilkan:** Struktur file API di VS Code/GitHub — `src/app/api/` tree

**Narasi:**

> Kriteria #6 — REST API dan antarmuka web sederhana. Ada **lima kelompok
> endpoint**: auth/me, donors (list + by-id), doctors, hospitals, dan
> medical-records. Semua dokumentasi endpoint + aturan aksesnya ada di README
> dan laporan.

**Aksi:** Tampilkan README di GitHub — scroll ke tabel access policy

**Narasi:**

> README memuat tabel endpoint, method, jenis cek, dan aturannya — sesuai
> rubrik "endpoint terdokumentasi".

**Aksi:** Tampilkan `/demo/authz` lagi

**Narasi:**

> Untuk antarmuka web, saya sediakan halaman `/demo/authz` sebagai playground
> interaktif — tombol Panggil untuk setiap skenario, warna hijau/merah,
> response body JSON ditampilkan langsung. Sederhana tapi cukup untuk
> membuktikan fitur utama berjalan.

**Aksi:** Tampilkan dashboard donor / admin singkat

**Narasi:**

> Selain itu ada dashboard per-role: admin, doctor, hospital, donor — yang
> memakai API yang sama di belakang. Semua berjalan di production di
> `alp-cybersecurity.vercel.app`.

---

## Segmen 10 — Closing & Rangkuman (14:00 → 14:45)

**Tampilkan:** Diagram arsitektur + tabel access policy side-by-side

**Narasi:**

> Rangkumannya: sepuluh kriteria rubrik sudah saya demonstrasikan satu per
> satu dengan bukti nyata di production — JWT dengan expirasi dan validasi
> benar, Google OAuth dengan token yang dapat akses resource, empat role
> dengan aturan jelas, filter ABAC berdasarkan linkedId dan assignedHospitalId,
> gabungan RBAC+ABAC di endpoint per-id, REST API lengkap dengan halaman demo,
> access policy list terdokumentasi, diagram arsitektur, README lengkap di
> GitHub, dan video ini yang panjangnya di bawah 15 menit.

**Tampilkan:** URL GitHub + URL live di layar

**Narasi:**

> Repo: `github.com/ervandyr2512/alp-cybersecurity`.
> Live: `alp-cybersecurity.vercel.app`.
>
> Terima kasih atas perhatiannya.

---

## Checklist saat merekam (cetak atau pasang di monitor kedua)

**Sebelum rekam:**
- [ ] Logout semua akun
- [ ] Tutup tab yang tidak perlu
- [ ] Tes mikrofon 5 detik
- [ ] Browser zoom 110% supaya tulisan terbaca jelas
- [ ] Timer/stopwatch aktif

**Selama rekam — tips tempo:**
- Segmen 1–3 total ~5 menit — **jangan terburu-buru**, ini fondasi nilai #7, #8, #9
- Segmen 4–5 total ~3 menit — ini kriteria #1 dan #2, masing-masing 10%
- Segmen 6–8 total ~5 menit — RBAC, ABAC, Combined (30% total)
- Segmen 9–10 total ~1:45 — penutup

**Jika melampaui 14:30:**
- Potong segmen 2 (policy/diagram) jadi 1 menit saja — singkat point-nya
- Potong segmen 9 (REST API) jadi 30 detik
- Jangan potong segmen 4–8, itu kriteria utama

**Hindari:**
- Mengatakan "Claude" atau menyebut tool AI apapun
- Menunjukkan file serviceAccountKey.json (leak credential)
- Menunjukkan Firebase Console (bisa expose credential lain)
- Scroll terlalu cepat — evaluator harus sempat baca

**Upload ke YouTube:**
- Judul: **"ALP Sistem Otorisasi — Ervandy Rangganata 0706012414015"**
- Visibility: Unlisted (cukup dengan link, tidak perlu public)
- Deskripsi: copy-paste ringkasan 10 kriteria + link GitHub + link live
- Setelah upload, copy URL ke bagian "Link video demo" di laporan DOCX
