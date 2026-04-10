import Link from 'next/link';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <Heart className="h-6 w-6 text-red-400 fill-red-400" />
              <span>kidney<span className="text-teal-400">hub</span><span className="text-gray-500 font-normal">.id</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Registri donor ginjal nasional Indonesia. Menghubungkan donor, dokter, dan rumah sakit untuk menyelamatkan lebih banyak jiwa.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2">
              {[
                { href: '/rumah-sakit', label: 'Rumah Sakit' },
                { href: '/dokter-kami', label: 'Dokter Kami' },
                { href: '/informasi', label: 'Informasi' },
                { href: '/register', label: 'Daftar Donor' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Tentang</h4>
            <ul className="space-y-2">
              {[
                { href: '/tentang-kami', label: 'Tentang Kami' },
                { href: '/kontak-kami', label: 'Kontak Kami' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Kontak</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-teal-400" />
                Jakarta, Indonesia
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0 text-teal-400" />
                info@kidneyhub.id
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0 text-teal-400" />
                +62 21 1234 5678
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} kidneyhub.id — Hak cipta dilindungi
          </p>
          <p className="text-xs text-gray-500">
            Dibuat untuk Indonesia &bull; Donor ginjal menyelamatkan nyawa
          </p>
        </div>
      </div>
    </footer>
  );
}
