/**
 * Página principal
 * @celula - Celula1
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Experiencias } from "@/components/shared/Experiencias";
import { Footer } from "@/components/shared/Footer";
import { AppHeader } from "@/components/shared/AppHeader";
import { Hero } from "@/components/shared/Hero";
import { LoadingState } from "@/components/ui/base/LoadingState";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLider, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && isLider) {
      router.push('/lider/aprobaciones');
    }
  }, [loading, isAuthenticated, isLider, router]);

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-[#557149] items-center justify-center">
        <LoadingState message="Cargando..." className="text-white" />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-[#557149]">
      <AppHeader role="public" />
      <Hero />
      <Experiencias />
      <Footer />
    </main>
  );
}
