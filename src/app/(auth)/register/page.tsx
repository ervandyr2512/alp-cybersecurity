'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { registerUser } from '@/lib/firebase/auth';
import { donorDb, screeningDb } from '@/lib/firebase/database';
import { ref, update } from 'firebase/database';
import { db as _db } from '@/lib/firebase/config';
const db = _db!;
import { DB_PATHS } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    city: '',
    bloodType: '',
    rhesus: '',
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Password tidak cocok.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Register Firebase user
      const fbUser = await registerUser(form.email, form.password, form.name, 'donor');

      // 2. Create donor record
      const donorId = await donorDb.create({
        userId: fbUser.uid,
        name: form.name,
        age: parseInt(form.age),
        gender: form.gender as 'male' | 'female',
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        bloodType: form.bloodType as 'A' | 'B' | 'AB' | 'O',
        rhesus: form.rhesus as '+' | '-',
        status: 'pending',
        medicalHistory: {
          hasDiabetes: false,
          hasHypertension: false,
          hasKidneyDisease: false,
          hasHeartDisease: false,
          hasCancer: false,
          hasHIV: false,
          hasHepatitis: false,
          currentMedications: '',
          allergies: '',
          previousSurgeries: '',
          familyMedicalHistory: '',
          notes: '',
        },
      });

      // 3. Auto-create 3 pending screenings (satu per spesialisasi dokter)
      const specializations = [
        { type: 'SpPD-KGH', label: 'Spesialis Penyakit Dalam - Konsultan Ginjal Hipertensi' },
        { type: 'Urologist', label: 'Urolog' },
        { type: 'Forensic', label: 'Dokter Forensik' },
      ] as const;
      await Promise.all(
        specializations.map((sp) =>
          screeningDb.create({
            donorId,
            donorName: form.name,
            doctorId: '',
            doctorName: `Menunggu dokter ${sp.label}`,
            doctorType: sp.type,
            status: 'pending',
            result: 'pending',
            notes: '',
            scheduledAt: '',
          })
        )
      );

      // 4. Update donor status to 'screening' dan update status donor
      await donorDb.update(donorId, { status: 'screening' });

      // 5. Link donorId to user profile
      await update(ref(db, `${DB_PATHS.USERS}/${fbUser.uid}`), { linkedId: donorId });

      setEmailSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftar';
      if (msg.includes('email-already-in-use')) {
        toast.error('Email sudah terdaftar. Silakan login.');
      } else {
        toast.error('Pendaftaran gagal. Coba lagi.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Email</h2>
          <p className="text-gray-600 mb-2">
            Kami telah mengirimkan link verifikasi ke <strong>{form.email}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Silakan cek kotak masuk (dan folder spam) Anda, lalu klik link verifikasi untuk mengaktifkan akun.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full" size="lg">
            Lanjut ke Halaman Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-blue-700">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <span>kidney<span className="text-teal-600">hub</span><span className="text-gray-400 font-normal">.id</span></span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Daftar sebagai Calon Donor Ginjal</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 px-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {s}
              </div>
              <span className={`text-xs ${step >= s ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? 'Akun' : 'Data Diri'}
              </span>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-blue-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <h3 className="font-semibold text-gray-900">Buat Akun</h3>
              <Input label="Nama Lengkap" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Dr. Budi Santoso" />
              <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="nama@email.com" />
              <div className="relative">
                <Input label="Password" type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} required placeholder="Minimal 6 karakter" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-gray-400" tabIndex={-1}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input label="Konfirmasi Password" type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} required placeholder="Ulangi password" />
              <Button type="submit" className="w-full" size="lg">Lanjut</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold text-gray-900">Data Diri</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Usia" type="number" min="18" max="65" value={form.age} onChange={(e) => set('age', e.target.value)} required placeholder="25" />
                <Select
                  label="Jenis Kelamin"
                  value={form.gender}
                  onChange={(e) => set('gender', e.target.value)}
                  required
                  options={[{ value: 'male', label: 'Laki-laki' }, { value: 'female', label: 'Perempuan' }]}
                />
              </div>
              <Input label="No. HP" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required placeholder="+62812..." />
              <Input label="Alamat" value={form.address} onChange={(e) => set('address', e.target.value)} required placeholder="Jl. Sudirman No. 1" />
              <Input label="Kota" value={form.city} onChange={(e) => set('city', e.target.value)} required placeholder="Jakarta" />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Golongan Darah"
                  value={form.bloodType}
                  onChange={(e) => set('bloodType', e.target.value)}
                  required
                  options={['A', 'B', 'AB', 'O'].map((v) => ({ value: v, label: v }))}
                />
                <Select
                  label="Rhesus"
                  value={form.rhesus}
                  onChange={(e) => set('rhesus', e.target.value)}
                  required
                  options={[{ value: '+', label: 'Positif (+)' }, { value: '-', label: 'Negatif (-)' }]}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Kembali</Button>
                <Button type="submit" loading={loading} className="flex-1" size="lg">Daftar Sekarang</Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
