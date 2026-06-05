// viewmodels/events/useEventList.ts
import { useState, useEffect, useCallback } from 'react';

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

export const EVENTS_STORAGE_KEY = 'raiz_viva_events';

export function getStoredEvents(): EventListItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveStoredEvents(events: EventListItem[]): void {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

export function useEventList() {
  const [events,    setEvents]    = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setEvents(getStoredEvents());
    } catch {
      setError('Error al cargar los eventos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const deactivateEvent = useCallback(async (id: string) => {
    setEvents((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, status: 'inactive' as const } : e
      );
      saveStoredEvents(updated);
      return updated;
    });
    // TODO: PATCH http://localhost:8000/api/events/${id}/
  }, []);

  return { events, isLoading, error, fetchEvents, deactivateEvent };
}