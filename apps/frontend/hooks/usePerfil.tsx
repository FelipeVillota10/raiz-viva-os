/**
 * ViewModel para gestión del perfil de actor territorial
 * @celula - Celula1
 * Maneja el estado y la lógica de negocio para el perfil del usuario.
 *
 * Proporciona:
 *  - Datos del perfil
 *  - Servicios del perfil
 *  - Catálogo de servicios
 *  - Actualizar perfil (con fotos)
 *  - CRUD de servicios del perfil
 *  - Estados de carga, edición y error
 *
 * Servicios utilizados: perfilService
 *  - perfilService.getPerfil()                  -> GET /api/auth/me/
 *  - perfilService.actualizarPerfil(formData)   -> PATCH /api/perfil/actualizar/
 *  - perfilService.getServicios()               -> GET /api/perfil/servicios/
 *  - perfilService.addServicio(id, precio)      -> POST /api/perfil/servicios/
 *  - perfilService.deleteServicio(id)           -> DELETE /api/perfil/servicios/{id}/
 *  - perfilService.getServiciosCatalogo()       -> GET /api/servicios/
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { perfilService } from '@/services/perfilService';
import { API_URL } from '@/services/authService';
import { PerfilActor, ServicioPerfil, Servicio } from '@/models/types';

interface UsePerfilReturn {
  perfil: PerfilActor | null;
  servicios: ServicioPerfil[];
  serviciosCatalogo: Servicio[];
  loading: boolean;
  saving: boolean;
  isEditing: boolean;
  error: string | null;
  toast: string | null;

  editNombre: string;
  editDescripcion: string;
  editFotoPerfil: File | null;
  editFotoPortada: File | null;
  previewPerfil: string | null;
  previewPortada: string | null;

  showAddServicio: boolean;
  newServicioId: string;
  newServicioPrecio: string;
  addingServicio: boolean;

  perfilInputRef: React.RefObject<HTMLInputElement | null>;
  portadaInputRef: React.RefObject<HTMLInputElement | null>;

  setEditNombre: (value: string) => void;
  setEditDescripcion: (value: string) => void;
  setNewServicioId: (value: string) => void;
  setNewServicioPrecio: (value: string) => void;
  setShowAddServicio: (value: boolean) => void;

  loadData: () => Promise<void>;
  startEditing: () => void;
  cancelEditing: () => void;
  saveChanges: () => Promise<void>;
  handlePerfilFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePortadaFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddServicio: () => Promise<void>;
  handleDeleteServicio: (id: number) => Promise<void>;
  clearError: () => void;
  normalizeImageUrl: (url: string | null | undefined) => string | null;
}

/**
 * Hook de perfil de actor territorial.
 *
 * Maneja:
 *  - Carga paralela de perfil + servicios + catálogo
 *  - Edición del perfil (nombre, descripción, fotos)
 *  - CRUD de servicios del perfil
 */
export function usePerfil(): UsePerfilReturn {
  const [perfil, setPerfil] = useState<PerfilActor | null>(null);
  const [servicios, setServicios] = useState<ServicioPerfil[]>([]);
  const [serviciosCatalogo, setServiciosCatalogo] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editFotoPerfil, setEditFotoPerfil] = useState<File | null>(null);
  const [editFotoPortada, setEditFotoPortada] = useState<File | null>(null);
  const [previewPerfil, setPreviewPerfil] = useState<string | null>(null);
  const [previewPortada, setPreviewPortada] = useState<string | null>(null);

  const [showAddServicio, setShowAddServicio] = useState(false);
  const [newServicioId, setNewServicioId] = useState('');
  const [newServicioPrecio, setNewServicioPrecio] = useState('');
  const [addingServicio, setAddingServicio] = useState(false);

  const perfilInputRef = useRef<HTMLInputElement>(null);
  const portadaInputRef = useRef<HTMLInputElement>(null);

  const clearError = useCallback(() => setError(null), []);

  /** Convierte URLs relativas del backend a absolutas (ej: /media/foto.jpg → http://localhost:8000/media/foto.jpg) */
  const normalizeImageUrl = useCallback((url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${API_URL}${path}`;
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [perfilData, serviciosData, catalogoData] = await Promise.all([
        perfilService.getPerfil(),
        perfilService.getServicios(),
        perfilService.getServiciosCatalogo(),
      ]);
      setPerfil(perfilData);
      setServicios(serviciosData);
      setServiciosCatalogo(catalogoData);
      setEditNombre(perfilData.nombre);
      setEditDescripcion(perfilData.descripcion || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePerfilFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFotoPerfil(file);
      setPreviewPerfil(URL.createObjectURL(file));
    }
  }, []);

  const handlePortadaFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFotoPortada(file);
      setPreviewPortada(URL.createObjectURL(file));
    }
  }, []);

  const startEditing = useCallback(() => {
    if (!perfil) return;
    setEditNombre(perfil.nombre);
    setEditDescripcion(perfil.descripcion || '');
    setEditFotoPerfil(null);
    setEditFotoPortada(null);
    setPreviewPerfil(null);
    setPreviewPortada(null);
    setError(null);
    setIsEditing(true);
  }, [perfil]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditFotoPerfil(null);
    setEditFotoPortada(null);
    setPreviewPerfil(null);
    setPreviewPortada(null);
    setShowAddServicio(false);
    setError(null);
  }, []);

  const saveChanges = useCallback(async () => {
    if (!perfil) return;
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('nombre', editNombre.trim());
      formData.append('descripcion', editDescripcion);
      if (editFotoPerfil) formData.append('foto_perfil', editFotoPerfil);
      if (editFotoPortada) formData.append('foto_portada', editFotoPortada);

      const updated = await perfilService.actualizarPerfil(formData);
      setPerfil(updated);
      setEditNombre(updated.nombre);
      setEditDescripcion(updated.descripcion || '');

      setIsEditing(false);
      setEditFotoPerfil(null);
      setEditFotoPortada(null);
      setPreviewPerfil(null);
      setPreviewPortada(null);
      setToast('Cambios guardados correctamente');
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  }, [perfil, editNombre, editDescripcion, editFotoPerfil, editFotoPortada]);

  const handleAddServicio = useCallback(async () => {
    if (!newServicioId) return;
    setAddingServicio(true);
    setError(null);
    try {
      const precio = newServicioPrecio ? parseFloat(newServicioPrecio) : undefined;
      const nuevo = await perfilService.addServicio(parseInt(newServicioId), precio);
      setServicios(prev => [...prev, nuevo]);
      setNewServicioId('');
      setNewServicioPrecio('');
      setShowAddServicio(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al añadir servicio');
    } finally {
      setAddingServicio(false);
    }
  }, [newServicioId, newServicioPrecio]);

  const handleDeleteServicio = useCallback(async (id: number) => {
    setError(null);
    try {
      await perfilService.deleteServicio(id);
      setServicios(prev => prev.filter(s => s.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar servicio');
    }
  }, []);

  return {
    perfil,
    servicios,
    serviciosCatalogo,
    loading,
    saving,
    isEditing,
    error,
    toast,
    editNombre,
    editDescripcion,
    editFotoPerfil,
    editFotoPortada,
    previewPerfil,
    previewPortada,
    showAddServicio,
    newServicioId,
    newServicioPrecio,
    addingServicio,
    perfilInputRef,
    portadaInputRef,
    setEditNombre,
    setEditDescripcion,
    setNewServicioId,
    setNewServicioPrecio,
    setShowAddServicio,
    loadData,
    startEditing,
    cancelEditing,
    saveChanges,
    handlePerfilFile,
    handlePortadaFile,
    handleAddServicio,
    handleDeleteServicio,
    clearError,
    normalizeImageUrl,
  };
}
