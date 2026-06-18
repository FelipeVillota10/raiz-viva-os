/**
 * ViewModel para registrar un nuevo territorio
 * @celula - Celula1
 * Maneja el estado y lógica de negocio para el formulario de nuevo territorio.
 *
 * Servicios utilizados: adminService
 *  - adminService.getLideresDisponibles()  -> GET /api/admin/lideres/?disponibles=true
 *  - adminService.crearTerritorio()        -> POST /api/admin/territorios/
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ApiError, parseApiErrorFromData } from '@/services/apiError';
import { AdminLider } from '@/models/types';

interface LiderOption {
  value: string;
  label: string;
}

interface UseNuevoTerritorioReturn {
  lideresDisponibles: LiderOption[];
  loadingLideres: boolean;
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  crear: (data: {
    nombre: string;
    region: string;
    administrador: string;
  }) => Promise<void>;
  clearMessages: () => void;
}

export function useNuevoTerritorio(): UseNuevoTerritorioReturn {
  const router = useRouter();
  const [lideresDisponibles, setLideresDisponibles] = useState<LiderOption[]>([]);
  const [loadingLideres, setLoadingLideres] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchLideres = async () => {
      try {
        const lideres = await adminService.getLideresDisponibles();
        setLideresDisponibles([
          { value: '', label: 'Seleccione un líder' },
          ...lideres.map((l: AdminLider) => ({
            value: String(l.id_cliente),
            label: `${l.nombre} (${l.usuario_email})`,
          })),
        ]);
      } catch {
        setError('Error al cargar líderes disponibles');
      } finally {
        setLoadingLideres(false);
      }
    };
    fetchLideres();
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const crear = useCallback(async (data: {
    nombre: string;
    region: string;
    administrador: string;
  }) => {
    setError(null);

    if (!data.administrador) {
      setError('Debe seleccionar un líder para el territorio');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.crearTerritorio({
        nombre_territorio: data.nombre.trim(),
        region: data.region.trim(),
        id_administrador: parseInt(data.administrador),
      });
      router.push('/admin/territorios');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.responseBody && Object.keys(err.fieldErrors).length === 0) {
          try {
            const data = JSON.parse(err.responseBody);
            const enriched = parseApiErrorFromData(data, err.status);
            setFieldErrors(enriched.fieldErrors);
            setError(enriched.message);
          } catch {
            setError(err.message);
          }
        } else {
          setFieldErrors(err.fieldErrors);
          setError(err.message);
        }
      } else {
        setError(err instanceof Error ? err.message : 'Error al crear territorio');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  return {
    lideresDisponibles,
    loadingLideres,
    isSubmitting,
    error,
    fieldErrors,
    crear,
    clearMessages,
  };
}
