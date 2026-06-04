// viewmodels/events/useCreateEvent.ts
// Hook para crear un evento (POST /api/events).
// Actualmente usa mock — preparado para integración real con Django.

import { useState, useCallback } from 'react';
import type { WizardFormData } from './useEventWizard';

interface UseCreateEventReturn {
  createEvent:  (data: WizardFormData) => Promise<void>;
  isLoading:    boolean;
  submitError:  string | null;
}

// ────────────────────────────────────────────
// reemplazar con llamada real a events.service.ts cuando el backend esté disponible

async function mockCreateEvent(data: WizardFormData): Promise<{ id: string }> {
  const formData = new FormData();

  formData.append('nombre',       data.name);
  formData.append('descripcion',  data.description);
  formData.append('fecha_inicio', `${data.startDate}T${data.startTime}:00`);
  formData.append('fecha_fin',    `${data.endDate || data.startDate}T${data.endTime || data.startTime}:00`);
  formData.append('capacidad',    data.capacity);
  formData.append('es_gratuito',  String(data.pricingType === 'free'));
  formData.append('costo_evento', data.pricingType === 'paid' ? data.price : '0');

  if (data.imageFile) {
  formData.append('imagen', data.imageFile);
}

  const response = await fetch('http://localhost:8000/api/eventos/', {
    method: 'POST',
    // ⚠️ Sin Content-Type — el browser lo setea solo con el boundary
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al guardar el evento');
  }

  return response.json();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCreateEvent(): UseCreateEventReturn {
  const [isLoading,   setIsLoading]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createEvent = useCallback(async (data: WizardFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      await mockCreateEvent(data);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Ocurrió un error al guardar el evento. Intenta nuevamente.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createEvent, isLoading, submitError };
}