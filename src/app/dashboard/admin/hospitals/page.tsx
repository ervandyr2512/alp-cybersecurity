'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { hospitalDb } from '@/lib/firebase/database';
import type { Hospital } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { HospitalForm } from '@/components/forms/HospitalForm';
import toast from 'react-hot-toast';

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editHosp, setEditHosp] = useState<Hospital | null>(null);

  const load = async () => {
    setLoading(true);
    setHospitals(await hospitalDb.getAll());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data: Omit<Hospital, 'id' | 'createdAt'>) => {
    setFormLoading(true);
    try {
      await hospitalDb.create(data);
      toast.success('Rumah sakit ditambahkan');
      setShowAdd(false);
      await load();
    } catch { toast.error('Gagal menambahkan'); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async (data: Omit<Hospital, 'id' | 'createdAt'>) => {
    if (!editHosp) return;
    setFormLoading(true);
    try {
      await hospitalDb.update(editHosp.id, data);
      toast.success('Data diperbarui');
      setEditHosp(null);
      await load();
    } catch { toast.error('Gagal memperbarui'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (h: Hospital) => {
    if (!confirm(`Hapus ${h.name}?`)) return;
    try {
      await hospitalDb.delete(h.id);
      toast.success('Dihapus');
      await load();
    } catch { toast.error('Gagal menghapus'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Rumah Sakit</h1>
          <p className="text-gray-500 text-sm">{hospitals.length} rumah sakit terdaftar</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={16} /> Tambah Rumah Sakit</Button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Memuat...</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {hospitals.map((h) => (
          <div key={h.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-900">{h.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => setEditHosp(h)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(h)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-gray-600 mb-3">
              <div className="flex items-start gap-2"><MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />{h.address}, {h.city}</div>
              <div className="flex items-center gap-2"><Phone size={13} className="text-gray-400" />{h.phone}</div>
              <div className="flex items-center gap-2"><Mail size={13} className="text-gray-400" />{h.email}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={h.isActive ? 'green' : 'red'}>{h.isActive ? 'Aktif' : 'Tidak Aktif'}</Badge>
              <span className="text-xs text-gray-500">Kapasitas: {h.capacity}/tahun</span>
              <span className="text-xs text-gray-500">Beban: {h.currentLoad}</span>
            </div>
            {h.facilities?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {h.facilities.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md">{f}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Rumah Sakit Baru" size="lg">
        <HospitalForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={formLoading} />
      </Modal>
      <Modal open={!!editHosp} onClose={() => setEditHosp(null)} title="Edit Rumah Sakit" size="lg">
        {editHosp && <HospitalForm initialData={editHosp} onSubmit={handleUpdate} onCancel={() => setEditHosp(null)} loading={formLoading} />}
      </Modal>
    </div>
  );
}
