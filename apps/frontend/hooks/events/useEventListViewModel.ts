// viewmodels/events/useEventListViewModel.ts
import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface EventListItem {
  id:          string;
  name:        string;
  description: string;
  category:    string;
  pricingType: 'free' | 'paid';
  price:       number;
  currency:    string;
  capacity:    number;
  startDate:   string;
  status:      'draft' | 'pending' | 'active' | 'inactive';
}

export function useEventListViewModel() {
  const [events,    setEvents]    = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/eventos/`, {
        credentials: 'include',   // envía cookies de sesión Django
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Adapta los campos del backend a la interfaz del frontend
      // Ajusta los nombres según tu serializer de Django
      const mapped: EventListItem[] = (data.results ?? data).map((item: any) => ({
        id:          String(item.id_evento),
        name:        item.nombre       ?? item.name,
        description: item.descripcion  ?? item.description ?? '',
        category:    item.categoria    ?? item.category    ?? '',
        pricingType: item.precio > 0 ? 'paid' : 'free',
        price:       Number(item.precio ?? item.price ?? 0),
        currency:    item.moneda       ?? item.currency    ?? 'COP',
        capacity:    Number(item.capacidad ?? item.capacity ?? 0),
        startDate:   item.fecha_inicio ?? item.startDate   ?? '',
        status:      item.id_estado === 3 ? 'draft'
                   : item.id_estado === 6 ? 'pending'
                   : item.id_estado === 1 ? 'active'
                   : item.id_estado === 2 ? 'inactive'
                   : 'draft',
      }));

      setEvents(mapped);
    } catch (e: any) {
      setError('Error al cargar los eventos: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const deactivateEvent = useCallback(async (id: string) => {
    try {
      const body = JSON.stringify({ accion: 'inactivar' });
      console.log('📦 enviando:', body);  // ← antes del fetch
      const res = await fetch(`${API_BASE}/api/eventos/${id}/`, {
        method:      'PATCH',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEvents((prev) =>
        prev.map((e) => e.id === id ? { ...e, status: 'inactive' } : e)
      );
    } catch (e: any) {
      console.error('Error al desactivar evento:', e.message);
    }
  }, []);

  return { events, isLoading, error, fetchEvents, deactivateEvent };
}