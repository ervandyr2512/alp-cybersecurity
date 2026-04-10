import { Stethoscope, GraduationCap, Hospital } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dokter Kami' };

const doctors = [
  {
    name: 'Prof. Dr. Endang Susalit, SpPD-KGH',
    specialization: 'SpPD-KGH',
    title: 'Nefrolog & Hipertensi',
    hospital: 'RSCM',
    education: 'FK Universitas Indonesia',
    expertise: ['Penyakit Ginjal Kronik', 'Hipertensi', 'Transplantasi Ginjal', 'Dialisis'],
    bio: 'Profesor emeritus dengan pengalaman lebih dari 30 tahun dalam bidang nefrologi dan transplantasi ginjal. Penulis berbagai publikasi internasional.',
  },
  {
    name: 'Dr. Hilman Hadiansyah, SpPD-KGH',
    specialization: 'SpPD-KGH',
    title: 'Nefrolog',
    hospital: 'RS Siloam ASRI',
    education: 'FK Universitas Indonesia',
    expertise: ['Nefrologi', 'Hipertensi Ginjal', 'Sindrom Nefrotik'],
    bio: 'Spesialis penyakit dalam konsultan ginjal hipertensi dengan keahlian evaluasi donor ginjal living dan deceased.',
  },
  {
    name: 'Dr. Nur Rasyid, SpU(K)',
    specialization: 'Urologist',
    title: 'Urolog Konsultan',
    hospital: 'RSCM',
    education: 'FK Universitas Indonesia',
    expertise: ['Bedah Urologi', 'Laparoskopi Ginjal', 'Transplantasi Urologi'],
    bio: 'Urolog konsultan dengan spesialisasi nefrektomi laparoskopik untuk donor ginjal hidup. Lebih dari 500 prosedur berhasil dilakukan.',
  },
  {
    name: 'Dr. Petrus Ari Lukmanto, SpU',
    specialization: 'Urologist',
    title: 'Urolog',
    hospital: 'RS Fatmawati',
    education: 'FK Universitas Indonesia',
    expertise: ['Urologi Umum', 'Batu Ginjal', 'Evaluasi Donor'],
    bio: 'Urolog berpengalaman dalam evaluasi anatomi dan fungsi ginjal calon donor. Aktif dalam program edukasi donor ginjal nasional.',
  },
  {
    name: 'Dr. Rika Ferlianti, SpF',
    specialization: 'Forensic',
    title: 'Dokter Forensik',
    hospital: 'RSCM',
    education: 'FK Universitas Indonesia',
    expertise: ['Forensik Klinik', 'Aspek Hukum Donor', 'Identifikasi DBD/DCD'],
    bio: 'Spesialis kedokteran forensik dengan keahlian dalam aspek medikolegal donasi organ, termasuk verifikasi donor brain death dan cardiac death.',
  },
  {
    name: 'Dr. Ahmad Fuadi, SpF',
    specialization: 'Forensic',
    title: 'Dokter Forensik',
    hospital: 'RS Bunda Jakarta',
    education: 'FK Universitas Indonesia',
    expertise: ['Aspek Hukum Transplantasi', 'Medikolegal', 'DCD Assessment'],
    bio: 'Ahli forensik klinis yang berfokus pada kepatuhan etika dan hukum dalam proses donasi organ di Indonesia.',
  },
];

const specConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  'SpPD-KGH': { label: 'Nefrolog / Hipertensi', color: 'text-blue-700', bg: 'bg-blue-100', icon: Stethoscope },
  Urologist: { label: 'Urolog', color: 'text-teal-700', bg: 'bg-teal-100', icon: Hospital },
  Forensic: { label: 'Dokter Forensik', color: 'text-purple-700', bg: 'bg-purple-100', icon: GraduationCap },
};

export default function DokterKamiPage() {
  const grouped = doctors.reduce<Record<string, typeof doctors>>((acc, d) => {
    if (!acc[d.specialization]) acc[d.specialization] = [];
    acc[d.specialization].push(d);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tim Dokter Kami</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Setiap calon donor akan dievaluasi oleh tiga dokter spesialis yang bekerja sama untuk memastikan
          keselamatan dan eligibilitas donor secara komprehensif.
        </p>
      </div>

      {Object.entries(grouped).map(([spec, docs]) => {
        const cfg = specConfig[spec];
        const SpecIcon = cfg.icon;
        return (
          <div key={spec} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-lg ${cfg.bg}`}>
                <SpecIcon className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{cfg.label}</h2>
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                {docs.length} dokter
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {docs.map((doc) => (
                <div key={doc.name} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className={`font-bold text-lg ${cfg.color}`}>
                        {doc.name.split(' ').slice(2, 4).map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug">{doc.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{doc.title} &bull; {doc.hospital}</p>
                      <p className="text-xs text-gray-400 mt-0.5"><GraduationCap size={10} className="inline mr-1" />{doc.education}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-4 leading-relaxed">{doc.bio}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {doc.expertise.map((e) => (
                      <span key={e} className={`px-2 py-0.5 text-xs rounded-md ${cfg.bg} ${cfg.color}`}>
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
