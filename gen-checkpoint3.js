const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat, ExternalHyperlink,
} = require('docx');
const fs = require('fs');

const NAVY  = "1F3864";
const BLUE  = "2E75B6";
const TEAL  = "1F6B75";
const WHITE = "FFFFFF";
const LGRAY = "F2F2F2";
const MGRAY = "CCCCCC";
const GREEN = "375623";
const LGRN  = "E2EFDA";
const CW    = 9026; // A4 content width (DXA, 1" margins)

// ── border helpers ────────────────────────────────────────────
const bdr  = (c = MGRAY) => ({ style: BorderStyle.SINGLE, size: 1, color: c });
const bdrs = (c = MGRAY) => ({ top: bdr(c), bottom: bdr(c), left: bdr(c), right: bdr(c) });
const noBdr = () => ({ style: BorderStyle.NONE, size: 0, color: WHITE });
const noBdrs = () => ({ top: noBdr(), bottom: noBdr(), left: noBdr(), right: noBdr() });

// ── spacing helpers ───────────────────────────────────────────
const sp  = (b=0,a=0) => ({ spacing: { before: b, after: a } });
const gap = (n=120)   => new Paragraph({ children:[new TextRun("")], spacing:{before:0,after:n} });

// ── text helpers ──────────────────────────────────────────────
const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, bold:true, size:32, color:NAVY, font:"Arial" })],
  spacing: { before:400, after:160 },
  border: { bottom:{ style:BorderStyle.SINGLE, size:8, color:BLUE, space:4 } },
});
const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, bold:true, size:26, color:BLUE, font:"Arial" })],
  spacing: { before:280, after:120 },
});
const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, bold:true, size:24, color:TEAL, font:"Arial" })],
  spacing: { before:200, after:80 },
});
const body = (text, opts={}) => new Paragraph({
  children: [new TextRun({ text, size:22, font:"Arial", color:"222222", ...opts })],
  spacing: { before:60, after:80 },
});
const bul = (text) => new Paragraph({
  numbering: { reference:"bullets", level:0 },
  children: [new TextRun({ text, size:22, font:"Arial" })],
  spacing: { before:40, after:40 },
});

// ── code block ────────────────────────────────────────────────
function codeBlock(src) {
  const lines = src.split('\n');
  return [
    new Table({
      width: { size:CW, type:WidthType.DXA },
      columnWidths: [CW],
      rows: [new TableRow({ children: [new TableCell({
        borders: { top:bdr(BLUE), bottom:bdr(BLUE), left:bdr(BLUE), right:bdr(BLUE) },
        shading: { fill:"F0F0F0", type:ShadingType.CLEAR },
        margins: { top:120, bottom:120, left:200, right:200 },
        width: { size:CW, type:WidthType.DXA },
        children: lines.map(l => new Paragraph({
          children: [new TextRun({ text: l||" ", font:"Courier New", size:17, color:"1E1E1E" })],
          spacing: { before:0, after:0 },
        })),
      })] })],
    }),
    gap(100),
  ];
}

// ── generic table builder ─────────────────────────────────────
function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a,b)=>a+b,0);
  const hRow = new TableRow({
    tableHeader: true,
    children: headers.map((h,i) => new TableCell({
      borders: bdrs(WHITE),
      shading: { fill:NAVY, type:ShadingType.CLEAR },
      width: { size:colWidths[i], type:WidthType.DXA },
      margins: { top:100, bottom:100, left:120, right:120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text:h, bold:true, color:WHITE, size:20, font:"Arial" })],
      })],
    })),
  });
  const dRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders: bdrs(MGRAY),
      shading: { fill: ri%2===0 ? LGRAY : WHITE, type:ShadingType.CLEAR },
      width: { size:colWidths[ci], type:WidthType.DXA },
      margins: { top:80, bottom:80, left:120, right:120 },
      children: [new Paragraph({
        children: [new TextRun({ text:String(cell||""), size:19, font:"Arial" })],
      })],
    })),
  }));
  return [
    new Table({ width:{ size:total, type:WidthType.DXA }, columnWidths:colWidths, rows:[hRow,...dRows] }),
    gap(160),
  ];
}

// ── status table (with colour coding) ────────────────────────
function statusTable() {
  const data = [
    ["Infrastruktur & Firebase Config", "100% Selesai", "Lazy init, env vars, Admin SDK",          LGRN, GREEN],
    ["Autentikasi Multi-Role",          "100% Selesai", "Login bypass verifikasi untuk staff",      LGRN, GREEN],
    ["Halaman Publik (6 halaman)",       "100% Selesai", "Home, RS, Dokter, Info, Tentang, Kontak", LGRN, GREEN],
    ["REST API Routes",                 "100% Selesai", "8 endpoint, async params Next.js 16",      LGRN, GREEN],
    ["Dashboard Admin",                 "100% Selesai", "CRUD donor, dokter, rumah sakit",          LGRN, GREEN],
    ["Dashboard Dokter",                "100% Selesai", "Skrining + viewer hasil lab pasien",       LGRN, GREEN],
    ["Dashboard Rumah Sakit",           "100% Selesai", "Input rekam medis 2-step flow",            LGRN, GREEN],
    ["Dashboard Donor",                 "100% Selesai", "Profil, status, rekam medis",              LGRN, GREEN],
    ["Komponen UI",                     "100% Selesai", "10 komponen reusable",                     LGRN, GREEN],
    ["Firebase Data Seeding",           "100% Selesai", "5 RS, 4 akun dummy, auto-screening",       LGRN, GREEN],
    ["Deployment Vercel",               "90% Selesai",  "Deployed, env vars manual",               "FFF2CC","7F6000"],
    ["Testing & QA",                    "70% Selesai",  "Manual testing semua alur",               "FFF2CC","7F6000"],
    ["Dokumentasi",                     "95% Selesai",  "Laporan, proposal, README",               LGRN, GREEN],
  ];
  const W = [3200, 1600, 4226];
  const hRow = new TableRow({
    tableHeader: true,
    children: ["Modul","Status","Keterangan"].map((h,i) => new TableCell({
      borders: bdrs(WHITE), shading:{ fill:NAVY, type:ShadingType.CLEAR },
      width:{ size:W[i], type:WidthType.DXA },
      margins:{ top:100, bottom:100, left:120, right:120 },
      children:[new Paragraph({ alignment:AlignmentType.CENTER, children:[new TextRun({ text:h, bold:true, color:WHITE, size:20, font:"Arial" })] })],
    })),
  });
  const dRows = data.map(([modul,status,ket,bg,fg]) => new TableRow({
    children: [
      [modul,   W[0]],
      [status,  W[1]],
      [ket,     W[2]],
    ].map(([txt,w], ci) => new TableCell({
      borders: bdrs(MGRAY),
      shading: { fill: ci===1 ? bg : ci===0 ? LGRAY : WHITE, type:ShadingType.CLEAR },
      width: { size:w, type:WidthType.DXA },
      margins: { top:80, bottom:80, left:120, right:120 },
      children:[new Paragraph({ children:[new TextRun({ text:String(txt), size:19, font:"Arial", color: ci===1 ? fg : "222222" })] })],
    })),
  }));
  return [
    new Table({ width:{ size:CW, type:WidthType.DXA }, columnWidths:W, rows:[hRow,...dRows] }),
    gap(160),
  ];
}

// ── subheading for code sections ──────────────────────────────
const fileTag = (path) => new Paragraph({
  children:[
    new TextRun({ text:"File: ", bold:true, size:20, font:"Courier New" }),
    new TextRun({ text:path, size:20, font:"Courier New", color:TEAL }),
  ],
  spacing:{ before:60, after:60 },
});

// ─────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config:[
      { reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"\u2022",
          alignment:AlignmentType.LEFT,
          style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] },
      { reference:"nums", levels:[{ level:0, format:LevelFormat.DECIMAL, text:"%1.",
          alignment:AlignmentType.LEFT,
          style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] },
    ],
  },
  styles:{
    default:{ document:{ run:{ font:"Arial", size:22 } } },
    paragraphStyles:[
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:32, bold:true, font:"Arial", color:NAVY },
        paragraph:{ spacing:{ before:400, after:160 }, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:26, bold:true, font:"Arial", color:BLUE },
        paragraph:{ spacing:{ before:280, after:120 }, outlineLevel:1 } },
      { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:24, bold:true, font:"Arial", color:TEAL },
        paragraph:{ spacing:{ before:200, after:80 }, outlineLevel:2 } },
    ],
  },
  sections:[
    // ══════════════════════════════════════
    // COVER PAGE
    // ══════════════════════════════════════
    {
      properties:{
        page:{ size:{ width:11906, height:16838 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } },
      },
      children:[
        gap(2000),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{ before:0, after:240 },
          children:[new TextRun({ text:"LAPORAN KEMAJUAN PENGERJAAN WEBSITE", bold:true, size:44, color:NAVY, font:"Arial" })] }),
        new Paragraph({ alignment:AlignmentType.CENTER,
          border:{ bottom:{ style:BorderStyle.SINGLE, size:12, color:BLUE, space:4 } },
          spacing:{ before:0, after:400 },
          children:[new TextRun({ text:"KidneyHub.id \u2013 Sistem Registry Donor Ginjal Nasional Indonesia", size:28, color:BLUE, font:"Arial" })] }),
        gap(240),
        ...[
          ["Mata Kuliah",  "Modul 4 \u2013 ALP (Assignment Learning Project)"],
          ["Checkpoint",   "3 (Target: 95% Penyelesaian)"],
          ["Tanggal",      "17 April 2026"],
          ["Capaian",      "95% \u2014 Hampir Selesai"],
          ["GitHub",       "https://github.com/ervandyr2512/kidneyhub"],
        ].map(([lbl,val]) => new Paragraph({
          alignment:AlignmentType.CENTER, spacing:{ before:80, after:80 },
          children:[
            new TextRun({ text:`${lbl}: `, bold:true, size:24, font:"Arial", color:NAVY }),
            new TextRun({ text:val, size:24, font:"Arial", color:"333333" }),
          ],
        })),
        gap(2000),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{ before:0, after:80 },
          children:[new TextRun({ text:"Ervandyr Rangganata", bold:true, size:26, font:"Arial", color:NAVY })] }),
        new Paragraph({ alignment:AlignmentType.CENTER,
          children:[new TextRun({ text:"2026", size:22, font:"Arial", color:"555555" })] }),
      ],
    },

    // ══════════════════════════════════════
    // MAIN CONTENT
    // ══════════════════════════════════════
    {
      properties:{
        page:{ size:{ width:11906, height:16838 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } },
      },
      headers:{
        default: new Header({ children:[new Paragraph({
          children:[new TextRun({ text:"KidneyHub.id \u2014 Laporan Checkpoint 3", size:18, color:"888888", font:"Arial" })],
          border:{ bottom:{ style:BorderStyle.SINGLE, size:4, color:MGRAY, space:2 } },
        })] }),
      },
      footers:{
        default: new Footer({ children:[new Paragraph({
          alignment:AlignmentType.CENTER,
          border:{ top:{ style:BorderStyle.SINGLE, size:4, color:MGRAY, space:2 } },
          children:[
            new TextRun({ text:"Halaman ", size:18, color:"888888", font:"Arial" }),
            new TextRun({ children:[PageNumber.CURRENT], size:18, color:"888888", font:"Arial" }),
            new TextRun({ text:" dari ", size:18, color:"888888", font:"Arial" }),
            new TextRun({ children:[PageNumber.TOTAL_PAGES], size:18, color:"888888", font:"Arial" }),
          ],
        })] }),
      },
      children:[

        // ── 1. RINGKASAN EKSEKUTIF ─────────────────────────
        h1("1. Ringkasan Eksekutif"),
        body("Pada Checkpoint 3, platform KidneyHub.id telah mencapai 95% penyelesaian. Seluruh fitur inti telah berfungsi penuh secara end-to-end: registrasi donor, autentikasi multi-role, skrining dokter, input rekam medis laboratorium oleh rumah sakit, serta tampilan data lintas dashboard. Total 49 file TypeScript/TSX telah dibuat dengan lebih dari 5.100 baris kode."),
        gap(80),
        h2("1.1 Progress sejak Checkpoint 2"),
        bul("7 bug kritis diperbaiki: autentikasi email, filter data kosong, undefined payload ke Firebase"),
        bul("3 fitur baru: viewer hasil lab di dashboard dokter, seeding 5 rumah sakit, auto-create 3 screening saat registrasi"),
        bul("Seluruh alur kerja donor \u2192 dokter \u2192 rumah sakit kini berfungsi penuh end-to-end"),
        gap(120),
        h2("1.2 Status Penyelesaian Per Modul"),
        ...statusTable(),

        // ── 2. FITUR BARU & BUG FIXES ──────────────────────
        h1("2. Fitur Baru dan Bug Fixes sejak Checkpoint 2"),

        // 2.1
        h2("2.1  Fix Autentikasi: Bypass Verifikasi Email untuk Akun Staff"),
        fileTag("src/app/(auth)/login/page.tsx"),
        body("Akun dokter dan hospital_staff yang dibuat oleh admin tidak perlu melewati alur verifikasi email Firebase. Sebelumnya semua akun staf terblokir karena pengecekan fbUser.emailVerified yang selalu false untuk akun yang dibuat via REST API."),
        ...codeBlock(
`const fbUser = await signIn(email, password);
const profile = await getUserProfile(fbUser.uid);

// Verifikasi email hanya wajib untuk donor yang self-register.
// Akun doctor / hospital_staff dibuat admin — tidak perlu verifikasi.
const isStaff = profile?.role === 'doctor'
  || profile?.role === 'hospital_staff'
  || profile?.role === 'admin';

if (!fbUser.emailVerified && !isStaff) {
  toast.error('Email belum diverifikasi. Cek kotak masuk Anda.');
  setLoading(false);
  return;
}
toast.success(\`Selamat datang, \${profile?.name ?? email}!\`);
router.push(dashboardPath[profile?.role ?? 'donor']);`
        ),

        // 2.2
        h2("2.2  Fix Firebase: stripUndefined() sebelum Write ke Realtime DB"),
        fileTag("src/lib/firebase/database.ts"),
        body("Firebase Realtime Database menolak nilai undefined dalam payload. LabResultsForm menghasilkan banyak field undefined dari field opsional yang tidak diisi (via parseFloat('')). Fungsi stripUndefined() diterapkan rekursif sebelum setiap operasi set() dan update()."),
        ...codeBlock(
`function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj))
    return obj.map(stripUndefined) as unknown as T;
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    ) as T;
  }
  return obj;
}

export async function createRecord<T extends object>(
  path: string, data: T
): Promise<string> {
  const newRef = push(ref(db, path));
  await set(newRef, stripUndefined({
    ...data, createdAt: new Date().toISOString()
  }));
  return newRef.key!;
}

export async function updateRecord<T extends object>(
  path: string, id: string, data: Partial<T>
): Promise<void> {
  await update(ref(db, \`\${path}/\${id}\`),
    stripUndefined({ ...data, updatedAt: new Date().toISOString() })
  );
}`
        ),

        // 2.3
        h2("2.3  Auto-Create Screening saat Donor Mendaftar"),
        fileTag("src/app/(auth)/register/page.tsx"),
        body("Saat donor menyelesaikan pendaftaran, sistem otomatis membuat 3 record screening (satu per spesialisasi dokter) dan mengubah status donor dari 'pending' menjadi 'screening'. Data langsung muncul di dashboard dokter tanpa intervensi admin."),
        ...codeBlock(
`// Auto-create 3 pending screenings (satu per spesialisasi dokter)
const specializations = [
  { type: 'SpPD-KGH', label: 'Spesialis Penyakit Dalam - KGH' },
  { type: 'Urologist', label: 'Urolog' },
  { type: 'Forensic',  label: 'Dokter Forensik' },
] as const;

await Promise.all(
  specializations.map((sp) =>
    screeningDb.create({
      donorId, donorName: form.name,
      doctorId: '', doctorName: \`Menunggu dokter \${sp.label}\`,
      doctorType: sp.type,
      status: 'pending', result: 'pending',
      notes: '', scheduledAt: '',
    })
  )
);

// Update status donor ke 'screening'
await donorDb.update(donorId, { status: 'screening' });
await update(ref(db, \`\${DB_PATHS.USERS}/\${fbUser.uid}\`),
  { linkedId: donorId }
);`
        ),

        // 2.4
        h2("2.4  Viewer Hasil Lab di Dashboard Dokter"),
        fileTag("src/app/dashboard/doctor/screenings/page.tsx"),
        body("Dokter dapat melihat hasil pemeriksaan laboratorium lengkap dari pasien. Tombol 'Hasil Lab' (teal) muncul hanya jika donor sudah memiliki rekam medis dari rumah sakit. Modal menampilkan 7 seksi: fisik, DPL, ginjal, elektrolit, imunologi, penyakit menular, genomik."),
        ...codeBlock(
`// Load medical records bersamaan dengan data lain
const [allScreenings, allDonors, allRecords] = await Promise.all([
  screeningDb.getAll(),
  donorDb.getAll(),
  medicalRecordDb.getAll(),   // <-- baru
]);

// Tombol hanya muncul jika ada rekam medis untuk donor ini
const hasLab = records.some((r) => r.donorId === s.donorId);
{hasLab && (
  <Button size="sm" variant="outline"
    onClick={() => setLabDonorId(s.donorId)}
    className="text-teal-600 border-teal-200 hover:bg-teal-50">
    <FlaskConical size={13} className="mr-1" />
    Hasil Lab
  </Button>
)}

// LabSection — hanya tampilkan field yang terisi
function LabSection({ title, rows }) {
  const filled = rows.filter(([, v]) => v !== '—');
  if (filled.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase">{title}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
        {filled.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`
        ),

        // 2.5
        h2("2.5  Fix Input Rekam Medis Rumah Sakit \u2014 2-Step Flow"),
        fileTag("src/app/dashboard/hospital/records/page.tsx"),
        body("Dua bug diperbaiki: (1) koleksi hospitals kosong di Firebase membuat currentHospital = undefined sehingga LabResultsForm tidak pernah render, (2) tombol 'Lanjut' memiliki onClick kosong. Diganti dengan alur 2 langkah yang jelas."),
        ...codeBlock(
`// Step 1: Modal pilih donor + rumah sakit
<Modal open={showDonorPicker} title="Pilih Donor & Rumah Sakit">
  <Select label="Pilih Donor" value={selectedDonorId}
    onChange={(e) => setSelectedDonorId(e.target.value)}
    options={donors.map((d) => ({
      value: d.id,
      label: \`\${d.name} (\${d.bloodType}\${d.rhesus}) — \${d.city}\`
    }))} />
  <Select label="Pilih Rumah Sakit" value={selectedHospitalId}
    onChange={(e) => setSelectedHospitalId(e.target.value)}
    options={hospitals.filter(h => h.isActive).map(h => ({
      value: h.id, label: h.name
    }))} />
  <Button onClick={() => {
    setShowDonorPicker(false);
    setShowAdd(true);       // <-- buka form
  }}>Lanjut</Button>
</Modal>

// Step 2: LabResultsForm hanya render jika donor dipilih
{showAdd && selectedDonorId && selectedDonor && (
  <Modal open title="Input Rekam Medis Baru" size="xl">
    <LabResultsForm
      donorId={selectedDonorId}
      donorName={selectedDonor.name}
      hospitalId={currentHospital?.id ?? 'unknown'}
      hospitalName={currentHospital?.name ?? 'Rumah Sakit'}
      onSubmit={handleCreate}
      onCancel={() => { setShowAdd(false); setSelectedDonorId(''); }}
      loading={formLoading} />
  </Modal>
)}`
        ),

        // 2.6
        h2("2.6  Fix Dashboard Dokter \u2014 Tampilkan Semua Skrining"),
        fileTag("src/app/dashboard/doctor/page.tsx"),
        body("Overview dokter memfilter skrining berdasarkan doctorId. Karena semua skrining dibuat dengan doctorId kosong (belum ditugaskan), hasilnya selalu 0. Filter dihapus."),
        ...codeBlock(
`// Sebelum — filter bermasalah (selalu 0):
setScreenings(all.filter((s) =>
  s.doctorId === userProfile?.linkedId ||
  s.doctorName?.includes(userProfile?.name ?? '')
));

// Sesudah — tampilkan semua skrining:
useEffect(() => {
  const load = async () => {
    const all = await screeningDb.getAll();
    setScreenings(all);
    setLoading(false);
  };
  load();
}, [userProfile]);`
        ),

        // 2.7
        h2("2.7  Fix Filter Donor Dashboard Rumah Sakit"),
        fileTag("src/app/dashboard/hospital/donors/page.tsx"),
        body("Donor baru selalu berstatus 'pending' atau 'screening' sehingga tidak muncul di dashboard RS. Filter diubah untuk menampilkan semua donor kecuali yang ditolak."),
        ...codeBlock(
`// Sebelum — terlalu ketat:
setDonors(all.filter((d) =>
  d.status === 'assigned' || d.status === 'eligible'
));

// Sesudah — semua kecuali rejected:
donorDb.getAll().then((all) => {
  setDonors(all.filter((d) => d.status !== 'rejected'));
  setLoading(false);
});`
        ),

        // ── 3. RINGKASAN SEMUA FITUR ────────────────────────
        h1("3. Ringkasan Semua Fitur yang Telah Selesai"),
        ...makeTable(
          ["No","Modul / File","Deskripsi Singkat"],
          [
            ["1","src/types/index.ts","12 interface, 7 union types, DB_PATHS constants"],
            ["2","src/lib/firebase/config.ts","Lazy init, hanya aktif jika API key tersedia"],
            ["3","src/lib/firebase/auth.ts","register, signIn, signOut, getUserProfile, onAuthChange"],
            ["4","src/lib/firebase/database.ts","Generic CRUD + stripUndefined() + 6 entity wrappers"],
            ["5","src/lib/firebase/admin.ts","Server-side token verification (Admin SDK)"],
            ["6","src/contexts/AuthContext.tsx","Global state: firebaseUser, userProfile, loading"],
            ["7","src/app/(auth)/login/page.tsx","Multi-role login, bypass verifikasi untuk staff"],
            ["8","src/app/(auth)/register/page.tsx","2-step form, auto-create 3 screening, update status"],
            ["9","src/app/dashboard/layout.tsx","Protected layout, role-based sidebar, mobile menu"],
            ["10","src/app/dashboard/admin/page.tsx","StatsCards real-time: donor, dokter, RS, skrining"],
            ["11","src/app/dashboard/admin/donors/page.tsx","CRUD: tabel, search, modal view/edit/delete"],
            ["12","src/app/dashboard/admin/doctors/page.tsx","CRUD card-based untuk data dokter"],
            ["13","src/app/dashboard/admin/hospitals/page.tsx","CRUD card-based untuk data rumah sakit"],
            ["14","src/app/dashboard/doctor/page.tsx","StatsCards semua skrining tanpa filter"],
            ["15","src/app/dashboard/doctor/screenings/page.tsx","Input hasil skrining + viewer hasil lab pasien"],
            ["16","src/app/dashboard/hospital/page.tsx","Ringkasan donor dan rekam medis"],
            ["17","src/app/dashboard/hospital/donors/page.tsx","Daftar semua donor aktif (kecuali rejected)"],
            ["18","src/app/dashboard/hospital/records/page.tsx","Input rekam medis 2-step, edit, view detail"],
            ["19","src/app/dashboard/donor/page.tsx","Status pendaftaran, ringkasan skrining donor"],
            ["20","src/app/dashboard/donor/profile/page.tsx","Tampil dan edit profil donor"],
            ["21","src/app/dashboard/donor/records/page.tsx","Lihat rekam medis milik donor"],
            ["22","src/components/forms/LabResultsForm.tsx","8 seksi lab, BMI auto-calc, optional fields"],
            ["23","src/components/forms/DonorForm.tsx","Form CRUD data donor"],
            ["24","src/components/forms/DoctorForm.tsx","Form CRUD data dokter"],
            ["25","src/components/forms/HospitalForm.tsx","Form CRUD data rumah sakit"],
            ["26","src/components/layout/Navbar.tsx","Navigasi publik responsif"],
            ["27","src/components/layout/Footer.tsx","Footer publik"],
            ["28","src/components/ui/ (6 file)","Button, Card, Modal, Input, Badge, StatsCard"],
            ["29","src/app/(public)/ (6 halaman)","Home, RS, Dokter, Info, Tentang, Kontak"],
            ["30","src/app/api/ (5 file)","8 endpoint REST: donors, doctors, hospitals, records"],
            ["31","database.rules.json","Auth-gated read/write per koleksi Firebase"],
            ["32","vercel.json","Deploy config, region sin1 (Singapura)"],
          ],
          [500, 3800, 4726]
        ),

        // ── 4. ALUR END-TO-END ─────────────────────────────
        h1("4. Alur Kerja End-to-End (Sudah Berfungsi Penuh)"),

        h2("Langkah 1 \u2014 Donor Mendaftar"),
        body("Donor mengisi form 2-step (akun + data diri). Sistem otomatis:"),
        bul("Membuat Firebase Auth user dan mengirim email verifikasi"),
        bul("Menyimpan profil user di Realtime DB (role: donor)"),
        bul("Membuat record donor dengan status 'pending'"),
        bul("Membuat 3 record screening (SpPD-KGH, Urologist, Forensic) — status 'pending'"),
        bul("Mengubah status donor menjadi 'screening'"),
        bul("Menghubungkan donorId ke user profile (linkedId)"),
        gap(80),

        h2("Langkah 2 \u2014 Dokter Mengevaluasi"),
        body("Dokter login tanpa perlu verifikasi email, membuka halaman Skrining:"),
        bul("Melihat semua donor dalam antrian skrining"),
        bul("Menjadwalkan konsultasi (datetime-local)"),
        bul("Memberikan hasil evaluasi: eligible / ineligible"),
        bul("Menulis catatan klinis"),
        bul("Sistem auto-update status donor menjadi 'eligible' atau 'rejected'"),
        bul("Jika RS sudah input lab, klik 'Hasil Lab' untuk melihat semua data laboratorium"),
        gap(80),

        h2("Langkah 3 \u2014 Rumah Sakit Input Lab"),
        body("Staff RS login, membuka halaman Rekam Medis:"),
        bul("Memilih donor dan rumah sakit dari dropdown (Step 1)"),
        bul("Mengisi form 8 seksi: fisik, DPL/CBC, ginjal, elektrolit, imunologi, penyakit menular, genomik, kesimpulan (Step 2)"),
        bul("BMI dikalkulasi otomatis dari TB dan BB"),
        bul("Field opsional tidak wajib diisi, undefined di-strip sebelum disimpan ke Firebase"),
        bul("Status donor berubah menjadi 'assigned' setelah rekam medis tersimpan"),
        gap(80),

        h2("Langkah 4 \u2014 Admin Memantau"),
        bul("Melihat statistik real-time via StatsCards"),
        bul("Mengelola data master: CRUD donor, dokter, rumah sakit"),
        bul("Search donor berdasarkan nama, email, kota"),
        gap(160),

        // ── 5. STATISTIK ──────────────────────────────────
        h1("5. Statistik Pengerjaan"),
        ...makeTable(
          ["Metrik","Nilai"],
          [
            ["Total file TypeScript/TSX","49 file"],
            ["Total baris kode","> 5.100 baris"],
            ["Halaman publik","6 halaman"],
            ["Halaman dashboard","13 halaman"],
            ["REST API endpoints","8 endpoint"],
            ["Komponen UI reusable","10 komponen"],
            ["Form komponen","4 form"],
            ["Firebase collections","7 collections"],
            ["TypeScript interfaces","12 interface"],
            ["Dummy accounts (seeded)","4 akun (2 dokter, 2 RS)"],
            ["Bug fixes sejak CP2","7 perbaikan"],
            ["Fitur baru sejak CP2","3 fitur"],
          ],
          [5000, 4026]
        ),

        // ── 6. TEKNOLOGI & DEPLOYMENT ─────────────────────
        h1("6. Teknologi dan Deployment"),
        ...makeTable(
          ["Teknologi","Versi","Fungsi"],
          [
            ["Next.js","16 App Router","Framework utama, SSR + CSR hybrid"],
            ["TypeScript","5.x","Type safety seluruh codebase"],
            ["Tailwind CSS","4.x","Utility-first styling"],
            ["Firebase Auth","11.x","Autentikasi email + verifikasi link"],
            ["Firebase Realtime DB","11.x","Database NoSQL, region asia-southeast1"],
            ["Firebase Admin SDK","13.x","Server-side token verification"],
            ["Vercel","Free tier","Hosting, Singapore region (sin1)"],
            ["React Context API","18.x","Global state management"],
          ],
          [2500, 1800, 4726]
        ),
        h2("Info Deployment"),
        bul("GitHub: https://github.com/ervandyr2512/kidneyhub (branch: main)"),
        bul("Firebase Project: kidneyhub-id (asia-southeast1)"),
        bul("Hosting: Vercel (sin1 / Singapore)"),
        bul("Database: Firebase Realtime Database"),
        gap(120),

        // ── 7. AKUN DUMMY ─────────────────────────────────
        h1("7. Akun Dummy untuk Pengujian"),
        ...makeTable(
          ["Role","Email","Password","Keterangan"],
          [
            ["Admin","(via Firebase Console)","-","Kelola via console"],
            ["Dokter","dr.ahmad@kidneyhub.id","Doctor@123","dr. Ahmad Fauzi SpPD-KGH"],
            ["Dokter","dr.siti@kidneyhub.id","Doctor@123","dr. Siti Rahayu Sp.U"],
            ["RS Staff","rscm@kidneyhub.id","Hospital@123","Staff RSCM Jakarta"],
            ["RS Staff","siloam@kidneyhub.id","Hospital@123","Staff Siloam ASRI"],
            ["Donor","Daftar via /register","-","Self-register, verifikasi email"],
          ],
          [1400, 2800, 1600, 3226]
        ),

        // ── 8. SISA PENGERJAAN ────────────────────────────
        h1("8. Sisa Pengerjaan (5%)"),
        bul("Implementasi unit test menggunakan Jest + React Testing Library"),
        bul("Fitur admin menugaskan screening ke dokter spesifik (saat ini doctorId masih kosong)"),
        bul("Optimasi performa: lazy loading gambar, caching Firebase queries"),
        bul("Halaman 404 custom dan error boundary global"),
        gap(300),

        // ── Penutup ───────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border:{ top:{ style:BorderStyle.SINGLE, size:4, color:MGRAY, space:8 } },
          spacing:{ before:200, after:0 },
          children:[new TextRun({ text:"Ervandyr Rangganata  \u2014  17 April 2026  \u2014  Checkpoint 3: 95% Selesai", size:20, font:"Arial", color:"555555", italics:true })],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync('/Users/ervandyrangganata/Downloads/kidneyhub/laporan-checkpoint3.docx', buf);
  console.log('laporan-checkpoint3.docx berhasil dibuat');
});
