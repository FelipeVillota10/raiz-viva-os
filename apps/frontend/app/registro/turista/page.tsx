/**
 * Página de registro turista
 * @celula - Celula1
 */

'use client';

import { AppHeader } from '@/components/shared/AppHeader';
import { Footer } from '@/components/shared/Footer';
import { TuristaForm } from '@/components/ui/registro/TuristaForm';

export default function RegistroTuristaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <AppHeader backRoute="/registro" title="Registro Turista" />

      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-10 lg:py-14">
        <div className="max-w-5xl mx-auto">
          <header className="text-center lg:text-left mb-8 lg:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#231F20] tracking-tight">
              Registro del turista
            </h1>
            <p className="mt-2 text-lg text-[#353535] max-w-2xl mx-auto lg:mx-0">
              Completa el formulario para unirte a la red.
            </p>
          </header>

          <TuristaForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
