'use client';

import { useState, useEffect, useCallback } from 'react';
import { actoresLiderService } from '../../services/api';
import { ConfirmModal } from '../../components/ConfirmModal';
import type { ActorTerritorial } from '../../models/types';

export default function ActoresPage() {
  const [actores, setActores] = useState<ActorTerritorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actorSeleccionado, setActorSeleccionado] = useState<ActorTerritorial | null>(null);

  const fetchActores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await actoresLiderService.getActores();
      setActores(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar actores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActores();
  }, [fetchActores]);

  const handleToggle = async () => {
    if (!actorSeleccionado) return;

    const accion = actorSeleccionado.activo ? 'deshabilitar' : 'habilitar';
    try {
      await actoresLiderService.toggleEstadoActor(actorSeleccionado.id_cliente, accion);
      setActorSeleccionado(null);
      fetchActores();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
      setActorSeleccionado(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#353535]">Cargando actores territoriales...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-[#557149] mb-2">Actores Territoriales</h1>
      <p className="text-[#353535] mb-6">Gestiona los actores registrados en tu territorio</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold cursor-pointer">&times;</button>
        </div>
      )}

      {actores.length === 0 ? (
        <p className="text-center text-[#353535] py-12">No hay actores aprobados en tu territorio.</p>
      ) : (
        <div className="space-y-4">
          {actores.map((actor) => {
            const primerTipo = actor.tipos_actores[0];

            return (
              <div
                key={actor.id_cliente}
                className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-all duration-200 ${
                  actor.activo ? 'border-[#E6D3A3]' : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-[#231F20]">{actor.nombre}</h3>
                    <p className="text-sm text-[#353535]">
                      {actor.telefono} · {actor.territorio_nombre || 'Sin territorio'}
                    </p>
                    <p className="text-sm text-[#353535]">{actor.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        actor.activo ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                      }`}
                    >
                      {actor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    {actor.activo ? (
                      <button
                        onClick={() => setActorSeleccionado(actor)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer"
                      >
                        Inhabilitar
                      </button>
                    ) : (
                      <button
                        onClick={() => setActorSeleccionado(actor)}
                        className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer"
                      >
                        Habilitar
                      </button>
                    )}
                  </div>
                </div>

                {primerTipo && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-[#3b5630] bg-[#EFF7EA] px-2 py-1 rounded-full capitalize">
                      {primerTipo.nombre_tipo}
                    </span>
                    {actor.tipos_actores.length > 1 && (
                      <span className="text-xs text-[#353535]">
                        +{actor.tipos_actores.length - 1} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
        onCancel={() => setActorSeleccionado(null)}
      />
    </div>
  );
}
