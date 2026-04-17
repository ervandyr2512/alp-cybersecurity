'use client';
import { useEffect, useState } from 'react';
import { donorDb } from '@/lib/firebase/database';
import type { Donor } from '@/types';
import { DonorStatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function HospitalDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donorDb.getAll().then((all) => {
      // Tampilkan semua donor kecuali yang ditolak
      setDonors(all.filter((d) => d.status !== 'rejected'));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Donor Ditugaskan</h1>
        <p className="text-gray-500 text-sm">{donors.length} donor dalam penanganan</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                {['Nama', 'Usia', 'Gol. Darah', 'Kota', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Memuat...</td></tr>}
              {!loading && donors.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Tidak ada donor.</td></tr>}
              {donors.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.age} thn</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.bloodType}{d.rhesus}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.city}</td>
                  <td className="px-4 py-3"><DonorStatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <Link href="/dashboard/hospital/records" className="text-xs text-blue-600 hover:underline font-medium">
                      Input Rekam Medis
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
