import { useState, useEffect } from 'react';

export interface Moneda {
  id: number;
  nombre: string;
  simbolo: string;
}

export function useMonedas() {
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMonedas() {
      try {
        setIsLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
        const res = await fetch(`${API_BASE}/api/monedas/`);
        if (res.ok) {
          const data = await res.json();
          setMonedas(data);
        }
      } catch (err) {
        console.error("Error cargando monedas:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMonedas();
  }, []);

  return { monedas, isLoading };
}
