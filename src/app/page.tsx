// Root page — render public layout + home content
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import HomePage from './(public)/home/page';

export { metadata } from './(public)/home/page';

export default function RootPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HomePage />
      </main>
      <Footer />
    </>
  );
}
