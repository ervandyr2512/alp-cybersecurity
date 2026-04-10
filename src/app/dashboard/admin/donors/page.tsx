'use client';
import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { donorDb } from '@/lib/firebase/database';
import type { Donor } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DonorStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DonorForm } from '@/components/forms/DonorForm';
import toast from 'react-hot-toast';

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editDonor, setEditDonor] = useState<Donor | null>(null);
  const [viewDonor, setViewDonor] = useState<Donor | null>(null);

  const load = async () => {
    setLoading(true);
    setDonors(await donorDb.getAll());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = donors.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.city?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Omit<Donor, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setFormLoading(true);
    try {
      await donorDb.create({ ...data, userId: 'admin-created' });
      toast.success('Donor berhasil ditambahkan');
      setShowAdd(false);
      await load();
    } catch {
      toast.error('Gagal menambahkan donor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: Omit<Donor, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editDonor) return;
    setFormLoading(true);
    try {
      await donorDb.update(editDonor.id, data);
      toast.success('Data donor diperbarui');
      setEditDonor(null);
      await load();
    } catch {
      toast.error('Gagal memperbarui donor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (donor: Donor) => {
    if (!confirm(`Hapus donor ${donor.name}?`)) return;
    try {
      await donorDb.delete(donor.id);
      toast.success('Donor dihapus');
      await load();
    } catch {
      toast.error('Gagal menghapus donor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Donor</h1>
          <p className="text-gray-500 text-sm mt-1">{donors.length} donor terdaftar</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Tambah Donor
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Cari nama, kota, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                {['Nama', 'Usia / Jenis Kelamin', 'Kota', 'Gol. Darah', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Memuat data...</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Tidak ada donor ditemukan.</td>
                </tr>
              )}
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm">{d.name}</div>
                    <div className="text-xs text-gray-400">{d.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {d.age} thn / {d.gender === 'male' ? 'L' : 'P'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.city}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.bloodType}{d.rhesus}</td>
                  <td className="px-4 py-3">
                    <DonorStatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewDonor(d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat detail">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => setEditDonor(d)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(d)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Donor Baru" size="lg">
        <DonorForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={formLoading} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editDonor} onClose={() => setEditDonor(null)} title="Edit Data Donor" size="lg">
        {editDonor && (
          <DonorForm initialData={editDonor} onSubmit={handleUpdate} onCancel={() => setEditDonor(null)} loading={formLoading} />
        )}
      </Modal>

      {/* View modal */}
      <Modal open={!!viewDonor} onClose={() => setViewDonor(null)} title="Detail Donor" size="md">
        {viewDonor && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nama', value: viewDonor.name },
                { label: 'Usia', value: `${viewDonor.age} tahun` },
                { label: 'Jenis Kelamin', value: viewDonor.gender === 'male' ? 'Laki-laki' : 'Perempuan' },
                { label: 'Gol. Darah', value: `${viewDonor.bloodType}${viewDonor.rhesus}` },
                { label: 'Telepon', value: viewDonor.phone },
                { label: 'Email', value: viewDonor.email },
                { label: 'Kota', value: viewDonor.city },
                { label: 'Status', value: viewDonor.status },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
                  <p className="font-medium text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Alamat</p>
              <p className="text-gray-700">{viewDonor.address}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Riwayat Medis</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(viewDonor.medicalHistory ?? {})
                  .filter(([k, v]) => typeof v === 'boolean' && v)
                  .map(([k]) => (
                    <span key={k} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-md">
                      {k.replace(/^has/, '')}
                    </span>
                  ))}
                {!Object.values(viewDonor.medicalHistory ?? {}).some((v) => v === true) && (
                  <span className="text-gray-500 text-xs">Tidak ada riwayat penyakit signifikan</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
