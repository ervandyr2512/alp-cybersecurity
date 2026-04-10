'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { doctorDb } from '@/lib/firebase/database';
import type { Doctor } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DoctorForm } from '@/components/forms/DoctorForm';
import toast from 'react-hot-toast';

const specColors: Record<string, 'blue' | 'teal' | 'gray'> = {
  'SpPD-KGH': 'blue',
  Urologist: 'teal',
  Forensic: 'gray',
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editDoc, setEditDoc] = useState<Doctor | null>(null);

  const load = async () => {
    setLoading(true);
    setDoctors(await doctorDb.getAll());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = doctors.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.hospital?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Omit<Doctor, 'id' | 'userId' | 'createdAt'>) => {
    setFormLoading(true);
    try {
      await doctorDb.create(data);
      toast.success('Dokter ditambahkan');
      setShowAdd(false);
      await load();
    } catch {
      toast.error('Gagal menambahkan dokter');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: Omit<Doctor, 'id' | 'userId' | 'createdAt'>) => {
    if (!editDoc) return;
    setFormLoading(true);
    try {
      await doctorDb.update(editDoc.id, data);
      toast.success('Data dokter diperbarui');
      setEditDoc(null);
      await load();
    } catch {
      toast.error('Gagal memperbarui dokter');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (doc: Doctor) => {
    if (!confirm(`Hapus dokter ${doc.name}?`)) return;
    try {
      await doctorDb.delete(doc.id);
      toast.success('Dokter dihapus');
      await load();
    } catch {
      toast.error('Gagal menghapus dokter');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Dokter</h1>
          <p className="text-gray-500 text-sm mt-1">{doctors.length} dokter terdaftar</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Tambah Dokter
        </Button>
      </div>

      <div className="max-w-sm">
        <Input placeholder="Cari nama atau rumah sakit..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading && <p className="text-gray-400 text-sm">Memuat data...</p>}
        {!loading && filtered.length === 0 && <p className="text-gray-400 text-sm">Tidak ada dokter ditemukan.</p>}
        {filtered.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                {doc.name.split(' ').slice(-1)[0]?.charAt(0) ?? 'D'}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditDoc(doc)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(doc)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{doc.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{doc.hospital}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={specColors[doc.specialization] ?? 'gray'}>{doc.specialization}</Badge>
              {doc.isActive
                ? <Badge variant="green">Aktif</Badge>
                : <Badge variant="red">Tidak Aktif</Badge>
              }
            </div>
            {doc.bio && <p className="text-xs text-gray-400 mt-3 line-clamp-2">{doc.bio}</p>}
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Dokter Baru">
        <DoctorForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={formLoading} />
      </Modal>
      <Modal open={!!editDoc} onClose={() => setEditDoc(null)} title="Edit Data Dokter">
        {editDoc && <DoctorForm initialData={editDoc} onSubmit={handleUpdate} onCancel={() => setEditDoc(null)} loading={formLoading} />}
      </Modal>
    </div>
  );
}
