'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, UserCheck,
  FlaskConical, Heart, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

const navByRole: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  admin: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/donors', label: 'Donor', icon: Users },
    { href: '/dashboard/admin/doctors', label: 'Dokter', icon: UserCheck },
    { href: '/dashboard/admin/hospitals', label: 'Rumah Sakit', icon: Building2 },
  ],
  doctor: [
    { href: '/dashboard/doctor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/doctor/screenings', label: 'Skrining', icon: UserCheck },
  ],
  hospital_staff: [
    { href: '/dashboard/hospital', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/hospital/records', label: 'Rekam Medis', icon: FlaskConical },
    { href: '/dashboard/hospital/donors', label: 'Donor Ditugaskan', icon: Users },
  ],
  donor: [
    { href: '/dashboard/donor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/donor/profile', label: 'Profil Saya', icon: Heart },
    { href: '/dashboard/donor/records', label: 'Hasil Pemeriksaan', icon: FlaskConical },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !userProfile) {
      router.replace('/login');
    }
  }, [loading, userProfile, router]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Berhasil keluar');
    router.push('/');
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Heart className="h-10 w-10 text-blue-600 animate-pulse" />
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  const navItems = navByRole[userProfile.role] ?? navByRole.donor;
  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    doctor: 'Dokter',
    hospital_staff: 'Staf Rumah Sakit',
    donor: 'Calon Donor',
  };

  const Sidebar = () => (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-blue-700">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <span>kidney<span className="text-teal-600">hub</span><span className="text-gray-400 font-normal text-sm">.id</span></span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {userProfile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userProfile.name}</p>
            <p className="text-xs text-gray-500">{roleLabel[userProfile.role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard/' + userProfile.role && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon size={18} className={active ? 'text-blue-600' : 'text-gray-400'} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto text-blue-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-50">
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center gap-1.5 font-bold text-blue-700">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            kidneyhub.id
          </Link>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {userProfile.name.charAt(0)}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
