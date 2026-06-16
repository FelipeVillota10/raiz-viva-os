/**
 * Página de login
 * @celula - Celula1
 */

'use client';

import { AppHeader } from '@/components/shared/AppHeader';
import { Footer } from '@/components/shared/Footer';
import { LoginForm } from '@/components/ui/login/LoginForm';

export default function LoginInicioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <AppHeader backRoute="/" title="Iniciar Sesión" />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <LoginForm role="general" showForgotPassword showCreateAccount />
      </main>

      <Footer />
    </div>
  );
}
