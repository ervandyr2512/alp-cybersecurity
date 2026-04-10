'use client';
import { useEffect, useState } from 'react';
import { FlaskConical, Users, CheckCircle, Clock } from 'lucide-react';
import { medicalRecordDb, donorDb } from '@/lib/firebase/database';
import type { MedicalRecord, Donor } from '@/types';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function HospitalDashboard() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [r, d] = await Promise.all([medicalRecordDb.getAll(), donorDb.getAll()]);
      setRecords(r);
      setDonors(d.filter((d) => d.status === 'assigned' || d.status === 'eligible'));
      setLoading(false);
    };
    load();
  }, []);

  const fit = records.filter((r) => r.overallResult === 'fit').length;
  const unfit = records.filter((r) => r.overallResult === 'unfit').length;
  const pending = records.filter((r) => !r.overallResult || r.overallResult === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Rumah Sakit</h1>
        <p className="text-gray-500 text-sm">Manajemen rekam medis dan donor yang ditugaskan</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Rekam Medis" value={loading ? '…' : records.length} icon={FlaskConical} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Fit / Layak" value={loading ? '…' : fit} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Tidak Layak" value={loading ? '…' : unfit} icon={Users} iconColor="text-red-500" iconBg="bg-red-50" />
        <StatsCard title="Menunggu Hasil" value={loading ? '…' : pending} icon={Clock} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Rekam Medis Terbaru" action={<Link href="/dashboard/hospital/records" className="text-xs text-blue-600 hover:underline">Lihat semua</Link>} />
          <CardBody className="p-0">
            {loading ? <div className="px-6 py-8 text-center text-gray-400 text-sm">Memuat...</div> :
              records.length === 0 ? <div className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada rekam medis.</div> :
              <div className="divide-y divide-gray-100">
                {records.slice(-6).reverse().map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.donorName}</p>
                      <p className="text-xs text-gray-400">{r.hospitalName}</p>
                    </div>
                    <Badge variant={r.overallResult === 'fit' ? 'green' : r.overallResult === 'unfit' ? 'red' : 'yellow'}>
                      {r.overallResult === 'fit' ? 'Fit' : r.overallResult === 'unfit' ? 'Unfit' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            }
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Donor Ditugaskan" action={<Link href="/dashboard/hospital/donors" className="text-xs text-blue-600 hover:underline">Lihat semua</Link>} />
          <CardBody className="p-0">
            {loading ? <div className="px-6 py-8 text-center text-gray-400 text-sm">Memuat...</div> :
              donors.length === 0 ? <div className="px-6 py-8 text-center text-gray-400 text-sm">Tidak ada donor ditugaskan.</div> :
              <div className="divide-y divide-gray-100">
                {donors.slice(0, 6).map((d) => (
                  <div key={d.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.bloodType}{d.rhesus} &bull; {d.city}</p>
                    </div>
                    <Badge variant={d.status === 'assigned' ? 'teal' : 'green'}>
                      {d.status === 'assigned' ? 'Ditugaskan' : 'Eligible'}
                    </Badge>
                  </div>
                ))}
              </div>
            }
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
