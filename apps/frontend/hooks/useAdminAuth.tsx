/**
 * Hook para verificación de autenticación del admin
 * @celula - Celula1
 * Centraliza la lógica de verificación de token y rol de administrador.
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/services/authService';

interface UseAdminAuthReturn {
  checkAuth: () => boolean;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const router = useRouter();

  const checkAuth = useCallback((): boolean => {
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload['es_admin']) {
        router.push('/admin/login');
        return false;
      }
    } catch {
      router.push('/admin/login');
      return false;
    }
    return true;
  }, [router]);

  return { checkAuth };
}
