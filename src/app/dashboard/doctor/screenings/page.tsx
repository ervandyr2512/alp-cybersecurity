'use client';
import { useEffect, useState } from 'react';
import { screeningDb, donorDb } from '@/lib/firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import type { Screening, Donor } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select, Textarea, Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function DoctorScreeningsPage() {
  const { userProfile } = useAuth();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [resultForm, setResultForm] = useState({ result: '', notes: '', scheduledAt: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [allScreenings, allDonors] = await Promise.all([screeningDb.getAll(), donorDb.getAll()]);
    setScreenings(allScreenings);
    setDonors(allDonors);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openScreening = (s: Screening) => {
    setSelectedScreening(s);
    setResultForm({ result: s.result, notes: s.notes, scheduledAt: s.scheduledAt });
  };

  const handleSubmitResult = async () => {
    if (!selectedScreening) return;
    setSubmitting(true);
    try {
      await screeningDb.update(selectedScreening.id, {
        result: resultForm.result as Screening['result'],
        notes: resultForm.notes,
        status: 'completed',
        completedAt: new Date().toISOString(),
        scheduledAt: resultForm.scheduledAt,
      });

      // If eligible, update donor status
      if (resultForm.result === 'eligible') {
        const donor = donors.find((d) => d.id === selectedScreening.donorId);
        if (donor) {
          await donorDb.update(donor.id, { status: 'eligible' });
        }
      } else if (resultForm.result === 'ineligible') {
        const donor = donors.find((d) => d.id === selectedScreening.donorId);
        if (donor) {
          await donorDb.update(donor.id, { status: 'rejected' });
        }
      }

      toast.success('Hasil skrining berhasil disimpan');
      setSelectedScreening(null);
      await load();
    } catch {
      toast.error('Gagal menyimpan hasil');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skrining Donor</h1>
        <p className="text-gray-500 text-sm">Daftar donor yang perlu dievaluasi</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                {['Donor', 'Jenis Dokter', 'Status', 'Jadwal', 'Hasil', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Memuat...</td></tr>}
              {!loading && screenings.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Belum ada data skrining.</td></tr>}
              {screenings.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm text-gray-900">{s.donorName}</p>
                    <p className="text-xs text-gray-400">{s.donorId}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.doctorType}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'blue' : 'yellow'}>
                      {s.status === 'completed' ? 'Selesai' : s.status === 'scheduled' ? 'Terjadwal' : 'Menunggu'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {s.result !== 'pending' ? (
                      <Badge variant={s.result === 'eligible' ? 'green' : 'red'}>
                        {s.result === 'eligible' ? 'Eligible' : 'Tidak Eligible'}
                      </Badge>
                    ) : <span className="text-gray-400 text-xs">Belum dinilai</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => openScreening(s)}>
                      {s.status === 'completed' ? 'Lihat' : 'Input Hasil'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selectedScreening} onClose={() => setSelectedScreening(null)} title="Input / Lihat Hasil Skrining">
        {selectedScreening && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-gray-500">Donor:</span> <strong>{selectedScreening.donorName}</strong></p>
              <p><span className="text-gray-500">Jenis Dokter:</span> {selectedScreening.doctorType}</p>
            </div>
            <Input
              label="Jadwal Konsultasi"
              type="datetime-local"
              value={resultForm.scheduledAt}
              onChange={(e) => setResultForm((p) => ({ ...p, scheduledAt: e.target.value }))}
            />
            <Select
              label="Hasil Evaluasi"
              value={resultForm.result}
              onChange={(e) => setResultForm((p) => ({ ...p, result: e.target.value }))}
              required
              options={[
                { value: 'pending', label: 'Belum Dinilai' },
                { value: 'eligible', label: 'Eligible (Layak Donor)' },
                { value: 'ineligible', label: 'Tidak Eligible' },
              ]}
            />
            <Textarea
              label="Catatan Dokter"
              value={resultForm.notes}
              onChange={(e) => setResultForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Temuan klinis, rekomendasi, catatan khusus..."
              rows={4}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedScreening(null)} className="flex-1">Batal</Button>
              <Button onClick={handleSubmitResult} loading={submitting} className="flex-1">Simpan Hasil</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
