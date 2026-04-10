import Link from 'next/link';
import { Heart, Shield, Users, Hospital, ArrowRight, CheckCircle, Activity } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Home' };

const stats = [
  { label: 'Pasien Butuh Ginjal', value: '2.200+', icon: Activity, color: 'text-red-500', bg: 'bg-red-50' },
  { label: 'Rumah Sakit Mitra', value: '5', icon: Hospital, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Dokter Spesialis', value: '15+', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Donor Terdaftar', value: '320+', icon: Heart, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const steps = [
  {
    step: '01',
    title: 'Daftar sebagai Donor',
    desc: 'Isi formulir pendaftaran online dengan data diri dan riwayat kesehatan dasar.',
    color: 'bg-blue-600',
  },
  {
    step: '02',
    title: 'Skrining Medis Multi-Dokter',
    desc: 'Jalani konsultasi dengan Nefrolog, Urolog, dan Dokter Forensik untuk penilaian eligibilitas.',
    color: 'bg-teal-600',
  },
  {
    step: '03',
    title: 'Penugasan Rumah Sakit',
    desc: 'Jika eligible, Anda akan ditugaskan ke rumah sakit mitra untuk pemeriksaan komprehensif.',
    color: 'bg-purple-600',
  },
  {
    step: '04',
    title: 'Pemeriksaan Lengkap',
    desc: 'Lakukan pemeriksaan fisik, laboratorium (CBC, HLA typing, crossmatch), dan lainnya.',
    color: 'bg-orange-500',
  },
];

const hospitals = [
  'RSCM (Rumah Sakit Cipto Mangunkusumo)',
  'RS Fatmawati',
  'RS Bunda Jakarta',
  'RS Siloam ASRI',
  'Mandaya Hospital Puri',
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-300 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Shield size={14} />
              Registri Donor Ginjal Nasional Indonesia
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Satu Ginjal, <br />
              <span className="text-teal-200">Satu Nyawa</span> Terselamatkan
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed mb-8 max-w-2xl">
              KidneyHub.id adalah platform terpusat untuk registrasi donor ginjal,
              skrining medis multi-dokter, dan koordinasi dengan rumah sakit terkemuka di Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Daftar Sebagai Donor
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/informasi"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/30"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
              <div className={`inline-flex p-3 rounded-xl ${s.bg} mb-3`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Bagaimana Cara Kerjanya?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Proses pendaftaran donor yang terstruktur, aman, dan transparan untuk memastikan kualitas dan keselamatan semua pihak.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gray-200 z-0" style={{ width: 'calc(100% - 2rem)' }} />
              )}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative z-10">
                <div className={`w-12 h-12 rounded-xl ${s.color} text-white font-bold flex items-center justify-center text-lg mb-4`}>
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hospitals */}
      <section className="bg-gray-50 border-y border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Rumah Sakit Mitra</h2>
            <p className="text-gray-500">Donor yang eligible akan ditugaskan ke salah satu rumah sakit terpercaya berikut.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {hospitals.map((h) => (
              <div key={h} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{h}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/rumah-sakit" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline text-sm">
              Lihat Detail Rumah Sakit <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <Heart className="h-14 w-14 text-red-400 fill-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Jadilah Bagian dari Solusi
          </h2>
          <p className="text-gray-500 mb-8 text-lg leading-relaxed">
            Lebih dari 2.200 pasien di Indonesia membutuhkan transplantasi ginjal.
            Dengan mendaftar sebagai donor, Anda memberi harapan nyata.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg text-lg"
          >
            Mulai Pendaftaran Donor
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
