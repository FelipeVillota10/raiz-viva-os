// viewmodels/events/useEditEvent.ts
import { useState, useCallback } from 'react';
import type { WizardFormData } from './useEventWizard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface UseEditEventReturn {
  loadEvent:   (id: string) => Promise<WizardFormData | null>;
  updateEvent: (id: string, data: WizardFormData) => Promise<void>;
  inactivarEvent: (id: string) => Promise<void>;
  publicarEvent:  (id: string) => Promise<void>;
  isLoading:   boolean;
  submitError: string | null;
}

export function useEditEvent(): UseEditEventReturn {
  const [isLoading,   setIsLoading]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadEvent = useCallback(async (id: string): Promise<WizardFormData | null> => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE}/api/eventos/${id}/`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const item = await res.json();

      // Mapea los campos del backend al formato del wizard
      const fechaInicio = new Date(item.fecha_inicio);
      const fechaFin    = new Date(item.fecha_fin);

      return {
        imageFile:       null,
        imagePreviewUrl: item.imagen ?? null,
        name:            item.nombre        ?? '',
        startDate:       fechaInicio.toISOString().split('T')[0],
        startTime:       fechaInicio.toTimeString().slice(0, 5),
        endDate:         fechaFin.toISOString().split('T')[0],
        endTime:         fechaFin.toTimeString().slice(0, 5),
        locationName:    '',   // no existe en el modelo aún
        locationAddress: '',
        description:     item.descripcion   ?? '',
        pricingType:     item.es_gratuito ? 'free' : 'paid',
        price:           item.costo_evento  ? String(item.costo_evento) : '',
        currency:        'COP',
        capacity:        item.capacidad     ? String(item.capacidad) : '',
        category:        item.id_categoria?.id ?? '',
      };
    } catch (err) {
      setSubmitError('Error al cargar el evento');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (id: string, data: WizardFormData) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre',       data.name);
      formDataToSend.append('descripcion',  data.description);
      formDataToSend.append('costo_evento', data.pricingType === 'paid' ? data.price : '0');
      formDataToSend.append('es_gratuito',  data.pricingType === 'free' ? 'true' : 'false');
      formDataToSend.append('capacidad',    data.capacity);
      formDataToSend.append('fecha_inicio', `${data.startDate}T${data.startTime || '00:00'}`);
      formDataToSend.append('fecha_fin',    `${data.endDate || data.startDate}T${data.endTime || '00:00'}`);
      formDataToSend.append('id_categoria', String(data.category));

      if (data.imageFile) {
        formDataToSend.append('imagen', data.imageFile);
      }

      const res = await fetch(`${API_BASE}/api/eventos/${id}/`, {
        method:      'PUT',
        credentials: 'include',
        body:        formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
      }
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Error al actualizar el evento.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const inactivarEvent = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/eventos/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'inactivar' }),
      });
      if (!res.ok) throw new Error('Error al inactivar');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const publicarEvent = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/eventos/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'publicar' }),
      });
      if (!res.ok) throw new Error('Error al publicar');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { loadEvent, updateEvent, inactivarEvent, publicarEvent, isLoading, submitError };
}