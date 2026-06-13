/**
 * Página de territorios del admin (View)
 * @celula - Celula1
 * Vista que utiliza useAdminTerritorios y useAdminAuth como ViewModels.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminTerritorios } from '@/hooks/useAdminTerritorios';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { TerritorioCard } from '@/components/ui/gestionarterritorio/TerritorioCard';
import { EmptyState } from '@/components/ui/base/EmptyState';
import { ErrorBanner } from '@/components/ui/base/ErrorBanner';
import { LoadingState } from '@/components/ui/base/LoadingState';

export default function TerritoriosPage() {
  const router = useRouter();
  const { territorios, loading, error, fetchTerritorios } = useAdminTerritorios();
  const { checkAuth } = useAdminAuth();

  useEffect(() => {
    if (!checkAuth()) return;
    fetchTerritorios();
  }, [checkAuth, fetchTerritorios]);

  if (loading) return <LoadingState message="Cargando territorios..." />;

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#557149] mb-2">Territorios</h1>
          <p className="text-[#353535]">Gestiona los territorios registrados en el sistema</p>
        </div>
        <button
          onClick={() => router.push('/admin/territorios/nuevo')}
          className="bg-[#3b5630] hover:bg-[#2d6530] text-white px-5 py-2.5 rounded-full text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Territorio
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {territorios.length === 0 ? (
        <EmptyState message="No hay territorios registrados." />
      ) : (
        <div className="space-y-4">
          {territorios.map((territorio) => (
            <TerritorioCard
              key={territorio.id_territorio}
              territorio={territorio}
              onClick={() => router.push(`/admin/territorios/${territorio.id_territorio}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
