'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Heart, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import toast from 'react-hot-toast';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/rumah-sakit', label: 'Rumah Sakit' },
  { href: '/dokter-kami', label: 'Dokter Kami' },
  { href: '/informasi', label: 'Informasi' },
  { href: '/tentang-kami', label: 'Tentang Kami' },
  { href: '/kontak-kami', label: 'Kontak Kami' },
];

const roleDashboardPath: Record<string, string> = {
  admin: '/dashboard/admin',
  doctor: '/dashboard/doctor',
  hospital_staff: '/dashboard/hospital',
  donor: '/dashboard/donor',
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Berhasil keluar');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navigasi utama">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700">
            <Heart className="h-7 w-7 text-red-500 fill-red-500" />
            <span>kidney<span className="text-teal-600">hub</span><span className="text-gray-400 font-normal">.id</span></span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-2">
            {!loading && !userProfile && (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Daftar Donor
                </Link>
              </>
            )}
            {!loading && userProfile && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{userProfile.name}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                    <Link
                      href={roleDashboardPath[userProfile.role] || '/dashboard/donor'}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={15} /> Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-2">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-sm font-medium',
                      pathname === link.href ? 'text-blue-700 bg-blue-50' : 'text-gray-600'
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {!userProfile && (
              <div className="flex flex-col gap-2 mt-3 px-1">
                <Link href="/login" className="text-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600" onClick={() => setMenuOpen(false)}>
                  Masuk
                </Link>
                <Link href="/register" className="text-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg" onClick={() => setMenuOpen(false)}>
                  Daftar Donor
                </Link>
              </div>
            )}
            {userProfile && (
              <div className="mt-3 px-1 flex flex-col gap-1">
                <Link href={roleDashboardPath[userProfile.role] || '/dashboard/donor'} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50">
                  <LogOut size={15} /> Keluar
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
