/**
 * ViewModel para detalle de líder (Admin)
 * @celula - Celula1
 * Maneja el estado de edición, diffing de cambios y guardado del detalle de un líder.
 *
 * Combina useAdminLideres (datos + API) con estado local de edición.
 *
 * Servicios utilizados: adminService (vía useAdminLideres)
 *  - adminService.getLider(id)                -> GET /api/admin/lideres/{id}/
 *  - adminService.getTerritorios()            -> GET /api/admin/territorios/
 *  - adminService.actualizarLider(id, data)   -> PATCH /api/admin/lideres/{id}/
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { adminService } from '@/services/adminService';
import { PerfilActor, AdminTerritorio } from '@/models/types';

interface UseLiderDetalleReturn {
  lider: PerfilActor | null;
  territoriosDisponibles: AdminTerritorio[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  toast: string | null;
  isEditing: boolean;
  editNombre: string;
  editEmail: string;
  editTelefono: string;
  editActivo: boolean;
  editTerritorioId: string;
  editFoto: File | null;
  fotoPreview: string | null;
  setEditNombre: (value: string) => void;
  setEditEmail: (value: string) => void;
  setEditTelefono: (value: string) => void;
  setEditActivo: (value: boolean) => void;
  setEditTerritorioId: (value: string) => void;
  setIsEditing: (value: boolean) => void;
  handleFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGuardar: () => Promise<void>;
  cancelEditing: () => void;
  loadData: (id: number) => void;
}

/**
 * Hook de detalle de líder (admin).
 *
 * Combina carga de datos con estado de edición local.
 * Implementa diffing: solo envía al backend los campos que realmente cambiaron.
 * Usa FormData porque permite subir fotos de perfil.
 */
export function useLiderDetalle(): UseLiderDetalleReturn {
  const [lider, setLider] = useState<PerfilActor | null>(null);
  const [territorios, setTerritorios] = useState<AdminTerritorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editActivo, setEditActivo] = useState(true);
  const [editTerritorioId, setEditTerritorioId] = useState('');
  const [editFoto, setEditFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /** Inicializa los campos de edición a partir de un líder */
  const initEditFields = useCallback((l: PerfilActor) => {
    setEditNombre(l.nombre);
    setEditEmail(l.usuario_email);
    setEditTelefono(l.telefono || '');
    setEditActivo(l.activo);
    setEditTerritorioId(String(l.territorio_id ?? ''));
  }, []);

  const loadData = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const [liderData, territoriosData] = await Promise.all([
        adminService.getLider(id),
        adminService.getTerritorios(),
      ]);
      setLider(liderData);
      setTerritorios(territoriosData);
      initEditFields(liderData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [initEditFields]);

  const territoriosDisponibles = useMemo(() =>
    territorios.filter((t) =>
      t.administrador_id === null ||
      t.administrador_id === lider?.id_cliente ||
      !t.administrador_activo
    ),
    [territorios, lider]
  );

  const handleFotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGuardar = useCallback(async () => {
    if (!lider) return;
    clearError();

    const formData = new FormData();
    if (editNombre.trim() !== lider.nombre) formData.append('nombre', editNombre.trim());
    if (editEmail.trim() !== lider.usuario_email) formData.append('email', editEmail.trim());
    if (editTelefono.trim() !== (lider.telefono || '')) formData.append('telefono', editTelefono.trim());
    if (editActivo !== lider.activo) formData.append('activo', String(editActivo));
    if (editTerritorioId !== String(lider.territorio_id ?? '')) {
      formData.append('territorio_id', editTerritorioId || '');
    }
    if (editFoto) formData.append('foto_perfil', editFoto);

    if ([...formData.entries()].length === 0) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const updated = await adminService.actualizarLider(lider.id_cliente, formData);
      setLider(updated);
      setEditFoto(null);
      setFotoPreview(null);
      setIsEditing(false);
      setToast('Cambios guardados correctamente');
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  }, [lider, editNombre, editEmail, editTelefono, editActivo, editTerritorioId, editFoto, clearError]);

  const cancelEditing = useCallback(() => {
    if (!lider) return;
    initEditFields(lider);
    setEditFoto(null);
    setFotoPreview(null);
    setIsEditing(false);
    clearError();
  }, [lider, initEditFields, clearError]);

  return {
    lider,
    territoriosDisponibles,
    loading,
    saving,
    error,
    toast,
    isEditing,
    editNombre,
    editEmail,
    editTelefono,
    editActivo,
    editTerritorioId,
    editFoto,
    fotoPreview,
    setEditNombre,
    setEditEmail,
    setEditTelefono,
    setEditActivo,
    setEditTerritorioId,
    setIsEditing,
    handleFotoChange,
    handleGuardar,
    cancelEditing,
    loadData,
  };
}
