'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { CheckCircleIcon } from '../../components/ui/Icons';
import { HeaderSecundario } from '../../components/HeaderSecundario';
import { Footer } from '../../components/Footer';

export default function ConfirmacionPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <HeaderSecundario backRoute="/" title="Confirmación" />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-[#3E853F] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="text-white" size={48} />
          </div>

          <h1 className="text-3xl font-bold text-[#231F20] mb-4">
            ¡Solicitud Enviada con Éxito!
          </h1>

          <p className="text-lg text-[#353535] mb-6">
            En próximas horas su solicitud de registro será atendida.
          </p>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E6D3A3] mb-8">
            <p className="text-[#353535]">
              Se ha enviado información a su correo electrónico.
            </p>
          </div>

          <Button onClick={() => router.push('/')} size="lg" className="w-full">
            Volver al Inicio
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}