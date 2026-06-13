/**
 * ViewModel para detalle de territorio (Admin)
 * @celula - Celula1
 * Maneja el estado de edición, diffing de cambios y guardado del detalle de un territorio.
 *
 * Combina useAdminTerritorios (datos + API) con estado local de edición.
 *
 * Servicios utilizados: adminService (vía useAdminTerritorios)
 *  - adminService.getTerritorio(id)              -> GET /api/admin/territorios/{id}/
 *  - adminService.actualizarTerritorio(id, data) -> PATCH /api/admin/territorios/{id}/
 */

'use client';

import { useState, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { AdminTerritorio } from '@/models/types';

interface UseTerritorioDetalleReturn {
  territorio: AdminTerritorio | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  toast: string | null;
  isEditing: boolean;
  editNombre: string;
  editRegion: string;
  editEstadoActivo: boolean;
  editAdminActivo: boolean;
  setEditNombre: (value: string) => void;
  setEditRegion: (value: string) => void;
  setEditEstadoActivo: (value: boolean) => void;
  setEditAdminActivo: (value: boolean) => void;
  setIsEditing: (value: boolean) => void;
  handleGuardar: () => Promise<void>;
  cancelEditing: () => void;
  loadData: (id: number) => void;
}

/** IDs de estado en la base de datos del backend */
const ESTADO_ACTIVO_ID = 4;
const ESTADO_INACTIVO_ID = 5;

/**
 * Hook de detalle de territorio (admin).
 *
 * Combina carga de datos con estado de edición local.
 * Implementa diffing: solo envía al backend los campos que realmente cambiaron.
 */
export function useTerritorioDetalle(): UseTerritorioDetalleReturn {
  const [territorio, setTerritorio] = useState<AdminTerritorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editEstadoActivo, setEditEstadoActivo] = useState(true);
  const [editAdminActivo, setEditAdminActivo] = useState(true);

  const clearError = useCallback(() => setError(null), []);

  /** Inicializa los campos de edición a partir de un territorio */
  const initEditFields = useCallback((t: AdminTerritorio) => {
    setEditNombre(t.nombre_territorio);
    setEditRegion(t.region);
    setEditEstadoActivo(t.estado_nombre?.toLowerCase() === 'activo');
    setEditAdminActivo(t.administrador_activo);
  }, []);

  const loadData = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getTerritorio(id);
      setTerritorio(data);
      initEditFields(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar territorio');
    } finally {
      setLoading(false);
    }
  }, [initEditFields]);

  /** Diffing: solo envía campos que cambiaron respecto al original */
  const handleGuardar = useCallback(async () => {
    if (!territorio) return;
    clearError();

    const payload: Record<string, unknown> = {};
    if (editNombre.trim() !== territorio.nombre_territorio) payload.nombre_territorio = editNombre.trim();
    if (editRegion.trim() !== territorio.region) payload.region = editRegion.trim();
    const estadoActivoActual = territorio.estado_nombre?.toLowerCase() === 'activo';
    if (editEstadoActivo !== estadoActivoActual) payload.id_estado = editEstadoActivo ? ESTADO_ACTIVO_ID : ESTADO_INACTIVO_ID;
    if (editAdminActivo !== territorio.administrador_activo) payload.administrador_activo = editAdminActivo;

    // Si no hay cambios, salir del modo edición sin llamar al backend
    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const updated = await adminService.actualizarTerritorio(territorio.id_territorio, payload);
      setTerritorio(updated);
      initEditFields(updated);
      setIsEditing(false);
      setToast('Cambios guardados correctamente');
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  }, [territorio, editNombre, editRegion, editEstadoActivo, editAdminActivo, clearError, initEditFields]);

  const cancelEditing = useCallback(() => {
    if (!territorio) return;
    initEditFields(territorio);
    setIsEditing(false);
    clearError();
  }, [territorio, initEditFields, clearError]);

  return {
    territorio,
    loading,
    saving,
    error,
    toast,
    isEditing,
    editNombre,
    editRegion,
    editEstadoActivo,
    editAdminActivo,
    setEditNombre,
    setEditRegion,
    setEditEstadoActivo,
    setEditAdminActivo,
    setIsEditing,
    handleGuardar,
    cancelEditing,
    loadData,
  };
}
