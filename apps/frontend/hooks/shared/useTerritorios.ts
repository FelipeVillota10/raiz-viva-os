import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface Territorio {
  id_territorio: number;
  nombre_territorio: string;
  region: string | null;
}

export function useTerritorios() {
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchTerritorios() {
      try {
        const res = await fetch(`${API_BASE}/api/territorios/`);
        if (!res.ok) {
          throw new Error('Error al cargar los territorios');
        }
        const data = await res.json();
        if (mounted) {
          setTerritorios(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTerritorios();

    return () => {
      mounted = false;
    };
  }, []);

  return { territorios, isLoading, error };
}
