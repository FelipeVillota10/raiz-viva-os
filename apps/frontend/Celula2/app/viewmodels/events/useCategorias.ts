// viewmodels/events/useCategorias.ts
import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface CategoriaEvento {
  id:          number;
  nombre:      string;
  descripcion: string | null;
}

export function useCategorias() {
  const [categorias,  setCategorias]  = useState<CategoriaEvento[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE}/api/categorias-eventos/`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setCategorias(data.results ?? data))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { categorias, isLoading, error };
}