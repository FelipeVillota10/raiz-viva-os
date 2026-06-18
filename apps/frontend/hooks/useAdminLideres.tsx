/**
 * ViewModel para gestión de líderes (Admin)
 * @celula - Celula1
 * Maneja el estado y la lógica de negocio para líderes del administrador.
 *
 * Proporciona:
 *  - Lista de líderes
 *  - Detalle de líder
 *  - Actualizar líder
 *  - Estados de carga y error
 *
 * Servicios utilizados: adminService
 *  - adminService.getLideres()           -> GET /api/admin/lideres/
 *  - adminService.getLider(id)           -> GET /api/admin/lideres/{id}/
 *  - adminService.actualizarLider(id, formData) -> PATCH /api/admin/lideres/{id}/
 *  - adminService.getTerritorios()       -> GET /api/admin/territorios/ (para selector de territorios)
 */

'use client';

import { useState, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { AdminLider, PerfilActor, AdminTerritorio } from '@/models/types';

interface UseAdminLideresReturn {
  lideres: AdminLider[];
  lider: PerfilActor | null;
  territorios: AdminTerritorio[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  toast: string | null;
  fetchLideres: () => Promise<void>;
  fetchLider: (id: number) => Promise<void>;
  fetchLiderConTerritorios: (id: number) => Promise<void>;
  actualizarLider: (id: number, formData: FormData) => Promise<void>;
  clearError: () => void;
  clearToast: () => void;
}

/**
 * Hook de gestión de líderes (admin).
 *
 * Proporciona CRUD de líderes con carga de territorios para el selector.
 * `actualizarLider` re-lanza el error para que el componente pueda manejarlo.
 */
export function useAdminLideres(): UseAdminLideresReturn {
  const [lideres, setLideres] = useState<AdminLider[]>([]);
  const [lider, setLider] = useState<PerfilActor | null>(null);
  const [territorios, setTerritorios] = useState<AdminTerritorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearToast = useCallback(() => setToast(null), []);

  const fetchLideres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getLideres();
      setLideres(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar líderes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLider = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getLider(id);
      setLider(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar líder');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLiderConTerritorios = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const [liderData, territoriosData] = await Promise.all([
        adminService.getLider(id),
        adminService.getTerritorios(),
      ]);
      setLider(liderData);
      setTerritorios(territoriosData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarLider = useCallback(async (id: number, formData: FormData) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminService.actualizarLider(id, formData);
      setLider(updated);
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
    lideres,
    lider,
    territorios,
    loading,
    saving,
    error,
    toast,
    fetchLideres,
    fetchLider,
    fetchLiderConTerritorios,
    actualizarLider,
    clearError,
    clearToast,
  };
}
