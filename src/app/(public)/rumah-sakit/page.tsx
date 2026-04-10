import { MapPin, Phone, Mail, Globe, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Rumah Sakit' };

const hospitals = [
  {
    name: 'RSCM',
    fullName: 'Rumah Sakit Cipto Mangunkusumo',
    address: 'Jl. Diponegoro No. 71, Rawasari, Cempaka Putih, Jakarta Pusat',
    phone: '(021) 500135',
    email: 'info@rscm.co.id',
    website: 'rscm.co.id',
    type: 'Rumah Sakit Pemerintah (Pusat Rujukan Nasional)',
    specialties: ['Nefrologi', 'Urologi', 'Transplantasi Ginjal', 'Bedah Urologi'],
    accreditation: 'JCI & KARS Paripurna',
    capacity: 30,
    color: 'border-blue-400',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'RS Fatmawati',
    fullName: 'Rumah Sakit Umum Pusat Fatmawati',
    address: 'Jl. RS Fatmawati No. 4, Cilandak, Jakarta Selatan',
    phone: '(021) 7501524',
    email: 'info@rsfatmawati.id',
    website: 'rsfatmawati.id',
    type: 'Rumah Sakit Pemerintah',
    specialties: ['Nefrologi', 'Urologi', 'Onkologi'],
    accreditation: 'KARS Paripurna',
    capacity: 20,
    color: 'border-teal-400',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    name: 'RS Bunda Jakarta',
    fullName: 'Rumah Sakit Bunda Jakarta',
    address: 'Jl. Teuku Cik Ditiro No. 28, Menteng, Jakarta Pusat',
    phone: '(021) 3900305',
    email: 'info@rsbunda.com',
    website: 'rsbunda.com',
    type: 'Rumah Sakit Swasta',
    specialties: ['Transplantasi Ginjal', 'Dialisis', 'Urologi'],
    accreditation: 'KARS Paripurna',
    capacity: 15,
    color: 'border-purple-400',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'RS Siloam ASRI',
    fullName: 'Siloam Hospitals ASRI',
    address: 'Jl. H.R. Rasuna Said Kav. 29, Kuningan, Jakarta Selatan',
    phone: '(021) 5262222',
    email: 'info@siloamhospitals.com',
    website: 'siloamhospitals.com',
    type: 'Rumah Sakit Swasta',
    specialties: ['Nefrologi', 'Urologi', 'Transplantasi Organ'],
    accreditation: 'JCI Terakreditasi',
    capacity: 25,
    color: 'border-orange-400',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Mandaya Hospital Puri',
    fullName: 'Mandaya Royal Hospital Puri',
    address: 'Jl. Lingkar Luar Barat Blok A5 No. 1, Puri Indah, Jakarta Barat',
    phone: '(021) 25601000',
    email: 'info@mandayahospital.com',
    website: 'mandayahospital.com',
    type: 'Rumah Sakit Swasta',
    specialties: ['Nefrologi', 'Urologi', 'Bedah Minimal Invasif'],
    accreditation: 'KARS Paripurna',
    capacity: 20,
    color: 'border-green-400',
    badge: 'bg-green-100 text-green-700',
  },
];

export default function RumahSakitPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Rumah Sakit Mitra</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Donor yang dinyatakan eligible akan ditugaskan ke salah satu rumah sakit terpercaya berikut
          yang memiliki fasilitas transplantasi ginjal lengkap di Indonesia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hospitals.map((h) => (
          <div
            key={h.name}
            className={`bg-white rounded-xl border-l-4 ${h.color} border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{h.name}</h2>
                <p className="text-sm text-gray-500">{h.fullName}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${h.badge}`}>
                {h.accreditation}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                {h.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                {h.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400" />
                {h.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe size={14} className="text-gray-400" />
                {h.website}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Layanan Spesialis</p>
              <div className="flex flex-wrap gap-1.5">
                {h.specialties.map((spec) => (
                  <span key={spec} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md">
                    <CheckCircle2 size={10} className="text-teal-500" />
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full"
                  style={{ width: `${Math.random() * 50 + 40}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">Kapasitas: {h.capacity} donor/tahun</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
