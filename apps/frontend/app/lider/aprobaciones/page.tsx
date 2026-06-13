/**
 * Página de aprobaciones del líder (View)
 * @celula - Celula1
 * Vista que utiliza useSolicitudes como ViewModel.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { SolicitudCard } from '@/components/ui/aprobaractor/SolicitudCard';
import { FiltrosEstado } from '@/components/ui/aprobaractor/FiltrosEstado';
import { EmptyState } from '@/components/ui/base/EmptyState';
import { LoadingState } from '@/components/ui/base/LoadingState';

export default function AprobacionesPage() {
  const router = useRouter();
  const { loading, filtro, solicitudesFiltradas, fetchSolicitudes, setFiltro } = useSolicitudes();

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  if (loading) return <LoadingState message="Cargando solicitudes..." />;

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-[#557149] mb-2">Solicitudes de Registro</h1>
      <p className="text-[#353535] mb-6">Revisa y gestiona las solicitudes de actores territoriales en tu territorio</p>

      <FiltrosEstado filtroActual={filtro} onChange={setFiltro} />

      {solicitudesFiltradas.length === 0 ? (
        <EmptyState message="No hay solicitudes para mostrar." />
      ) : (
        <div className="space-y-4">
          {solicitudesFiltradas.map((solicitud) => (
            <SolicitudCard
              key={solicitud.id_aprobacion}
              solicitud={solicitud}
              onClick={() => router.push(`/lider/aprobaciones/${solicitud.id_aprobacion}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
