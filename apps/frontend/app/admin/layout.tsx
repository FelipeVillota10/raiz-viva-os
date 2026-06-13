/**
 * Layout del administrador
 * @celula - Celula1
 */

import { AppHeader } from '@/components/shared/AppHeader';
import { Footer } from '@/components/shared/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <AppHeader role="admin" />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
