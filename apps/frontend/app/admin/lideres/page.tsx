/**
 * Página de líderes del admin (View)
 * @celula - Celula1
 * Vista que utiliza useAdminLideres y useAdminAuth como ViewModels.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminLideres } from '@/hooks/useAdminLideres';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LiderCard } from '@/components/ui/gestionarlider/LiderCard';
import { EmptyState } from '@/components/ui/base/EmptyState';
import { ErrorBanner } from '@/components/ui/base/ErrorBanner';
import { LoadingState } from '@/components/ui/base/LoadingState';

export default function LideresPage() {
  const router = useRouter();
  const { lideres, loading, error, fetchLideres } = useAdminLideres();
  const { checkAuth } = useAdminAuth();

  useEffect(() => {
    if (!checkAuth()) return;
    fetchLideres();
  }, [checkAuth, fetchLideres]);

  if (loading) return <LoadingState message="Cargando lideres..." />;

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#557149] mb-2">Líderes</h1>
          <p className="text-[#353535]">Gestiona los líderes territoriales registrados en el sistema</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/lideres/nuevo')}
          className="bg-[#3b5630] hover:bg-[#2d6530] text-white font-semibold px-5 py-2.5 rounded-full transition"
        >
          Nuevo Líder
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {lideres.length === 0 ? (
        <EmptyState message="No hay líderes registrados." />
      ) : (
        <div className="space-y-4">
          {lideres.map((lider) => (
            <LiderCard
              key={lider.id_cliente}
              lider={lider}
              onClick={() => router.push(`/admin/lideres/${lider.id_cliente}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
