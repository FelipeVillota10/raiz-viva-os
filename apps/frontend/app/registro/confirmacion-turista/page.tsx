'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/base/Button';
import { CheckCircleIcon } from '@/components/ui/base/Icons';
import { AppHeader } from '@/components/shared/AppHeader';
import { Footer } from '@/components/shared/Footer';

export default function ConfirmacionTuristaPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <AppHeader backRoute="/" title="Registro Exitoso" />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-[#3E853F] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="text-white" size={48} />
          </div>

          <h1 className="text-3xl font-bold text-[#231F20] mb-4">
            ¡Registro Exitoso!
          </h1>

          <p className="text-lg text-[#353535] mb-6">
            Tu cuenta ha sido creada correctamente.
          </p>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E6D3A3] mb-8">
            <p className="text-[#353535]">
              Ya puedes iniciar sesión con tus credenciales.
            </p>
          </div>

          <Button onClick={() => router.push('/login/inicio')} size="lg" className="w-full">
            Iniciar Sesión
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
