'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { Donor } from '@/types';

interface DonorFormProps {
  initialData?: Partial<Donor>;
  onSubmit: (data: Omit<Donor, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function DonorForm({ initialData, onSubmit, onCancel, loading }: DonorFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    age: String(initialData?.age ?? ''),
    gender: initialData?.gender ?? '',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    address: initialData?.address ?? '',
    city: initialData?.city ?? '',
    bloodType: initialData?.bloodType ?? '',
    rhesus: initialData?.rhesus ?? '',
    status: initialData?.status ?? 'pending',
    // Medical history
    hasDiabetes: initialData?.medicalHistory?.hasDiabetes ?? false,
    hasHypertension: initialData?.medicalHistory?.hasHypertension ?? false,
    hasKidneyDisease: initialData?.medicalHistory?.hasKidneyDisease ?? false,
    hasHeartDisease: initialData?.medicalHistory?.hasHeartDisease ?? false,
    hasCancer: initialData?.medicalHistory?.hasCancer ?? false,
    hasHIV: initialData?.medicalHistory?.hasHIV ?? false,
    hasHepatitis: initialData?.medicalHistory?.hasHepatitis ?? false,
    currentMedications: initialData?.medicalHistory?.currentMedications ?? '',
    allergies: initialData?.medicalHistory?.allergies ?? '',
    previousSurgeries: initialData?.medicalHistory?.previousSurgeries ?? '',
    familyMedicalHistory: initialData?.medicalHistory?.familyMedicalHistory ?? '',
    notes: initialData?.medicalHistory?.notes ?? '',
  });

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender as 'male' | 'female',
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      bloodType: form.bloodType as 'A' | 'B' | 'AB' | 'O',
      rhesus: form.rhesus as '+' | '-',
      status: form.status as Donor['status'],
      medicalHistory: {
        hasDiabetes: form.hasDiabetes,
        hasHypertension: form.hasHypertension,
        hasKidneyDisease: form.hasKidneyDisease,
        hasHeartDisease: form.hasHeartDisease,
        hasCancer: form.hasCancer,
        hasHIV: form.hasHIV,
        hasHepatitis: form.hasHepatitis,
        currentMedications: form.currentMedications,
        allergies: form.allergies,
        previousSurgeries: form.previousSurgeries,
        familyMedicalHistory: form.familyMedicalHistory,
        notes: form.notes,
      },
    });
  };

  const checkboxes: { key: string; label: string }[] = [
    { key: 'hasDiabetes', label: 'Diabetes Mellitus' },
    { key: 'hasHypertension', label: 'Hipertensi' },
    { key: 'hasKidneyDisease', label: 'Penyakit Ginjal' },
    { key: 'hasHeartDisease', label: 'Penyakit Jantung' },
    { key: 'hasCancer', label: 'Kanker' },
    { key: 'hasHIV', label: 'HIV' },
    { key: 'hasHepatitis', label: 'Hepatitis B/C' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Data Pribadi</h4>
        <div className="space-y-3">
          <Input label="Nama Lengkap" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Usia" type="number" min="18" max="65" value={form.age} onChange={(e) => set('age', e.target.value)} required />
            <Select label="Jenis Kelamin" value={form.gender} onChange={(e) => set('gender', e.target.value)} required
              options={[{ value: 'male', label: 'Laki-laki' }, { value: 'female', label: 'Perempuan' }]} />
          </div>
          <Input label="No. HP" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          <Input label="Alamat" value={form.address} onChange={(e) => set('address', e.target.value)} required />
          <Input label="Kota" value={form.city} onChange={(e) => set('city', e.target.value)} required />
          <div className="grid grid-cols-3 gap-3">
            <Select label="Gol. Darah" value={form.bloodType} onChange={(e) => set('bloodType', e.target.value)} required
              options={['A','B','AB','O'].map(v => ({ value: v, label: v }))} />
            <Select label="Rhesus" value={form.rhesus} onChange={(e) => set('rhesus', e.target.value)} required
              options={[{ value: '+', label: 'Positif (+)' }, { value: '-', label: 'Negatif (-)' }]} />
            <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)} required
              options={[
                { value: 'pending', label: 'Menunggu' },
                { value: 'screening', label: 'Skrining' },
                { value: 'eligible', label: 'Eligible' },
                { value: 'assigned', label: 'Ditugaskan' },
                { value: 'rejected', label: 'Ditolak' },
              ]} />
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Riwayat Medis</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {checkboxes.map((c) => (
            <label key={c.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form[c.key as keyof typeof form] as boolean}
                onChange={(e) => set(c.key, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {c.label}
            </label>
          ))}
        </div>
        <div className="space-y-3">
          <Textarea label="Obat yang Sedang Dikonsumsi" value={form.currentMedications} onChange={(e) => set('currentMedications', e.target.value)} rows={2} placeholder="-" />
          <Textarea label="Alergi" value={form.allergies} onChange={(e) => set('allergies', e.target.value)} rows={2} placeholder="-" />
          <Textarea label="Riwayat Operasi Sebelumnya" value={form.previousSurgeries} onChange={(e) => set('previousSurgeries', e.target.value)} rows={2} placeholder="-" />
          <Textarea label="Riwayat Penyakit Keluarga" value={form.familyMedicalHistory} onChange={(e) => set('familyMedicalHistory', e.target.value)} rows={2} placeholder="-" />
          <Textarea label="Catatan Tambahan" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="-" />
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Batal</Button>
        <Button type="submit" loading={loading} className="flex-1">
          {initialData?.name ? 'Simpan Perubahan' : 'Tambah Donor'}
        </Button>
      </div>
    </form>
  );
}
