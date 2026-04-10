import { Heart, Target, Eye, Shield, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tentang Kami' };

const values = [
  { icon: Shield, title: 'Integritas', desc: 'Kami menjunjung tinggi transparansi dan kejujuran dalam setiap proses, memastikan kepercayaan semua pihak.' },
  { icon: Heart, title: 'Kemanusiaan', desc: 'Setiap keputusan kami didorong oleh keinginan untuk menyelamatkan nyawa dan meningkatkan kualitas hidup.' },
  { icon: Users, title: 'Kolaborasi', desc: 'Kami percaya pada kekuatan kerjasama antara donor, dokter, rumah sakit, dan pemerintah.' },
  { icon: Target, title: 'Akurasi', desc: 'Data medis yang akurat dan sistem yang andal adalah fondasi keselamatan setiap donor dan penerima.' },
];

const milestones = [
  { year: '2024', event: 'KidneyHub.id didirikan sebagai inisiatif nasional registri donor ginjal.' },
  { year: '2024', event: 'Kemitraan resmi dengan 5 rumah sakit transplantasi ginjal terkemuka di Jakarta.' },
  { year: '2025', event: 'Peluncuran platform digital dengan sistem skrining multi-dokter terintegrasi.' },
  { year: '2025', event: 'Lebih dari 300 calon donor terdaftar dan proses evaluasi berjalan aktif.' },
];

export default function TentangKamiPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex p-4 bg-red-50 rounded-full mb-6">
          <Heart className="h-12 w-12 text-red-500 fill-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tentang KidneyHub.id</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Platform registri donor ginjal nasional pertama di Indonesia — menghubungkan calon donor,
          dokter spesialis, dan rumah sakit terpercaya dalam satu ekosistem digital yang aman dan transparan.
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <Eye className="h-10 w-10 text-blue-200 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Visi</h2>
          <p className="text-blue-100 leading-relaxed">
            Menjadi registri donor ginjal nasional yang komprehensif, transparan, dan terpercaya —
            memungkinkan setiap pasien gagal ginjal di Indonesia mendapatkan akses transplantasi yang adil dan cepat.
          </p>
        </div>
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 text-white">
          <Target className="h-10 w-10 text-teal-200 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Misi</h2>
          <ul className="text-teal-100 space-y-2 text-sm leading-relaxed">
            <li>• Membangun sistem registri donor ginjal yang terintegrasi secara nasional</li>
            <li>• Menyederhanakan proses skrining dan evaluasi medis donor</li>
            <li>• Memfasilitasi koordinasi efisien antara donor, dokter, dan rumah sakit</li>
            <li>• Meningkatkan kesadaran masyarakat tentang donasi ginjal</li>
            <li>• Menjaga standar etika dan kepatuhan hukum dalam setiap proses</li>
          </ul>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Nilai-Nilai Kami</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
              <div className="inline-flex p-3 bg-gray-50 rounded-xl mb-4">
                <v.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Perjalanan Kami</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-6 pl-12 relative">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{m.year}</span>
                  <p className="text-sm text-gray-700 mt-1">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
