/**
 * ViewModel para registrar un nuevo líder territorial
 * @celula - Celula1
 * Maneja el estado y lógica de negocio para el formulario de nuevo líder.
 *
 * Servicios utilizados: adminService
 *  - adminService.getTerritorios()   -> GET /api/admin/territorios/
 *  - adminService.registrarLider()   -> POST /api/usuarios/admin/registrar-lider/
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ApiError, parseApiErrorFromData } from '@/services/apiError';
import { AdminTerritorio } from '@/models/types';

interface UseNuevoLiderReturn {
  territorios: AdminTerritorio[];
  loadingTerritorios: boolean;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  success: string | null;
  registrar: (data: {
    nombre_completo: string;
    email: string;
    password: string;
    confirmPassword: string;
    telefono: string;
    id_territorio: string;
    activo: string;
  }) => Promise<void>;
  clearMessages: () => void;
}

export function useNuevoLider(): UseNuevoLiderReturn {
  const router = useRouter();
  const { checkAuth } = useAdminAuth();
  const [territorios, setTerritorios] = useState<AdminTerritorio[]>([]);
  const [loadingTerritorios, setLoadingTerritorios] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAuth()) return;

    const fetchTerritorios = async () => {
      try {
        const data = await adminService.getTerritorios();
        setTerritorios(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar territorios.');
      } finally {
        setLoadingTerritorios(false);
      }
    };

    fetchTerritorios();
  }, [checkAuth]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
    setFieldErrors({});
  }, []);

  const registrar = useCallback(async (data: {
    nombre_completo: string;
    email: string;
    password: string;
    confirmPassword: string;
    telefono: string;
    id_territorio: string;
    activo: string;
  }) => {
    setError(null);
    setSuccess(null);

    if (data.password !== data.confirmPassword) {
      setError('La contraseña y la confirmación no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await adminService.registrarLider({
        nombre_completo: data.nombre_completo.trim(),
        email: data.email.trim(),
        password: data.password,
        telefono: data.telefono.trim(),
        id_territorio: data.id_territorio ? Number(data.id_territorio) : null,
        activo: data.activo === 'true',
      });

      setSuccess('Líder territorial registrado correctamente.');
      setTimeout(() => router.push('/admin/lideres'), 1200);
    } catch (err: unknown) {
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
        setError(err instanceof Error ? err.message : 'No se pudo registrar el líder.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    territorios,
    loadingTerritorios,
    loading,
    error,
    fieldErrors,
    success,
    registrar,
    clearMessages,
  };
}
