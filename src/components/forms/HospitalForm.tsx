'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import type { Hospital } from '@/types';

interface HospitalFormProps {
  initialData?: Partial<Hospital>;
  onSubmit: (data: Omit<Hospital, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function HospitalForm({ initialData, onSubmit, onCancel, loading }: HospitalFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    address: initialData?.address ?? '',
    city: initialData?.city ?? '',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    website: initialData?.website ?? '',
    capacity: String(initialData?.capacity ?? ''),
    currentLoad: String(initialData?.currentLoad ?? '0'),
    isActive: initialData?.isActive ?? true,
    facilities: (initialData?.facilities ?? []).join(', '),
  });

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: form.name,
      address: form.address,
      city: form.city,
      phone: form.phone,
      email: form.email,
      website: form.website,
      capacity: parseInt(form.capacity) || 0,
      currentLoad: parseInt(form.currentLoad) || 0,
      isActive: form.isActive,
      facilities: form.facilities.split(',').map((f) => f.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nama Rumah Sakit" value={form.name} onChange={(e) => set('name', e.target.value)} required />
      <Textarea label="Alamat" value={form.address} onChange={(e) => set('address', e.target.value)} required rows={2} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Kota" value={form.city} onChange={(e) => set('city', e.target.value)} required />
        <Input label="Website" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="rs.example.com" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="No. Telepon" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Kapasitas (donor/tahun)" type="number" min="0" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} required />
        <Input label="Beban Saat Ini" type="number" min="0" value={form.currentLoad} onChange={(e) => set('currentLoad', e.target.value)} />
      </div>
      <Input label="Fasilitas (pisahkan dengan koma)" value={form.facilities} onChange={(e) => set('facilities', e.target.value)} placeholder="Nefrologi, Urologi, ICU" />
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
        Rumah sakit aktif
      </label>
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Batal</Button>
        <Button type="submit" loading={loading} className="flex-1">
          {initialData?.name ? 'Simpan Perubahan' : 'Tambah Rumah Sakit'}
        </Button>
      </div>
    </form>
  );
}
