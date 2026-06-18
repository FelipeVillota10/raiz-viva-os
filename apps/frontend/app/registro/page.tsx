/**
 * Página de selección de registro
 * @celula - Celula1
 * Vista que renderiza el componente RoleSelector.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { RoleSelector } from '@/components/ui/registro/RoleSelector';
import { AppHeader } from '@/components/shared/AppHeader';
import { Footer } from '@/components/shared/Footer';

export default function RegistroPage() {
  const [backRoute, setBackRoute] = useState('/');

  useEffect(() => {
    const referrer = document.referrer;
    if (referrer.includes('/login/inicio')) {
      setBackRoute('/login/inicio');
    } else {
      setBackRoute('/');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <AppHeader backRoute={backRoute} title="Registro" />
      <main className="flex-1">
        <RoleSelector />
      </main>
      <Footer />
    </div>
  );
}
