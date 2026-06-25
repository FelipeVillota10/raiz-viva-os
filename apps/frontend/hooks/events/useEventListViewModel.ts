// viewmodels/events/useEventListViewModel.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  image:       string | null;
}

export function useEventListViewModel(actorId?: number) {
  const [events,    setEvents]    = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE}/api/eventos/`);
      if (actorId) url.searchParams.append('actor', String(actorId));

      const res = await fetch(url.toString(), {
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
        status:      item.id_estado?.nombre_estado ?? (
                       item.id_estado === 11 ? 'Borrador'
                     : item.id_estado === 6 ? 'en_revisión'
                     : item.id_estado === 8 ? 'aprobado'
                     : item.id_estado === 10 ? 'inactivo'
                     : 'Borrador'
                   ),
        image:       item.imagen ?? null,
      }));

      setEvents(mapped);
    } catch (e: any) {
      setError('Error al cargar los eventos: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  }, [actorId]);

  useEffect(() => { 
    if (actorId !== undefined) {
      fetchEvents(); 
    }
  }, [fetchEvents, actorId]);

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

  const cancelSubmit = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/eventos/${id}/`, {
        method:      'PATCH',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'cancelar_envio' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEvents((prev) =>
        prev.map((e) => e.id === id ? { ...e, status: 'Borrador' } : e)
      );
    } catch (e: any) {
      console.error('Error al cancelar envío:', e.message);
    }
  }, []);

  const submitEvent = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/eventos/${id}/`, {
        method:      'PATCH',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'publicar' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEvents((prev) =>
        prev.map((e) => e.id === id ? { ...e, status: 'en_revisión' } : e)
      );
    } catch (e: any) {
      console.error('Error al solicitar revisión:', e.message);
    }
  }, []);

  return { events, isLoading, error, fetchEvents, deactivateEvent, cancelSubmit, submitEvent };
}
