/**
 * Página de login del administrador
 * @celula - Celula1
 */

'use client';

import { LoginForm } from '@/components/ui/login/LoginForm';

export default function AdminLoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <LoginForm
        role="admin"
        subtitle="Acceso exclusivo para administradores del sistema Raíz Viva"
      />
    </main>
  );
}
