'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const contactInfo = [
  { icon: MapPin, label: 'Alamat', value: 'Jakarta, Indonesia' },
  { icon: Mail, label: 'Email', value: 'info@kidneyhub.id' },
  { icon: Phone, label: 'Telepon', value: '+62 21 1234 5678' },
  { icon: Clock, label: 'Jam Kerja', value: 'Senin–Jumat, 08.00–17.00 WIB' },
];

export default function KontakKamiPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending (in production: integrate email service)
    await new Promise((r) => setTimeout(r, 1200));
    toast.success('Pesan berhasil dikirim! Kami akan merespons dalam 1–2 hari kerja.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Kontak Kami</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Ada pertanyaan? Tim kami siap membantu. Hubungi kami melalui formulir di bawah atau informasi kontak yang tersedia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact info */}
        <div className="lg:col-span-2 space-y-5">
          {contactInfo.map((c) => (
            <div key={c.label} className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <c.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{c.label}</p>
                <p className="text-sm text-gray-800">{c.value}</p>
              </div>
            </div>
          ))}

          <div className="bg-blue-600 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-2">Untuk Kasus Darurat Medis</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Hubungi langsung unit transplantasi ginjal di rumah sakit mitra terdekat.
              KidneyHub.id bukan layanan gawat darurat.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Kirim Pesan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                placeholder="Nama Anda"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                placeholder="email@anda.com"
              />
            </div>
            <Select
              label="Subjek"
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              required
              options={[
                { value: 'donor_info', label: 'Informasi Donasi Ginjal' },
                { value: 'registration', label: 'Bantuan Pendaftaran' },
                { value: 'medical', label: 'Pertanyaan Medis' },
                { value: 'hospital', label: 'Kerjasama Rumah Sakit' },
                { value: 'other', label: 'Lainnya' },
              ]}
            />
            <Textarea
              label="Pesan"
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              required
              placeholder="Tuliskan pesan Anda di sini..."
              rows={5}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              <Send size={16} />
              Kirim Pesan
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
