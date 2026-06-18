/**
 * ViewModel para gestión de solicitudes de aprobación
 * @celula - Celula1
 * Maneja el estado y la lógica de negocio para solicitudes del líder.
 *
 * Proporciona:
 *  - Lista de solicitudes
 *  - Detalle de solicitud
 *  - Actualizar estado de solicitud
 *  - Filtrado por estado
 *  - Estados de carga y error
 *
 * Servicios utilizados: solicitudesService
 *  - solicitudesService.getSolicitudes()              -> GET /api/solicitudes/
 *  - solicitudesService.getSolicitud(id)              -> GET /api/solicitudes/{id}/
 *  - solicitudesService.actualizarSolicitud(id, data) -> PATCH /api/solicitudes/{id}/actualizar/
 */

'use client';

import { useState, useCallback } from 'react';
import { solicitudesService } from '@/services/solicitudesService';
import { Solicitud } from '@/models/types';

interface UseSolicitudesReturn {
  solicitudes: Solicitud[];
  solicitud: Solicitud | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  toast: string | null;
  filtro: string;
  solicitudesFiltradas: Solicitud[];
  fetchSolicitudes: () => Promise<void>;
  fetchSolicitud: (id: number) => Promise<void>;
  actualizarSolicitud: (id: number, estado: string, observaciones?: string) => Promise<void>;
  setFiltro: (filtro: string) => void;
  clearError: () => void;
  clearToast: () => void;
}

/**
 * Hook de gestión de solicitudes de aprobación (líder).
 *
 * Proporciona:
 *  - Listado de solicitudes con filtrado por estado_resultado
 *  - Detalle de solicitud individual
 *  - Actualización de estado (APROBADO/RECHAZADO)
 *
 * Valores esperados para filtro: '' (todas), 'PENDIENTE', 'APROBADO', 'RECHAZADO'
 */
export function useSolicitudes(): UseSolicitudesReturn {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>('');

  const clearError = useCallback(() => setError(null), []);
  const clearToast = useCallback(() => setToast(null), []);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await solicitudesService.getSolicitudes();
      setSolicitudes(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSolicitud = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await solicitudesService.getSolicitud(id);
      setSolicitud(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitud');
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarSolicitud = useCallback(async (id: number, estado: string, observaciones?: string) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await solicitudesService.actualizarSolicitud(id, { estado, observaciones });
      setSolicitud(updated);
      setToast(`Solicitud ${estado === 'APROBADO' ? 'aprobada' : 'rechazada'} correctamente`);
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar solicitud');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const solicitudesFiltradas = filtro
    ? solicitudes.filter((s) => s.estado_resultado === filtro)
    : solicitudes;

  return {
    solicitudes,
    solicitud,
    loading,
    saving,
    error,
    toast,
    filtro,
    solicitudesFiltradas,
    fetchSolicitudes,
    fetchSolicitud,
    actualizarSolicitud,
    setFiltro,
    clearError,
    clearToast,
  };
}
