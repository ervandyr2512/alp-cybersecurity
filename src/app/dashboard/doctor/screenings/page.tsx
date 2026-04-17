'use client';
import { useEffect, useState } from 'react';
import { FlaskConical, ClipboardList, Eye } from 'lucide-react';
import { screeningDb, donorDb, medicalRecordDb } from '@/lib/firebase/database';
import type { Screening, Donor, MedicalRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select, Textarea, Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────
function fmt(v?: number | string, unit = '') {
  if (v === undefined || v === null || v === '') return '—';
  return `${v}${unit ? ' ' + unit : ''}`;
}

function StatusBadge({ status, result }: { status: Screening['status']; result: Screening['result'] }) {
  if (status === 'completed') {
    return result === 'eligible'
      ? <Badge variant="green">Eligible</Badge>
      : result === 'ineligible'
      ? <Badge variant="red">Tidak Eligible</Badge>
      : <Badge variant="green">Selesai</Badge>;
  }
  if (status === 'scheduled') return <Badge variant="blue">Terjadwal</Badge>;
  return <Badge variant="yellow">Menunggu</Badge>;
}

// ── Lab section component ─────────────────────────────────────
function LabSection({ title, rows }: { title: string; rows: [string, string][] }) {
  const filled = rows.filter(([, v]) => v !== '—');
  if (filled.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 pb-1 border-b border-gray-100">
        {title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
        {filled.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function crossmatchLabel(v?: string) {
  if (v === 'positive') return 'Positif';
  if (v === 'negative') return 'Negatif';
  if (v === 'pending') return 'Menunggu';
  return '—';
}
function reactiveLabel(v?: string) {
  if (v === 'reactive') return 'Reaktif';
  if (v === 'non-reactive') return 'Non-reaktif';
  if (v === 'pending') return 'Menunggu';
  return '—';
}

// ── Main page ─────────────────────────────────────────────────
export default function DoctorScreeningsPage() {
  const [screenings, setScreenings]     = useState<Screening[]>([]);
  const [donors, setDonors]             = useState<Donor[]>([]);
  const [records, setRecords]           = useState<MedicalRecord[]>([]);
  const [loading, setLoading]           = useState(true);

  // Screening input modal
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [resultForm, setResultForm]     = useState({ result: '', notes: '', scheduledAt: '' });
  const [submitting, setSubmitting]     = useState(false);

  // Lab results modal
  const [labDonorId, setLabDonorId]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [allScreenings, allDonors, allRecords] = await Promise.all([
      screeningDb.getAll(),
      donorDb.getAll(),
      medicalRecordDb.getAll(),
    ]);
    setScreenings(allScreenings);
    setDonors(allDonors);
    setRecords(allRecords);
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
      if (resultForm.result === 'eligible') {
        const donor = donors.find((d) => d.id === selectedScreening.donorId);
        if (donor) await donorDb.update(donor.id, { status: 'eligible' });
      } else if (resultForm.result === 'ineligible') {
        const donor = donors.find((d) => d.id === selectedScreening.donorId);
        if (donor) await donorDb.update(donor.id, { status: 'rejected' });
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

  // Lab results for the selected donor
  const labRecords = labDonorId ? records.filter((r) => r.donorId === labDonorId) : [];
  const labDonor   = donors.find((d) => d.id === labDonorId);

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
                {['Donor', 'Spesialisasi', 'Status', 'Jadwal', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">Memuat...</td></tr>
              )}
              {!loading && screenings.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">Belum ada data skrining.</td></tr>
              )}
              {screenings.map((s) => {
                const hasLab = records.some((r) => r.donorId === s.donorId);
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900">{s.donorName}</p>
                      <p className="text-xs text-gray-400">{s.donorId}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.doctorType}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} result={s.result} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('id-ID') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openScreening(s)}
                        >
                          <ClipboardList size={13} className="mr-1" />
                          {s.status === 'completed' ? 'Lihat' : 'Input Hasil'}
                        </Button>
                        {hasLab && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLabDonorId(s.donorId)}
                            className="text-teal-600 border-teal-200 hover:bg-teal-50"
                          >
                            <FlaskConical size={13} className="mr-1" />
                            Hasil Lab
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Input / Lihat Hasil Skrining ─────────────── */}
      <Modal
        open={!!selectedScreening}
        onClose={() => setSelectedScreening(null)}
        title="Input / Lihat Hasil Skrining"
      >
        {selectedScreening && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-gray-500">Donor:</span> <strong>{selectedScreening.donorName}</strong></p>
              <p><span className="text-gray-500">Spesialisasi:</span> {selectedScreening.doctorType}</p>
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
                { value: 'pending',    label: 'Belum Dinilai' },
                { value: 'eligible',   label: 'Eligible (Layak Donor)' },
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

      {/* ── Modal: Hasil Lab Pasien ──────────────────────────── */}
      <Modal
        open={!!labDonorId}
        onClose={() => setLabDonorId(null)}
        title={`Hasil Lab — ${labDonor?.name ?? ''}`}
        size="lg"
      >
        {labDonorId && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {labRecords.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">
                Belum ada rekam medis / hasil lab untuk donor ini.
              </p>
            ) : (
              labRecords.map((rec, idx) => (
                <div key={rec.id} className="border border-gray-100 rounded-xl p-4 space-y-4">
                  {/* Header rekam medis */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Rekam Medis #{idx + 1}</p>
                      <p className="text-sm font-semibold text-gray-800">{rec.hospitalName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{new Date(rec.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        rec.overallResult === 'fit'   ? 'bg-green-100 text-green-700' :
                        rec.overallResult === 'unfit' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {rec.overallResult === 'fit' ? 'Fit' : rec.overallResult === 'unfit' ? 'Unfit' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Pemeriksaan Fisik */}
                  <LabSection
                    title="Pemeriksaan Fisik"
                    rows={[
                      ['Tinggi Badan',   fmt(rec.physicalExam?.height, 'cm')],
                      ['Berat Badan',    fmt(rec.physicalExam?.weight, 'kg')],
                      ['BMI',            fmt(rec.physicalExam?.bmi)],
                      ['Tekanan Darah',  rec.physicalExam?.bloodPressureSystolic
                        ? `${rec.physicalExam.bloodPressureSystolic}/${rec.physicalExam.bloodPressureDiastolic} mmHg`
                        : '—'],
                      ['Nadi',           fmt(rec.physicalExam?.heartRate, '/mnt')],
                      ['Suhu',           fmt(rec.physicalExam?.temperature, '°C')],
                      ['SpO2',           fmt(rec.physicalExam?.oxygenSaturation, '%')],
                      ['Kondisi Umum',   fmt(rec.physicalExam?.generalCondition)],
                    ]}
                  />

                  {/* DPL / CBC */}
                  <LabSection
                    title="Darah Perifer Lengkap (DPL)"
                    rows={[
                      ['Hemoglobin',  fmt(rec.labResults?.hemoglobin, 'g/dL')],
                      ['Hematokrit',  fmt(rec.labResults?.hematocrit, '%')],
                      ['Leukosit',    fmt(rec.labResults?.leukocytes, 'rb/µL')],
                      ['Trombosit',   fmt(rec.labResults?.thrombocytes, 'rb/µL')],
                    ]}
                  />

                  {/* Fungsi Ginjal */}
                  <LabSection
                    title="Fungsi Ginjal"
                    rows={[
                      ['Ureum',      fmt(rec.labResults?.urea, 'mg/dL')],
                      ['Kreatinin',  fmt(rec.labResults?.creatinine, 'mg/dL')],
                      ['GFR',        fmt(rec.labResults?.gfr, 'mL/min')],
                    ]}
                  />

                  {/* Elektrolit */}
                  <LabSection
                    title="Elektrolit"
                    rows={[
                      ['Natrium (Na)',  fmt(rec.labResults?.sodium, 'mEq/L')],
                      ['Kalium (K)',    fmt(rec.labResults?.potassium, 'mEq/L')],
                      ['Klorida (Cl)', fmt(rec.labResults?.chloride, 'mEq/L')],
                      ['Kalsium (Ca)', fmt(rec.labResults?.calcium, 'mg/dL')],
                    ]}
                  />

                  {/* Imunologi */}
                  <LabSection
                    title="Imunologi & Golongan Darah"
                    rows={[
                      ['HLA Typing',    fmt(rec.labResults?.hlaTyping)],
                      ['Golongan Darah', fmt(rec.labResults?.bloodGroup)],
                      ['Crossmatch',    crossmatchLabel(rec.labResults?.crossmatch)],
                    ]}
                  />

                  {/* Penyakit Menular */}
                  <LabSection
                    title="Penyakit Menular"
                    rows={[
                      ['HIV',         reactiveLabel(rec.labResults?.hivStatus)],
                      ['Hepatitis B', reactiveLabel(rec.labResults?.hepatitisBStatus)],
                      ['Hepatitis C', reactiveLabel(rec.labResults?.hepatitisCStatus)],
                    ]}
                  />

                  {/* Genomik */}
                  {rec.labResults?.genomicTesting && (
                    <LabSection
                      title="Tes Genomik"
                      rows={[
                        ['Hasil', fmt(rec.labResults.genomicTesting)],
                        ['Catatan', fmt(rec.labResults.genomicNotes)],
                      ]}
                    />
                  )}

                  {/* Catatan */}
                  {rec.notes && (
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                      <p className="text-xs font-semibold text-blue-500 uppercase mb-1">Catatan</p>
                      {rec.notes}
                    </div>
                  )}
                  {rec.conductedBy && (
                    <p className="text-xs text-gray-400 text-right">Dilakukan oleh: {rec.conductedBy}</p>
                  )}
                </div>
              ))
            )}

            <div className="pt-2">
              <Button variant="outline" className="w-full" onClick={() => setLabDonorId(null)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
