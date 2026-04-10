'use client';
import { useEffect, useState } from 'react';
import { Users, Building2, UserCheck, Activity, ClipboardList, Clock } from 'lucide-react';
import { donorDb, doctorDb, hospitalDb, screeningDb } from '@/lib/firebase/database';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DonorStatusBadge } from '@/components/ui/Badge';
import type { Donor, Screening } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [doctorCount, setDoctorCount] = useState(0);
  const [hospitalCount, setHospitalCount] = useState(0);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [d, docs, hosps, scr] = await Promise.all([
        donorDb.getAll(),
        doctorDb.getAll(),
        hospitalDb.getAll(),
        screeningDb.getAll(),
      ]);
      setDonors(d);
      setDoctorCount(docs.length);
      setHospitalCount(hosps.length);
      setScreenings(scr);
      setLoading(false);
    };
    load();
  }, []);

  const pending = donors.filter((d) => d.status === 'pending').length;
  const eligible = donors.filter((d) => d.status === 'eligible').length;
  const inScreening = donors.filter((d) => d.status === 'screening').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan keseluruhan platform KidneyHub.id</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Donor" value={loading ? '…' : donors.length} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Donor Aktif" value={loading ? '…' : inScreening + eligible} icon={Activity} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <StatsCard title="Dokter Terdaftar" value={loading ? '…' : doctorCount} icon={UserCheck} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Rumah Sakit Mitra" value={loading ? '…' : hospitalCount} icon={Building2} iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent donors */}
        <Card>
          <CardHeader
            title="Donor Terbaru"
            subtitle="10 pendaftaran terakhir"
            action={
              <Link href="/dashboard/admin/donors" className="text-xs text-blue-600 hover:underline">
                Lihat semua
              </Link>
            }
          />
          <CardBody className="p-0">
            {loading ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">Memuat data...</div>
            ) : donors.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada donor terdaftar.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {donors.slice(-10).reverse().map((d) => (
                  <div key={d.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.city} &bull; {d.bloodType}{d.rhesus}</p>
                    </div>
                    <DonorStatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader title="Distribusi Status Donor" />
          <CardBody>
            <div className="space-y-4">
              {[
                { label: 'Menunggu Skrining', value: pending, color: 'bg-yellow-400', total: donors.length },
                { label: 'Sedang Skrining', value: inScreening, color: 'bg-blue-400', total: donors.length },
                { label: 'Eligible', value: eligible, color: 'bg-green-400', total: donors.length },
                { label: 'Ditugaskan', value: donors.filter(d => d.status === 'assigned').length, color: 'bg-teal-400', total: donors.length },
                { label: 'Ditolak', value: donors.filter(d => d.status === 'rejected').length, color: 'bg-red-400', total: donors.length },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{s.label}</span>
                    <span className="font-semibold text-gray-900">{s.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full transition-all`}
                      style={{ width: s.total > 0 ? `${(s.value / s.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
