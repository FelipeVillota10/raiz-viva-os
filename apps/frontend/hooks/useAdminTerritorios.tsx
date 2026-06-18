/**
 * ViewModel para gestión de territorios (Admin)
 * @celula - Celula1
 * Maneja el estado y la lógica de negocio para territorios del administrador.
 *
 * Proporciona:
 *  - Lista de territorios
 *  - Detalle de territorio
 *  - Crear/actualizar territorios
 *  - Estados de carga y error
 *
 * Servicios utilizados: adminService
 *  - adminService.getTerritorios()       -> GET /api/admin/territorios/
 *  - adminService.getTerritorio(id)      -> GET /api/admin/territorios/{id}/
 *  - adminService.crearTerritorio(data)  -> POST /api/admin/territorios/
 *  - adminService.actualizarTerritorio(id, payload) -> PATCH /api/admin/territorios/{id}/
 */

'use client';

import { useState, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { AdminTerritorio, TerritorioUpdatePayload } from '@/models/types';

interface UseAdminTerritoriosReturn {
  territorios: AdminTerritorio[];
  territorio: AdminTerritorio | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  toast: string | null;
  fetchTerritorios: () => Promise<void>;
  fetchTerritorio: (id: number) => Promise<void>;
  crearTerritorio: (data: { nombre_territorio: string; region: string; id_administrador: number }) => Promise<void>;
  actualizarTerritorio: (id: number, payload: TerritorioUpdatePayload) => Promise<void>;
  clearError: () => void;
  clearToast: () => void;
}

/**
 * Hook de gestión de territorios (admin).
 *
 * Proporciona CRUD de territorios.
 * `crearTerritorio` y `actualizarTerritorio` re-lanzan el error
 * para que el componente pueda manejarlo.
 */
export function useAdminTerritorios(): UseAdminTerritoriosReturn {
  const [territorios, setTerritorios] = useState<AdminTerritorio[]>([]);
  const [territorio, setTerritorio] = useState<AdminTerritorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearToast = useCallback(() => setToast(null), []);

  const fetchTerritorios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getTerritorios();
      setTerritorios(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar territorios');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTerritorio = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getTerritorio(id);
      setTerritorio(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar territorio');
    } finally {
      setLoading(false);
    }
  }, []);

  const crearTerritorio = useCallback(async (data: { nombre_territorio: string; region: string; id_administrador: number }) => {
    setSaving(true);
    setError(null);
    try {
      await adminService.crearTerritorio(data);
      setToast('Territorio creado correctamente');
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear territorio');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const actualizarTerritorio = useCallback(async (id: number, payload: TerritorioUpdatePayload) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminService.actualizarTerritorio(id, payload);
      setTerritorio(updated);
      setToast('Cambios guardados correctamente');
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    territorios,
    territorio,
    loading,
    saving,
    error,
    toast,
    fetchTerritorios,
    fetchTerritorio,
    crearTerritorio,
    actualizarTerritorio,
    clearError,
    clearToast,
  };
}
