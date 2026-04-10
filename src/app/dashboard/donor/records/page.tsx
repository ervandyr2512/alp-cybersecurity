'use client';
import { useEffect, useState } from 'react';
import { medicalRecordDb } from '@/lib/firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import type { MedicalRecord } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

export default function DonorRecordsPage() {
  const { userProfile } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.linkedId) {
      medicalRecordDb.getByDonor(userProfile.linkedId).then((r) => { setRecords(r); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  if (loading) return <div className="text-center py-16 text-gray-400">Memuat...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hasil Pemeriksaan</h1>

      {records.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Belum ada hasil pemeriksaan.</div>
      ) : (
        records.map((r) => (
          <Card key={r.id}>
            <CardHeader
              title={r.hospitalName}
              subtitle={new Date(r.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              action={
                <Badge variant={r.overallResult === 'fit' ? 'green' : r.overallResult === 'unfit' ? 'red' : 'yellow'}>
                  {r.overallResult === 'fit' ? 'Fit' : r.overallResult === 'unfit' ? 'Unfit' : 'Pending'}
                </Badge>
              }
            />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical exam */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pemeriksaan Fisik</h4>
                  <dl className="space-y-1.5 text-sm">
                    {[
                      { label: 'Tekanan Darah', value: `${r.physicalExam?.bloodPressureSystolic}/${r.physicalExam?.bloodPressureDiastolic} mmHg` },
                      { label: 'Nadi', value: `${r.physicalExam?.heartRate} /mnt` },
                      { label: 'Suhu', value: `${r.physicalExam?.temperature} °C` },
                      { label: 'SpO2', value: `${r.physicalExam?.oxygenSaturation}%` },
                      { label: 'BMI', value: r.physicalExam?.bmi ? `${r.physicalExam.bmi}` : '-' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <dt className="text-gray-500">{item.label}</dt>
                        <dd className="font-medium text-gray-900">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Lab results */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Laboratorium</h4>
                  <dl className="space-y-1.5 text-sm">
                    {[
                      { label: 'Hemoglobin', value: r.labResults?.hemoglobin ? `${r.labResults.hemoglobin} g/dL` : '-' },
                      { label: 'Kreatinin', value: r.labResults?.creatinine ? `${r.labResults.creatinine} mg/dL` : '-' },
                      { label: 'Ureum', value: r.labResults?.urea ? `${r.labResults.urea} mg/dL` : '-' },
                      { label: 'GFR', value: r.labResults?.gfr ? `${r.labResults.gfr} mL/min` : '-' },
                      { label: 'HIV', value: r.labResults?.hivStatus ?? '-' },
                      { label: 'Crossmatch', value: r.labResults?.crossmatch ?? '-' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <dt className="text-gray-500">{item.label}</dt>
                        <dd className="font-medium text-gray-900">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {r.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Catatan Dokter</p>
                  <p className="text-sm text-gray-600">{r.notes}</p>
                </div>
              )}
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
