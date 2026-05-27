'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getToken, API_URL } from '../services/api';

interface ActorInfo {
  id: number;
  nombre_completo: string;
  telefono: string;
  servicio: string;
  territorio_nombre: string | null;
  tipos_actores: { id: number; nombre_tipo: string }[];
}

interface Solicitud {
  id_aprobacion: number;
  estado_resultado: string;
  observaciones: string;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  actor_info: ActorInfo;
}

interface AprobacionesContextType {
  solicitudes: Solicitud[];
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
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSolicitudes = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/solicitudes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSolicitudes(data);
      }
    } catch {
      // error
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