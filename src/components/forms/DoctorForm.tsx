'use client';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { Doctor } from '@/types';
import { useState } from 'react';

interface DoctorFormProps {
  initialData?: Partial<Doctor>;
  onSubmit: (data: Omit<Doctor, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function DoctorForm({ initialData, onSubmit, onCancel, loading }: DoctorFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    specialization: initialData?.specialization ?? '',
    hospital: initialData?.hospital ?? '',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    licenseNumber: initialData?.licenseNumber ?? '',
    isActive: initialData?.isActive ?? true,
    bio: initialData?.bio ?? '',
  });

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={async (e) => { e.preventDefault(); await onSubmit({ ...form, specialization: form.specialization as Doctor['specialization'] }); }} className="space-y-4">
      <Input label="Nama Lengkap Dokter" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Dr. Nama Dokter, SpPD-KGH" />
      <Select
        label="Spesialisasi"
        value={form.specialization}
        onChange={(e) => set('specialization', e.target.value)}
        required
        options={[
          { value: 'SpPD-KGH', label: 'SpPD-KGH (Nefrolog / Hipertensi)' },
          { value: 'Urologist', label: 'Urolog' },
          { value: 'Forensic', label: 'Dokter Forensik' },
        ]}
      />
      <Input label="Rumah Sakit" value={form.hospital} onChange={(e) => set('hospital', e.target.value)} required placeholder="Nama rumah sakit" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="No. HP" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
      </div>
      <Input label="No. SIP (Surat Izin Praktik)" value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} required placeholder="SIP-XXXXXX" />
      <Textarea label="Biografi Singkat" value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Pengalaman dan keahlian dokter..." />
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
        Dokter aktif
      </label>
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Batal</Button>
        <Button type="submit" loading={loading} className="flex-1">
          {initialData?.name ? 'Simpan Perubahan' : 'Tambah Dokter'}
        </Button>
      </div>
    </form>
  );
}
