/**
 * Página de login del líder
 * @celula - Celula1
 */

'use client';

import { Footer } from '@/components/shared/Footer';
import { LoginForm } from '@/components/ui/login/LoginForm';

export default function LiderLoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <LoginForm
          role="lider"
          subtitle="Conectando comunidades rurales, productores y viajeros para un desarrollo territorial sostenible"
        />
      </main>

      <Footer />
    </div>
  );
}
