'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { MedicalRecord } from '@/types';

interface LabResultsFormProps {
  donorId: string;
  donorName: string;
  hospitalId: string;
  hospitalName: string;
  initialData?: Partial<MedicalRecord>;
  onSubmit: (data: Omit<MedicalRecord, 'id' | 'donorName' | 'hospitalName' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function LabResultsForm({
  donorId, donorName, hospitalId, hospitalName,
  initialData, onSubmit, onCancel, loading
}: LabResultsFormProps) {
  const [form, setForm] = useState({
    // Physical exam
    height: String(initialData?.physicalExam?.height ?? ''),
    weight: String(initialData?.physicalExam?.weight ?? ''),
    bpSystolic: String(initialData?.physicalExam?.bloodPressureSystolic ?? ''),
    bpDiastolic: String(initialData?.physicalExam?.bloodPressureDiastolic ?? ''),
    heartRate: String(initialData?.physicalExam?.heartRate ?? ''),
    temperature: String(initialData?.physicalExam?.temperature ?? ''),
    oxygenSaturation: String(initialData?.physicalExam?.oxygenSaturation ?? ''),
    generalCondition: initialData?.physicalExam?.generalCondition ?? '',
    // CBC/DPL
    hemoglobin: String(initialData?.labResults?.hemoglobin ?? ''),
    hematocrit: String(initialData?.labResults?.hematocrit ?? ''),
    leukocytes: String(initialData?.labResults?.leukocytes ?? ''),
    thrombocytes: String(initialData?.labResults?.thrombocytes ?? ''),
    // Renal
    urea: String(initialData?.labResults?.urea ?? ''),
    creatinine: String(initialData?.labResults?.creatinine ?? ''),
    gfr: String(initialData?.labResults?.gfr ?? ''),
    // Electrolytes
    sodium: String(initialData?.labResults?.sodium ?? ''),
    potassium: String(initialData?.labResults?.potassium ?? ''),
    chloride: String(initialData?.labResults?.chloride ?? ''),
    calcium: String(initialData?.labResults?.calcium ?? ''),
    // Immunology
    hlaTyping: initialData?.labResults?.hlaTyping ?? '',
    bloodGroup: initialData?.labResults?.bloodGroup ?? '',
    crossmatch: initialData?.labResults?.crossmatch ?? '',
    // Infectious
    hivStatus: initialData?.labResults?.hivStatus ?? '',
    hepatitisBStatus: initialData?.labResults?.hepatitisBStatus ?? '',
    hepatitisCStatus: initialData?.labResults?.hepatitisCStatus ?? '',
    // Genomic
    genomicTesting: initialData?.labResults?.genomicTesting ?? '',
    genomicNotes: initialData?.labResults?.genomicNotes ?? '',
    // Overall
    overallResult: initialData?.overallResult ?? '',
    notes: initialData?.notes ?? '',
    conductedBy: initialData?.conductedBy ?? '',
  });

  const n = (v: string) => parseFloat(v) || undefined;
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bmi = form.height && form.weight
      ? parseFloat((parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1))
      : undefined;

    await onSubmit({
      donorId,
      hospitalId,
      physicalExam: {
        height: n(form.height)!,
        weight: n(form.weight)!,
        bmi,
        bloodPressureSystolic: n(form.bpSystolic)!,
        bloodPressureDiastolic: n(form.bpDiastolic)!,
        heartRate: n(form.heartRate)!,
        temperature: n(form.temperature)!,
        oxygenSaturation: n(form.oxygenSaturation)!,
        generalCondition: form.generalCondition,
      },
      labResults: {
        hemoglobin: n(form.hemoglobin),
        hematocrit: n(form.hematocrit),
        leukocytes: n(form.leukocytes),
        thrombocytes: n(form.thrombocytes),
        urea: n(form.urea),
        creatinine: n(form.creatinine),
        gfr: n(form.gfr),
        sodium: n(form.sodium),
        potassium: n(form.potassium),
        chloride: n(form.chloride),
        calcium: n(form.calcium),
        hlaTyping: form.hlaTyping || undefined,
        bloodGroup: form.bloodGroup || undefined,
        crossmatch: (form.crossmatch as MedicalRecord['labResults']['crossmatch']) || undefined,
        hivStatus: (form.hivStatus as MedicalRecord['labResults']['hivStatus']) || undefined,
        hepatitisBStatus: (form.hepatitisBStatus as MedicalRecord['labResults']['hepatitisBStatus']) || undefined,
        hepatitisCStatus: (form.hepatitisCStatus as MedicalRecord['labResults']['hepatitisCStatus']) || undefined,
        genomicTesting: form.genomicTesting || undefined,
        genomicNotes: form.genomicNotes || undefined,
      },
      overallResult: (form.overallResult as MedicalRecord['overallResult']) || 'pending',
      notes: form.notes,
      conductedBy: form.conductedBy,
    });
  };

  const reactiveOptions = [
    { value: 'reactive', label: 'Reaktif' },
    { value: 'non-reactive', label: 'Non-reaktif' },
    { value: 'pending', label: 'Menunggu' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Donor info */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <p><span className="text-gray-500">Donor:</span> <strong>{donorName}</strong></p>
        <p><span className="text-gray-500">RS:</span> {hospitalName}</p>
      </div>

      {/* Physical exam */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Pemeriksaan Fisik</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input label="Tinggi (cm)" type="number" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="170" />
          <Input label="Berat (kg)" type="number" value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="70" />
          <Input label="TD Sistolik" type="number" value={form.bpSystolic} onChange={(e) => set('bpSystolic', e.target.value)} placeholder="120" />
          <Input label="TD Diastolik" type="number" value={form.bpDiastolic} onChange={(e) => set('bpDiastolic', e.target.value)} placeholder="80" />
          <Input label="Nadi (/mnt)" type="number" value={form.heartRate} onChange={(e) => set('heartRate', e.target.value)} placeholder="72" />
          <Input label="Suhu (°C)" type="number" step="0.1" value={form.temperature} onChange={(e) => set('temperature', e.target.value)} placeholder="36.5" />
          <Input label="SpO2 (%)" type="number" value={form.oxygenSaturation} onChange={(e) => set('oxygenSaturation', e.target.value)} placeholder="98" />
        </div>
        <div className="mt-3">
          <Input label="Kondisi Umum" value={form.generalCondition} onChange={(e) => set('generalCondition', e.target.value)} placeholder="Composmentis, tampak sehat..." />
        </div>
      </div>

      {/* CBC/DPL */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Darah Perifer Lengkap (DPL)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input label="Hemoglobin (g/dL)" type="number" step="0.1" value={form.hemoglobin} onChange={(e) => set('hemoglobin', e.target.value)} placeholder="14.0" />
          <Input label="Hematokrit (%)" type="number" value={form.hematocrit} onChange={(e) => set('hematocrit', e.target.value)} placeholder="42" />
          <Input label="Leukosit (rb/µL)" type="number" step="0.1" value={form.leukocytes} onChange={(e) => set('leukocytes', e.target.value)} placeholder="7.5" />
          <Input label="Trombosit (rb/µL)" type="number" value={form.thrombocytes} onChange={(e) => set('thrombocytes', e.target.value)} placeholder="250" />
        </div>
      </div>

      {/* Renal */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Fungsi Ginjal</h4>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Ureum (mg/dL)" type="number" value={form.urea} onChange={(e) => set('urea', e.target.value)} placeholder="30" />
          <Input label="Kreatinin (mg/dL)" type="number" step="0.01" value={form.creatinine} onChange={(e) => set('creatinine', e.target.value)} placeholder="0.9" />
          <Input label="GFR (mL/min)" type="number" value={form.gfr} onChange={(e) => set('gfr', e.target.value)} placeholder="90" />
        </div>
      </div>

      {/* Electrolytes */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Elektrolit</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input label="Na (mEq/L)" type="number" value={form.sodium} onChange={(e) => set('sodium', e.target.value)} placeholder="140" />
          <Input label="K (mEq/L)" type="number" step="0.1" value={form.potassium} onChange={(e) => set('potassium', e.target.value)} placeholder="4.0" />
          <Input label="Cl (mEq/L)" type="number" value={form.chloride} onChange={(e) => set('chloride', e.target.value)} placeholder="102" />
          <Input label="Ca (mg/dL)" type="number" step="0.1" value={form.calcium} onChange={(e) => set('calcium', e.target.value)} placeholder="9.5" />
        </div>
      </div>

      {/* Immunology */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Imunologi & Golongan Darah</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input label="HLA Typing" value={form.hlaTyping} onChange={(e) => set('hlaTyping', e.target.value)} placeholder="HLA-A, B, DR..." />
          <Input label="Golongan Darah" value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} placeholder="A+, B-, dll." />
          <Select label="Crossmatch" value={form.crossmatch} onChange={(e) => set('crossmatch', e.target.value)}
            options={[{ value: 'positive', label: 'Positif' }, { value: 'negative', label: 'Negatif' }, { value: 'pending', label: 'Menunggu' }]} />
        </div>
      </div>

      {/* Infectious disease */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Penyakit Menular</h4>
        <div className="grid grid-cols-3 gap-3">
          <Select label="HIV" value={form.hivStatus} onChange={(e) => set('hivStatus', e.target.value)} options={reactiveOptions} />
          <Select label="Hepatitis B" value={form.hepatitisBStatus} onChange={(e) => set('hepatitisBStatus', e.target.value)} options={reactiveOptions} />
          <Select label="Hepatitis C" value={form.hepatitisCStatus} onChange={(e) => set('hepatitisCStatus', e.target.value)} options={reactiveOptions} />
        </div>
      </div>

      {/* Genomic (optional) */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Tes Genomik (Opsional)</h4>
        <div className="space-y-3">
          <Input label="Hasil Tes Genomik" value={form.genomicTesting} onChange={(e) => set('genomicTesting', e.target.value)} placeholder="Nama tes / kode" />
          <Textarea label="Catatan Genomik" value={form.genomicNotes} onChange={(e) => set('genomicNotes', e.target.value)} rows={2} placeholder="Interpretasi hasil..." />
        </div>
      </div>

      {/* Overall */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Kesimpulan</h4>
        <div className="space-y-3">
          <Select
            label="Hasil Keseluruhan"
            value={form.overallResult}
            onChange={(e) => set('overallResult', e.target.value)}
            options={[
              { value: 'fit', label: 'Fit (Layak Donor)' },
              { value: 'unfit', label: 'Unfit (Tidak Layak)' },
              { value: 'pending', label: 'Masih Dalam Evaluasi' },
            ]}
          />
          <Input label="Dilakukan Oleh" value={form.conductedBy} onChange={(e) => set('conductedBy', e.target.value)} required placeholder="Nama dokter/petugas" />
          <Textarea label="Catatan" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Catatan tambahan pemeriksaan..." />
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Batal</Button>
        <Button type="submit" loading={loading} className="flex-1">
          {initialData ? 'Simpan Perubahan' : 'Simpan Rekam Medis'}
        </Button>
      </div>
    </form>
  );
}
