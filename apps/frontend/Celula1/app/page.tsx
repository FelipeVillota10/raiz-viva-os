'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Experiencias } from "./components/Experiencias";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { useAuth } from "./hooks/useAuth";

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
        <p className="text-white">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-[#557149]">
      <Header />
      <Hero />
      <Experiencias />
      <Footer />
    </main>
  );
}