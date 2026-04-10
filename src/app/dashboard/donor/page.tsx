'use client';
import { useEffect, useState } from 'react';
import { Heart, FlaskConical, UserCheck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { donorDb, screeningDb, medicalRecordDb } from '@/lib/firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import type { Donor, Screening, MedicalRecord } from '@/types';
import { DonorStatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const statusMessages: Record<string, { icon: React.ElementType; color: string; title: string; desc: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', title: 'Menunggu Skrining', desc: 'Pendaftaran Anda telah diterima. Tim kami akan menjadwalkan skrining segera.' },
  screening: { icon: UserCheck, color: 'text-blue-500', title: 'Dalam Proses Skrining', desc: 'Anda sedang dalam proses evaluasi oleh dokter spesialis.' },
  eligible: { icon: CheckCircle, color: 'text-green-500', title: 'Dinyatakan Eligible', desc: 'Selamat! Anda dinyatakan layak sebagai donor. Menunggu penugasan rumah sakit.' },
  assigned: { icon: Heart, color: 'text-teal-500', title: 'Ditugaskan ke Rumah Sakit', desc: 'Anda telah ditugaskan ke rumah sakit untuk pemeriksaan lanjutan.' },
  rejected: { icon: AlertCircle, color: 'text-red-500', title: 'Tidak Memenuhi Syarat', desc: 'Berdasarkan hasil evaluasi, Anda belum dapat menjadi donor saat ini.' },
};

export default function DonorDashboard() {
  const { userProfile } = useAuth();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userProfile?.linkedId) { setLoading(false); return; }
      const [d, allScr, allRec] = await Promise.all([
        donorDb.get(userProfile.linkedId),
        screeningDb.getByDonor(userProfile.linkedId),
        medicalRecordDb.getByDonor(userProfile.linkedId),
      ]);
      setDonor(d);
      setScreenings(allScr);
      setRecords(allRec);
      setLoading(false);
    };
    load();
  }, [userProfile]);

  if (loading) return <div className="text-center py-16 text-gray-400">Memuat data...</div>;
  if (!donor) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <Heart className="h-14 w-14 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Data Donor Tidak Ditemukan</h2>
        <p className="text-gray-500 text-sm mb-6">Silakan daftar ulang atau hubungi admin.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700">
          Daftar Sebagai Donor
        </Link>
      </div>
    );
  }

  const status = statusMessages[donor.status] ?? statusMessages.pending;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Donor</h1>
        <p className="text-gray-500 text-sm">Selamat datang, {userProfile?.name}</p>
      </div>

      {/* Status card */}
      <div className={`rounded-xl border-2 p-6 ${donor.status === 'eligible' || donor.status === 'assigned' ? 'border-green-200 bg-green-50' : donor.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
        <div className="flex items-start gap-4">
          <StatusIcon className={`h-10 w-10 flex-shrink-0 ${status.color}`} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-gray-900">{status.title}</h2>
              <DonorStatusBadge status={donor.status} />
            </div>
            <p className="text-sm text-gray-600">{status.desc}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile summary */}
        <Card>
          <CardHeader title="Profil Saya" action={<Link href="/dashboard/donor/profile" className="text-xs text-blue-600 hover:underline">Edit</Link>} />
          <CardBody>
            <dl className="space-y-2 text-sm">
              {[
                { label: 'Nama', value: donor.name },
                { label: 'Usia', value: `${donor.age} tahun` },
                { label: 'Gol. Darah', value: `${donor.bloodType}${donor.rhesus}` },
                { label: 'Kota', value: donor.city },
                { label: 'Telepon', value: donor.phone },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <dt className="text-gray-500">{item.label}</dt>
                  <dd className="font-medium text-gray-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        {/* Screening status */}
        <Card>
          <CardHeader title="Status Skrining" subtitle={`${screenings.length} sesi dijadwalkan`} />
          <CardBody className="p-0">
            {screenings.length === 0 ? (
              <div className="px-6 py-4 text-sm text-gray-400">Belum ada jadwal skrining.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {screenings.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.doctorType}</p>
                      <p className="text-xs text-gray-400">{s.doctorName}</p>
                    </div>
                    <Badge variant={s.result === 'eligible' ? 'green' : s.result === 'ineligible' ? 'red' : 'yellow'}>
                      {s.result === 'eligible' ? 'Eligible' : s.result === 'ineligible' ? 'Tidak Eligible' : 'Menunggu'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Medical records */}
      {records.length > 0 && (
        <Card>
          <CardHeader title="Hasil Pemeriksaan" action={<Link href="/dashboard/donor/records" className="text-xs text-blue-600 hover:underline">Lihat detail</Link>} />
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.hospitalName}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <Badge variant={r.overallResult === 'fit' ? 'green' : r.overallResult === 'unfit' ? 'red' : 'yellow'}>
                    {r.overallResult === 'fit' ? 'Fit' : r.overallResult === 'unfit' ? 'Unfit' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
