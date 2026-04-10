'use client';
import { useEffect, useState } from 'react';
import { donorDb } from '@/lib/firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import type { Donor } from '@/types';
import { DonorForm } from '@/components/forms/DonorForm';
import toast from 'react-hot-toast';

export default function DonorProfilePage() {
  const { userProfile } = useAuth();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.linkedId) {
      donorDb.get(userProfile.linkedId).then((d) => { setDonor(d); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  const handleUpdate = async (data: Omit<Donor, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!donor) return;
    setSaving(true);
    try {
      await donorDb.update(donor.id, data);
      toast.success('Profil berhasil diperbarui');
      setDonor((prev) => prev ? { ...prev, ...data } : prev);
    } catch {
      toast.error('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Memuat...</div>;
  if (!donor) return <div className="text-center py-16 text-gray-400">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <DonorForm
          initialData={donor}
          onSubmit={handleUpdate}
          onCancel={() => {}}
          loading={saving}
        />
      </div>
    </div>
  );
}
