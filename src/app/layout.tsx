import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'KidneyHub.id — Registri Donor Ginjal Nasional Indonesia',
    template: '%s | KidneyHub.id',
  },
  description:
    'Platform terpusat untuk registrasi donor ginjal, skrining medis, dan koordinasi rumah sakit di Indonesia.',
  keywords: ['donor ginjal', 'transplantasi ginjal', 'Indonesia', 'registri donor'],
  authors: [{ name: 'KidneyHub.id' }],
  metadataBase: new URL('https://kidneyhub.id'),
  openGraph: {
    siteName: 'KidneyHub.id',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-gray-50">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: '14px', borderRadius: '10px' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
