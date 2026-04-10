import { BookOpen, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Informasi' };

const faqs = [
  {
    q: 'Apakah seseorang bisa hidup normal dengan satu ginjal?',
    a: 'Ya. Tubuh manusia dirancang dengan kapasitas berlebih. Satu ginjal yang sehat mampu menjalankan 70–75% fungsi dua ginjal normal. Jutaan orang di dunia hidup sehat dan aktif dengan satu ginjal.',
  },
  {
    q: 'Apa syarat menjadi donor ginjal hidup?',
    a: 'Usia 18–65 tahun, sehat jasmani dan rohani, tidak memiliki penyakit ginjal, diabetes, hipertensi tidak terkontrol, HIV, Hepatitis B/C aktif, atau kanker. Donasi dilakukan atas dasar sukarela tanpa paksaan.',
  },
  {
    q: 'Apakah donor mendapat kompensasi finansial?',
    a: 'Tidak. Sesuai regulasi Indonesia (UU No. 36/2009), jual-beli organ dilarang. KidneyHub.id memfasilitasi donasi sukarela. Biaya pemeriksaan dan operasi ditanggung sesuai ketentuan rumah sakit dan asuransi.',
  },
  {
    q: 'Berapa lama proses evaluasi donor?',
    a: 'Proses evaluasi berlangsung 1–3 bulan, mencakup konsultasi multi-dokter, pemeriksaan laboratorium komprehensif (termasuk HLA typing), dan evaluasi psikologis.',
  },
  {
    q: 'Apa itu HLA Typing?',
    a: 'Human Leukocyte Antigen (HLA) typing adalah pemeriksaan genetik untuk menentukan kesesuaian jaringan antara donor dan penerima. Kecocokan HLA yang baik mengurangi risiko penolakan organ secara signifikan.',
  },
  {
    q: 'Apa perbedaan DCD dan DBD?',
    a: 'DCD (Donation after Cardiac Death) adalah donor setelah jantung berhenti berdetak, sedangkan DBD (Donation after Brain Death) adalah donor setelah otak dinyatakan mati secara klinis sementara jantung masih berdetak dengan bantuan mesin.',
  },
];

const conditions = [
  { label: 'Tidak ada penyakit ginjal', ok: true },
  { label: 'Tidak ada diabetes mellitus', ok: true },
  { label: 'Tekanan darah normal', ok: true },
  { label: 'HIV negatif', ok: true },
  { label: 'Hepatitis B dan C negatif', ok: true },
  { label: 'Tidak ada riwayat kanker', ok: true },
  { label: 'Usia 18–65 tahun', ok: true },
  { label: 'Sehat jasmani dan rohani', ok: true },
];

export default function InformasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Informasi Transplantasi Ginjal</h1>
        <p className="text-gray-500">
          Panduan lengkap tentang donasi ginjal, proses evaluasi, dan pertanyaan umum.
        </p>
      </div>

      {/* What is kidney donation */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Apa Itu Donor Ginjal?</h2>
        </div>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
          <p>
            Donor ginjal adalah tindakan memberikan satu ginjal kepada orang yang mengalami gagal ginjal stadium akhir (end-stage renal disease/ESRD).
            Di Indonesia, lebih dari <strong>2.200 pasien</strong> saat ini menunggu transplantasi ginjal.
          </p>
          <p>
            Ada dua jenis donor: <strong>living donor</strong> (donor hidup yang menyumbangkan satu ginjal)
            dan <strong>deceased donor</strong> (donor yang telah meninggal, baik DCD maupun DBD).
          </p>
          <p>
            KidneyHub.id berfokus pada pengelolaan registri donor secara transparan, memastikan proses yang aman,
            etis, dan sesuai regulasi kesehatan Indonesia.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <CheckCircle2 className="h-6 w-6 text-teal-600" />
          <h2 className="text-xl font-bold text-gray-900">Kriteria Eligibilitas Donor</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {conditions.map((c) => (
            <div key={c.label} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{c.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          * Eligibilitas final ditentukan oleh tim dokter setelah pemeriksaan komprehensif.
        </p>
      </section>

      {/* Medical exams */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <AlertCircle className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Pemeriksaan Medis yang Dilakukan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Pemeriksaan Laboratorium</h3>
            <ul className="space-y-1.5">
              {[
                'Darah Perifer Lengkap (DPL/CBC)',
                'Ureum & Kreatinin (fungsi ginjal)',
                'Elektrolit (Na, K, Cl, Ca)',
                'HLA Typing (kompatibilitas jaringan)',
                'Golongan darah & Crossmatch',
                'HIV, Hepatitis B & C',
                'Tes genomik (opsional)',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Pemeriksaan Fisik</h3>
            <ul className="space-y-1.5">
              {[
                'Tinggi & Berat Badan (BMI)',
                'Tekanan Darah & Nadi',
                'Suhu Tubuh',
                'Saturasi Oksigen',
                'Pemeriksaan fisik sistemik lengkap',
                'Evaluasi kondisi umum',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Pertanyaan Umum (FAQ)</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
