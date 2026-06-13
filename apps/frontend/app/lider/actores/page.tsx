/**
 * Página de actores del líder (View)
 * @celula - Celula1
 * Vista que utiliza useLiderActores como ViewModel.
 */

'use client';

import { useEffect } from 'react';
import { useLiderActores } from '@/hooks/useLiderActores';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { ActorCard } from '@/components/ui/gestionaractor/ActorCard';
import { ErrorBanner } from '@/components/ui/base/ErrorBanner';
import { EmptyState } from '@/components/ui/base/EmptyState';
import { LoadingState } from '@/components/ui/base/LoadingState';
import { ActorTerritorial } from '@/models/types';

export default function ActoresPage() {
  const {
    actores,
    loading,
    error,
    actorSeleccionado,
    fetchActores,
    toggleEstado,
    seleccionarActor,
    clearError,
  } = useLiderActores();

  useEffect(() => {
    fetchActores();
  }, [fetchActores]);

  const handleToggle = async () => {
    if (!actorSeleccionado) return;
    const accion = actorSeleccionado.activo ? 'deshabilitar' : 'habilitar';
    await toggleEstado(actorSeleccionado.id_cliente, accion);
  };

  const handleSelectActor = (actor: ActorTerritorial) => {
    seleccionarActor(actor);
  };

  if (loading) return <LoadingState message="Cargando actores territoriales..." />;

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-[#557149] mb-2">Actores Territoriales</h1>
      <p className="text-[#353535] mb-6">Gestiona los actores registrados en tu territorio</p>

      {error && <ErrorBanner message={error} onClose={clearError} />}

      {actores.length === 0 ? (
        <EmptyState message="No hay actores aprobados en tu territorio." />
      ) : (
        <div className="space-y-4">
          {actores.map((actor) => (
            <ActorCard
              key={actor.id_cliente}
              actor={actor}
              onToggle={handleSelectActor}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={actorSeleccionado !== null}
        title={actorSeleccionado?.activo ? 'Inhabilitar Actor' : 'Habilitar Actor'}
        message={
          actorSeleccionado?.activo
            ? `¿Estás seguro de inhabilitar a "${actorSeleccionado?.nombre}"? No podrá acceder al sistema hasta que sea habilitado nuevamente.`
            : `¿Estás seguro de habilitar a "${actorSeleccionado?.nombre}"? Podrá acceder al sistema nuevamente.`
        }
        confirmLabel={actorSeleccionado?.activo ? 'Sí, Inhabilitar' : 'Sí, Habilitar'}
        confirmClass={actorSeleccionado?.activo ? 'bg-red-600 hover:bg-red-700' : 'bg-[#10b981] hover:bg-[#059669]'}
        onConfirm={handleToggle}
        onCancel={() => seleccionarActor(null)}
      />
    </div>
  );
}
