'use client';
// ============================================================
// /demo/authz — Authorization scenarios playground.
// Shows how RBAC, ABAC, and the combination affect each endpoint
// based on the logged-in user's role and attributes.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldX, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';
import { signOut } from '@/lib/firebase/auth';

interface Scenario {
  id: string;
  label: string;
  description: string;
  mechanism: 'JWT' | 'RBAC' | 'ABAC' | 'RBAC+ABAC';
  call: () => Promise<{ status: number; body: unknown }>;
}

function asJson(x: unknown): string {
  return JSON.stringify(x, null, 2);
}

export default function AuthzDemoPage() {
  const { firebaseUser, userProfile, loading } = useAuth();
  const [results, setResults] = useState<Record<string, { status: number; body: unknown; ts: string }>>({});
  const [running, setRunning] = useState<string | null>(null);

  const fire = async (s: Scenario) => {
    setRunning(s.id);
    const result = await s.call();
    setResults((prev) => ({
      ...prev,
      [s.id]: { ...result, ts: new Date().toLocaleTimeString('id-ID') },
    }));
    setRunning(null);
  };

  const scenarios: Scenario[] = [
    {
      id: 'jwt-me',
      label: 'Decode JWT access token (/api/auth/me)',
      description: 'Membuktikan Firebase ID token adalah JWT yang tervalidasi di server (RS256).',
      mechanism: 'JWT',
      call: async () => {
        const r = await apiFetch('/api/auth/me');
        return { status: r.status, body: r.body };
      },
    },
    {
      id: 'rbac-list-doctors',
      label: 'List all doctors (/api/doctors) — RBAC',
      description: 'Hanya admin & hospital_staff yang diizinkan. Donor dan doctor → 403.',
      mechanism: 'RBAC',
      call: async () => {
        const r = await apiFetch('/api/doctors');
        return { status: r.status, body: r.body };
      },
    },
    {
      id: 'rbac-list-hospitals',
      label: 'List hospitals (/api/hospitals) — RBAC (open to all authenticated)',
      description: 'Semua user login dapat melihat daftar rumah sakit.',
      mechanism: 'RBAC',
      call: async () => {
        const r = await apiFetch('/api/hospitals');
        return { status: r.status, body: r.body };
      },
    },
    {
      id: 'abac-own-donors',
      label: 'List donors I can see (/api/donors) — ABAC filter',
      description:
        'Donor hanya lihat data sendiri; hospital_staff hanya lihat donor yg assignedHospitalId-nya cocok; doctor & admin lihat semua.',
      mechanism: 'ABAC',
      call: async () => {
        const r = await apiFetch('/api/donors');
        return { status: r.status, body: r.body };
      },
    },
    {
      id: 'abac-medical-records',
      label: 'List medical records (/api/medical-records) — ABAC filter',
      description:
        'Donor → rekam medis miliknya; hospital_staff → difilter sesuai linkedId == record.hospitalId.',
      mechanism: 'ABAC',
      call: async () => {
        const r = await apiFetch('/api/medical-records');
        return { status: r.status, body: r.body };
      },
    },
    {
      id: 'rbac-abac-create-hospital',
      label: 'Create hospital (/api/hospitals) — RBAC+ABAC test',
      description:
        'Coba POST ke /api/hospitals dengan data dummy. Hanya admin yang lulus (RBAC).',
      mechanism: 'RBAC',
      call: async () => {
        const r = await apiFetch('/api/hospitals', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Demo Hospital ' + Date.now(),
            address: 'Jl. Demo',
            city: 'Jakarta',
            phone: '021-0000000',
            email: 'demo@hospital.test',
            capacity: 5,
            currentLoad: 0,
            isActive: true,
            facilities: ['dialysis'],
          }),
        });
        return { status: r.status, body: r.body };
      },
    },
    {
      id: 'rbac-abac-create-doctor',
      label: 'Create doctor (/api/doctors) — RBAC-only (admin)',
      description: 'Hanya admin yang boleh membuat dokter.',
      mechanism: 'RBAC',
      call: async () => {
        const r = await apiFetch('/api/doctors', {
          method: 'POST',
          body: JSON.stringify({
            name: 'dr. Demo ' + Date.now(),
            specialization: 'SpPD-KGH',
            hospital: 'RS Demo',
            phone: '08123',
            email: 'demo@dr.test',
            licenseNumber: 'DEMO-' + Date.now(),
            isActive: true,
          }),
        });
        return { status: r.status, body: r.body };
      },
    },
    {
      id: 'no-token',
      label: 'Call /api/donors with NO token — JWT rejection',
      description: 'Request tanpa header Authorization harus ditolak dengan 401.',
      mechanism: 'JWT',
      call: async () => {
        const r = await fetch('/api/donors');
        let body;
        try { body = await r.json(); } catch { body = {}; }
        return { status: r.status, body };
      },
    },
  ];

  if (loading) {
    return <div className="p-10 text-gray-500">Memuat...</div>;
  }

  if (!firebaseUser || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
          <Lock className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Butuh login</h1>
          <p className="text-sm text-gray-500 mb-6">
            Halaman demo otorisasi hanya dapat diakses oleh pengguna yang sudah login. Token JWT dibutuhkan untuk setiap panggilan API.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
            <LogIn className="h-4 w-4" /> Masuk dulu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Authorization Demo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Halaman ini menunjukkan penerapan JWT, RBAC, ABAC, dan gabungan RBAC+ABAC di aplikasi.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">UID</div>
              <div className="font-mono text-xs break-all">{firebaseUser.uid}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">Email</div>
              <div className="font-medium">{userProfile.email}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">Role (RBAC)</div>
              <div className="font-medium text-blue-700">{userProfile.role}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">linkedId (ABAC atribut)</div>
              <div className="font-mono text-xs">{userProfile.linkedId ?? '—'}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => signOut().then(() => (window.location.href = '/login'))}
              className="text-xs bg-gray-200 hover:bg-gray-300 rounded px-3 py-1.5"
            >
              Logout &amp; ganti akun
            </button>
            <Link href="/login" className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded px-3 py-1.5">
              Login sebagai user lain
            </Link>
          </div>
        </header>

        <section className="space-y-3">
          {scenarios.map((s) => {
            const r = results[s.id];
            const pass = r?.status && r.status < 400;
            return (
              <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-center gap-2">
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {s.mechanism}
                      </span>
                      <h3 className="font-semibold text-gray-900">{s.label}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                  </div>
                  <button
                    onClick={() => fire(s)}
                    disabled={running === s.id}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg px-4 py-2"
                  >
                    {running === s.id ? 'Memanggil…' : 'Panggil'}
                  </button>
                </div>

                {r && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      {pass ? (
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${pass ? 'text-green-700' : 'text-red-700'}`}>
                        HTTP {r.status} {pass ? 'ALLOWED' : 'DENIED'}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">{r.ts}</span>
                    </div>
                    <pre className="text-xs bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto max-h-64">
{asJson(r.body)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <footer className="text-xs text-gray-400 text-center py-4">
          alp-cybersecurity · ALP Sistem Otorisasi
        </footer>
      </div>
    </div>
  );
}
