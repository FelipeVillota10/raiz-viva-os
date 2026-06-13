/**
 * Hook para el contexto de aprobaciones
 * @celula - Celula1
 * Provee estado de solicitudes y conteo de pendientes para el líder.
 *
 * Servicios utilizados: aprobacionesService
 *  - aprobacionesService.getSolicitudes() -> GET /api/solicitudes/
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getToken } from '@/services/authService';
import { aprobacionesService, SolicitudAprobacion } from '@/services/aprobacionesService';

interface AprobacionesContextType {
  solicitudes: SolicitudAprobacion[];
  pendingCount: number;
  loading: boolean;
  refresh: () => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AprobacionesContext = createContext<AprobacionesContextType>({
  solicitudes: [],
  pendingCount: 0,
  loading: true,
  refresh: () => {},
  isAuthenticated: false,
  logout: () => {},
});

export function useAprobaciones() {
  return useContext(AprobacionesContext);
}

export function AprobacionesProvider({ children }: { children: ReactNode }) {
  const [solicitudes, setSolicitudes] = useState<SolicitudAprobacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSolicitudes = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await aprobacionesService.getSolicitudes();
      setSolicitudes(data);
    } catch {
      // error manejado silenciosamente
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const logout = useCallback(() => {
    setSolicitudes([]);
    setLoading(false);
  }, []);

  const pendingCount = solicitudes.filter(s => s.estado_resultado === 'EN_REVISION').length;
  const isAuthenticated = typeof window !== 'undefined' && !!getToken();

  return (
    <AprobacionesContext.Provider value={{ solicitudes, pendingCount, loading, refresh: fetchSolicitudes, isAuthenticated, logout }}>
      {children}
    </AprobacionesContext.Provider>
  );
}
