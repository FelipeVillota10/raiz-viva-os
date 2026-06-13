/**
 * ViewModel para gestión de actores territoriales (Líder)
 * @celula - Celula1
 * Maneja el estado y la lógica de negocio para actores del líder.
 *
 * Proporciona:
 *  - Lista de actores del territorio
 *  - Habilitar/deshabilitar actores
 *  - Estados de carga y error
 *
 * Servicios utilizados: actoresLiderService
 *  - actoresLiderService.getActores()                    -> GET /api/lider/actores/
 *  - actoresLiderService.toggleEstadoActor(id, accion)   -> PATCH /api/lider/actores/{id}/toggle-estado/
 */

'use client';

import { useState, useCallback } from 'react';
import { actoresLiderService } from '@/services/actoresLiderService';
import { ActorTerritorial } from '@/models/types';

interface UseLiderActoresReturn {
  actores: ActorTerritorial[];
  loading: boolean;
  error: string | null;
  actorSeleccionado: ActorTerritorial | null;
  fetchActores: () => Promise<void>;
  toggleEstado: (actorId: number, accion: 'deshabilitar' | 'habilitar') => Promise<void>;
  seleccionarActor: (actor: ActorTerritorial | null) => void;
  clearError: () => void;
}

/**
 * Hook de gestión de actores territoriales (líder).
 *
 * `toggleEstado` cierra el modal (deselecciona actor) y refresca la lista,
 * tanto si la operación fue exitosa como si falló.
 */
export function useLiderActores(): UseLiderActoresReturn {
  const [actores, setActores] = useState<ActorTerritorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actorSeleccionado, setActorSeleccionado] = useState<ActorTerritorial | null>(null);

  const clearError = useCallback(() => setError(null), []);

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

  const toggleEstado = useCallback(async (actorId: number, accion: 'deshabilitar' | 'habilitar') => {
    try {
      await actoresLiderService.toggleEstadoActor(actorId, accion);
      setActorSeleccionado(null);
      await fetchActores();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
      setActorSeleccionado(null);
    }
  }, [fetchActores]);

  const seleccionarActor = useCallback((actor: ActorTerritorial | null) => {
    setActorSeleccionado(actor);
  }, []);

  return {
    actores,
    loading,
    error,
    actorSeleccionado,
    fetchActores,
    toggleEstado,
    seleccionarActor,
    clearError,
  };
}
